import { abi, VOID_ETHEREUM_ADDRESS, uploadMetadata, formatLink, fromDecimals, isEthereumAddress, getNetworkElement, blockchainCall, web3Utils, sendAsync, tryRetrieveMetadata, VOID_BYTES32, numberToString, toEthereumSymbol } from "@ethereansos/interfaces-core"
import { loadTokenFromAddress } from "./erc20"
import {
    tickToPrice,
    nearestUsableTick,
    TICK_SPACINGS,
    TickMath
} from '@uniswap/v3-sdk/dist/'
import { Token } from "@uniswap/sdk-core/dist"
import { getLogs } from '../logic/logger'

async function getFactory(data, generation) {
    const { context, chainId, getGlobalContract } = data
    var factoryAddress = (await blockchainCall(getGlobalContract("factoryOfFactories").methods.get, getNetworkElement({ context, chainId }, "factoryIndices")[generation === 'gen1' ? "farmingGen1" : "farming"])).factoryList
    return factoryAddress.map(web3Utils.toChecksumAddress)
}

export async function allFarmings(data, factoryAddress, generation) {

    const { context, chainId, web3, mode, account, rewardTokenAddress, lightweight } = data

    if(!generation) {
        return (await Promise.all([
            [await getFactory(data, "gen2"), 'gen2'],
            [await getFactory(data, "gen1"), 'gen1']
        ].map(it => allFarmings(data, it[0], it[1])))).reduce((all, it) => [...all, ...it], [])
    }

    var args = {
        address: factoryAddress || getNetworkElement({ context, chainId }, generation === 'gen2' ? "farmGen2FactoryAddress" : "farmFactoryAddress"),
        topics: [
            web3Utils.sha3('Deployed(address,address,address,bytes)')
        ],
        fromBlock: web3Utils.toHex(getNetworkElement({ context, chainId }, 'deploySearchStart') || '0x0'),
        toBlock : 'latest'
    }

    if(!args.address || args.address.length === 0) {
        return []
    }

    var farmingContractAddresses = (await getLogs(web3.currentProvider, 'eth_getLogs', args)).map(it => abi.decode(["address"], it.topics[2])[0])

    if(farmingContractAddresses.length === 0) {
        return []
    }

    if(rewardTokenAddress) {
        args.address = farmingContractAddresses
        args.topics = [
            web3Utils.sha3('RewardToken(address)'),
            abi.encode(["address"], [rewardTokenAddress])
        ]
        farmingContractAddresses = (await getLogs(web3.currentProvider, 'eth_getLogs', args)).map(it => it.address)
        farmingContractAddresses = farmingContractAddresses.filter((it, index, array) => array.indexOf(it) === index)
        if(lightweight) {
            return farmingContractAddresses
        }
    }

    if(farmingContractAddresses.length === 0) {
        return []
    }

    const positionIds = {}
    if(mode === 'positions') {
        const events = await getLogs(web3.currentProvider, 'eth_getLogs', {
            address: farmingContractAddresses,
            topics: [
                web3Utils.sha3("Transfer(uint256,address,address)"),
                [],
                [],
                abi.encode(["address"], [account])
            ],
            fromBlock: web3Utils.toHex(getNetworkElement({ context, chainId }, 'deploySearchStart') || '0x0'),
            toBlock: 'latest'
        })
        events.forEach(it => (positionIds[it.address] = positionIds[it.address] || []).push(abi.decode(["uint256"], it.topics[1])[0].toString()))
        farmingContractAddresses = Object.keys(positionIds)
    }

    var farmingContracts = await Promise.all(farmingContractAddresses.map(it => getFarming({ ...data, lightweight : true, positionIds : positionIds[it] }, it, generation)))

    farmingContracts = farmingContracts.filter(it => it)

    return farmingContracts
}

export async function getFarming(data, address, generation) {

    const { context, chainId, newContract, lightweight, positionIds, account, mode, block } = data

    generation = generation || await getFarmingContractGenerationByAddress(data, address)

    const contract = newContract(context[generation === 'gen2' ? "NewFarmingABI" : "FarmMainGen1ABI"], address)
    var farmTokenCollection
    try {
        farmTokenCollection = newContract(context.INativeV1ABI, await blockchainCall(contract.methods._farmTokenCollection))
    } catch(e) {}
    const extensionAddress = await blockchainCall(contract.methods.host)
    const extensionContract = newContract(context[generation === 'gen2' ? "FarmExtensionGen2ABI" : "FarmExtensionGen1ABI"], extensionAddress)
    const { host, byMint } = await blockchainCall(extensionContract.methods.data)

    if(mode === 'hosted' && host !== account) {
        return
    }

    const rewardTokenAddress = await blockchainCall(contract.methods._rewardTokenAddress)
    const rewardToken = await loadTokenFromAddress(data, rewardTokenAddress)
    const extensionBalance = await blockchainCall(rewardToken.contract.methods.balanceOf, extensionAddress)
    const setups = (await blockchainCall(contract.methods.setups)).map((it, i) => ({ ...it, setupIndex : i.toString() }))
    const freeSetups = []
    const lockedSetups = []
    var totalFreeSetups = 0
    var totalLockedSetups = 0
    var rewardPerBlock = 0

    await Promise.all(setups.map(async (setup, i) => {
        const {'0': s, '1': setupInfo} = await loadFarmingSetup(data, contract, i)
        setup.setupInfo = setupInfo
        setup.canActivateSetup = parseInt(setupInfo.renewTimes) > 0 && !setup.active && parseInt(setupInfo.lastSetupIndex) === parseInt(i)
        if (!byMint && setup.rewardPerBlock !== "0") {
            setup.canActivateSetup = setup.canActivateSetup && (parseInt(extensionBalance) >= (parseInt(setup.rewardPerBlock) * parseInt(setupInfo.blockDuration)))
        }
        if (setup.active && (parseInt(setup.endBlock) > block)) {
            setupInfo.free ? freeSetups.push(setup) : lockedSetups.push(setup)
            rewardPerBlock += parseInt(setup.rewardPerBlock)
        }
        if (setup.rewardPerBlock !== "0") {
            setupInfo.free ? totalFreeSetups += 1 : totalLockedSetups += 1
        }
    }))

    const positions = []
    if(positionIds && positionIds.length > 0) {
        for (const positionId of positionIds) {
            if (positions.filter(it => it.positionId === positionId).length !== 0) {
                continue
            }
            try {
                var position = await loadFarmingPosition(data, contract, positionId)
                position = { ...position, positionId }
                var {'0': setup, '1': setupInfo} = await loadFarmingSetup(data, contract, position.setupIndex)
                setup = { ...setup, setupIndex : position.setupIndex, setupInfo, free : setupInfo.free || generation === 'gen2', generation }
                isValidPosition(data, position) && positions.push({ positionId, ...position, ...setup, setup, setupInfo, contract, generation })
            } catch(e) {
                console.log(e)
            }
        }
        if (farmTokenCollection) {
            const farmTokenEvents = await contract.getPastEvents('FarmToken', { fromBlock: web3Utils.toHex(getNetworkElement({ context, chainId }, 'deploySearchStart') || '0x0') })
            for (const farmTokenEvent of farmTokenEvents) {
                try {
                    const { returnValues } = farmTokenEvent
                    const { objectId, setupIndex } = returnValues
                    if (positions.filter(it => it.setupIndex === setupIndex).length !== 0) {
                        continue
                    }
                    const { '0': setup, '1': setupInfo } = await loadFarmingSetup(data, contract, setupIndex)
                    const balance = await blockchainCall(farmTokenCollection.methods.balanceOf, account, objectId)
                    parseInt(balance) > 0 && positions.push({...setup, contract, setupInfo, setupIndex, generation })
                } catch(e) {
                    console.log(e)
                }
            }
        }
        if(positions.length === 0) {
            return
        }
    }

    var isRegular = null

    try {
        isRegular = generation === 'gen2' && (await getFactory(data)).indexOf(await blockchainCall(contract.methods.initializer)) !== -1
    } catch(e) {
    }

    var entry = {
        key : address,
        address,
        contract,
        farmTokenCollection,
        extensionAddress,
        extensionContract,
        host,
        byMint,
        generation,
        positionIds,
        positions,
        rewardTokenAddress,
        rewardToken,
        setups,
        freeSetups,
        lockedSetups,
        totalFreeSetups,
        totalLockedSetups,
        rewardPerBlock,
        isRegular
    }

    if(!lightweight) {

    }

    return entry
}

export async function getFarmingContractGenerationByAddress(data, address) {

    const { context, chainId, web3 } = data

    const gen1Factories = await getFactory(data, "gen1")

    const args = {
        address : gen1Factories.concat(await getFactory(data, "gen2")),
        topics: [
            web3Utils.sha3('Deployed(address,address,address,bytes)'),
            [],
            abi.encode(["address"], [address])
        ],
        fromBlock : web3Utils.toHex(getNetworkElement({ context, chainId }, 'deploySearchStart')) || "0x0",
        toBlock: 'latest'
    }

    const log = await getLogs(web3.currentProvider, 'eth_getLogs', args)

    return gen1Factories.indexOf(web3Utils.toChecksumAddress(log[0].address)) !== -1 ? 'gen1' : 'gen2'
}

export async function loadFarmingPositions(data, farming) {

    const positions = []

    const { context, web3, chainId, account, newContract } = data

    const contract = farming.contract

    const events = await getLogs(web3.currentProvider, 'eth_getLogs', {
        address: farming.address,
        topics: [
            web3Utils.sha3("Transfer(uint256,address,address)"),
            [],
            [],
            abi.encode(["address"], [account])
        ],
        fromBlock: web3Utils.toHex(getNetworkElement({ context, chainId }, 'deploySearchStart') || '0x0'),
        toBlock: 'latest'
    })


    return positions
}

export async function loadFarmingSetup(data, contract, i) {

    const { web3 } = data

    try {
        return await blockchainCall(contract.methods.setup, i)
    } catch(e) {
    }

    var models = {
        setup : {
            types : [
                "uint256",
                "bool",
                "uint256",
                "uint256",
                "uint256",
                "uint256",
                "uint256",
                "uint256"
            ],
            names : [
                "infoIndex",
                "active",
                "startBlock",
                "endBlock",
                "lastUpdateBlock",
                "objectId",
                "rewardPerBlock",
                "totalSupply"
            ]
        },
        info : {
            types : [
                "bool",
                "uint256",
                "uint256",
                "uint256",
                "uint256",
                "uint256",
                "address",
                "address",
                "address",
                "address",
                "bool",
                "uint256",
                "uint256",
                "uint256"
            ],
            names : [
                "free",
                "blockDuration",
                "originalRewardPerBlock",
                "minStakeable",
                "maxStakeable",
                "renewTimes",
                "ammPlugin",
                "liquidityPoolTokenAddress",
                "mainTokenAddress",
                "ethereumAddress",
                "involvingETH",
                "penaltyFee",
                "setupsCount",
                "lastSetupIndex"
            ]
        }
    }
    var data = await web3.eth.call({
        to : contract.options.address,
        data : contract.methods.setup(i).encodeABI()
    })
    var types = [
        `tuple(${models.setup.types.join(',')})`,
        `tuple(${models.info.types.join(',')})`
    ]
    try {
        data = abi.decode(types, data)
    } catch(e) {
    }
    var setup = {}
    for(var i in models.setup.names) {
        var name = models.setup.names[i]
        var value = data[0][i]
        value !== true && value !== false && value && (value = value && value.toString())
        setup[name] = value
    }
    var info = {}
    for(var i in models.info.names) {
        var name = models.info.names[i]
        var value = data[1][i]
        value !== true && value !== false && value && (value = value && value.toString())
        info[name] = value
    }
    info.startBlock = info.startBlock || "0"
    return [setup, info]
}

export function isValidPosition(data, position) {

    const { account } = data

    return position.uniqueOwner !== VOID_ETHEREUM_ADDRESS && position.creationBlock !== '0' && position.uniqueOwner.toLowerCase() === account.toLowerCase()
}

export async function loadFarmingPosition(data, farmingContract, positionId) {

    const { context, newContract, chainId } = data

    var originalPosition = await blockchainCall(farmingContract.methods.position, positionId || 0)
    var position = {
        liquidityPoolTokenAmount : '0'
    }
    Object.entries(originalPosition).forEach(it => position[it[0]] = it[1])
    try {
        position.tokenId = position.liquidityPoolTokenAmount
        var uniswapV3NonfungiblePositionManager = newContract(context.UniswapV3NonfungiblePositionManagerABI, getNetworkElement({ context, chainId }, 'uniswapV3NonfungiblePositionManagerAddress'))
        position.liquidityPoolTokenAmount = await blockchainCall(uniswapV3NonfungiblePositionManager.methods.positions, position.tokenId)
        position.liquidityPoolTokenAmount = position.liquidityPoolTokenAmount.liquidity
    } catch(e) {
        delete position.tokenId
    }
    return position
}

export async function addLiquidityGen2(data) {
    const { test, setup, lpTokenAmount, receiver, setupTokens, inputType, setupInfo, ethereumAddress, tokenAmounts, element, currentPosition, prestoData, chainId, account, context, amountsMin } = data
    if (!lpTokenAmount) return
    const stake = {
        setupIndex : setup.setupIndex,
        amount: 0,
        amountIsLiquidityPool: inputType === 'add-lp' ? true : false,
        positionOwner: receiver && isEthereumAddress(receiver) ? receiver : VOID_ETHEREUM_ADDRESS,
    }

    var ethTokenIndex = null
    var ethTokenValue = 0
    var mainTokenIndex = 0
    await Promise.all(setupTokens.map(async (token, i) => {
        if (setupInfo.involvingETH && token.address === VOID_ETHEREUM_ADDRESS) {
            ethTokenIndex = i
        }
        if (token.address === setupInfo.mainTokenAddress || setupInfo.involvingETH && token.address === VOID_ETHEREUM_ADDRESS && setupInfo.mainTokenAddress === ethereumAddress) {
            mainTokenIndex = i
        }
    }))
    var lpAmount = numberToString(lpTokenAmount.full || lpTokenAmount)
    stake.amount = numberToString(stake.amountIsLiquidityPool ? lpAmount : tokenAmounts[mainTokenIndex].full || tokenAmounts[mainTokenIndex])
    ethTokenValue = ethTokenIndex === undefined || ethTokenIndex === null ? "0" : numberToString(tokenAmounts[ethTokenIndex].full || tokenAmounts[ethTokenIndex])
    var value = setupInfo.involvingETH && !stake.amountIsLiquidityPool ? ethTokenValue : "0"
    stake.amount0 = tokenAmounts[0].full || tokenAmounts[0]
    stake.amount1 = tokenAmounts[1].full || tokenAmounts[1]
    stake.amount0Min = amountsMin[0].full || amountsMin[0]
    stake.amount1Min = amountsMin[1].full || amountsMin[1]
    if (prestoData) {
        console.log('using presto!')
        var sendingOptions = { from: account, value: prestoData.ethValue, gasLimit: 9999999 }
        sendingOptions.gasLimit = await prestoData.transaction.estimateGas(sendingOptions)
        sendingOptions.gasLimit = parseInt(sendingOptions.gasLimit * (getNetworkElement({ context, chainId }, "farmGasMultiplier") || 1))
        sendingOptions.gas = sendingOptions.gasLimit
        await prestoData.transaction.send(sendingOptions)
    } else {
        if (!currentPosition) {
            if(test) {
                try {
                    await element.contract.methods.openPosition(stake).call({ from: account, value })
                } catch(e) {
                    if((e.message || e).toLowerCase().indexOf('min stakeable unreached') !== -1) {
                        return false
                    }
                    console.log(e)
                }
                return true
            }
            await blockchainCall(element.contract.methods.openPosition, stake, { value })
        } else if (currentPosition) {
            if(test) {
                try {
                    await element.contract.methods.addLiquidity(currentPosition.positionId, stake).call({ from: account, value })
                } catch(e) {
                    if((e.message || e).toLowerCase().indexOf('min stakeable unreached') !== -1) {
                        return false
                    }
                    console.log(e)
                }
                return true
            }
            await blockchainCall(element.contract.methods.addLiquidity, currentPosition.positionId, stake, { value })
        }
    }
}

export async function getFarmingSetupInfo(data, element) {

    var list = []

    list = element.setups.map(it => it.setupInfo)

    list = list.filter(it => list.filter(e => e.lastSetupIndex === it.lastSetupIndex)[0] === it)

    list = await Promise.all(list.map(async it => {
        const mainToken = await loadTokenFromAddress(data, it.mainTokenAddress)

        var gen2SetupType = "concentrated"

        console.log(TickMath.MAX_TICK, TickMath.MIN_TICK)

        const liquidityPoolToken = await findLiquidityPoolToken(data, element.generation, it.liquidityPoolTokenAddress, gen2SetupType)

        return {
            ...it,
            liquidityPoolToken,
            free : true,
            mainToken,
            editing : true,
            disable : false,
            rewardPerBlock : it.originalRewardPerBlock,
            initialRewardPerBlock : it.originalRewardPerBlock,
            initialRenewTimes : it.renewTimes,
            lastSetup : element.setups[it.lastSetupIndex],
            data : liquidityPoolToken
        }
    }))

    return list
}

export function findLiquidityPoolToken(data, generation, address, gen2SetupType) {
    return address && isEthereumAddress(address) ? generation === 'gen1' ? findLiquidityPoolTokenGen1(data, address) : findLiquidityPoolTokenGen2(data, address, gen2SetupType) : undefined
}

export async function findLiquidityPoolTokenGen1(data, address) {

    const { context, newContract, chainId } = data

    const ammAggregator = newContract(context.AMMAggregatorABI, getNetworkElement({ context, chainId}, 'ammAggregatorAddress'))
    const res = await blockchainCall(ammAggregator.methods.info, address)
    const name = res['name']
    const ammAddress = res['amm']
    const ammContract = newContract(context.AMMABI, ammAddress)
    const ammData = await blockchainCall(ammContract.methods.data)
    const lpInfo = await blockchainCall(ammContract.methods.byLiquidityPool, address)
    const tokens = []
    var ethTokenFound = false
    var involvingETH = false
    var ethereumAddress = VOID_ETHEREUM_ADDRESS
    var ethSelectData = null
    await Promise.all(lpInfo[2].map(async tkAddress => {
        if (tkAddress.toLowerCase() === ammData[0].toLowerCase()) {
            involvingETH = true
            ethTokenFound = true
            ethereumAddress = ammData[0]
            if (ammData[0] !== VOID_ETHEREUM_ADDRESS) {
                const notEthToken = newContract(context.ERC20ABI, ammData[0])
                const notEthTokenSymbol = await blockchainCall(notEthToken.methods.symbol)
                ethSelectData = { symbol: notEthTokenSymbol }
            }
        }
        const currentToken = newContract(context.ERC20ABI, tkAddress)
        const symbol = tkAddress === VOID_ETHEREUM_ADDRESS || tkAddress === ammData[0] ? "ETH" : await blockchainCall(currentToken.methods.symbol)
        var name = tkAddress === VOID_ETHEREUM_ADDRESS || tkAddress === ammData[0] ? "Ethereum" : await blockchainCall(currentToken.methods.name)
        var decimals = parseInt(tkAddress === VOID_ETHEREUM_ADDRESS ? "18" : await blockchainCall(currentToken.methods.decimals))
        tokens.push({ symbol, name, decimals, address: tkAddress, isEth: tkAddress.toLowerCase() === ammData[0].toLowerCase() })
    }))
    ethSelectData = ethTokenFound ? ethSelectData : null
    return {
        address,
        name,
        tokens,
        poolContract : newContract(context.ERC20ABI, address),
        ethTokenFound,
        involvingETH,
        ethereumAddress,
        ethSelectData,
        ammPlugin : ammAddress
    }
}

export async function findLiquidityPoolTokenGen2(data, address, gen2SetupType) {

    const { context, newContract, chainId } = data

    const dilutedTickRange = context.dilutedTickRange
    const poolContract = newContract(context.UniswapV3PoolABI, address)
    var fee = await blockchainCall(poolContract.methods.fee)
    var tick = parseInt((await blockchainCall(poolContract.methods.slot0)).tick)
    var tickLower = nearestUsableTick(tick, TICK_SPACINGS[fee])
    var tickUpper = tickLower
    if(gen2SetupType === 'diluted') {
        tickLower -= dilutedTickRange
        tickUpper += dilutedTickRange
    }
    var realTickLower = nearestUsableTick(tickLower, TICK_SPACINGS[fee])
    var realTickUpper = nearestUsableTick(tickUpper, TICK_SPACINGS[fee])
    console.log({
        tick : nearestUsableTick(tick, TICK_SPACINGS[fee]),
        tickLower,
        tickUpper
    })

    const lpInfo = [
        [], [], [
            await blockchainCall(poolContract.methods.token0),
            await blockchainCall(poolContract.methods.token1)
        ]
    ]
    const ammData = [
        await blockchainCall((newContract(context.UniswapV3NonfungiblePositionManagerABI, getNetworkElement({ context, chainId }, 'uniswapV3NonfungiblePositionManagerAddress'))).methods.WETH9)
    ]
    const tokens = []
    var uniTokens = []
    let ethTokenFound = false
    var involvingETH = false
    var ethereumAddress
    var ethSelectData = null
    await Promise.all(lpInfo[2].map(async (tkAddress) => {
        if (tkAddress.toLowerCase() === ammData[0].toLowerCase()) {
            involvingETH = true
            ethTokenFound = true
            ethereumAddress = ammData[0]
            if (ammData[0] !== VOID_ETHEREUM_ADDRESS) {
                const notEthToken = newContract(context.ERC20ABI, ammData[0])
                const notEthTokenSymbol = await blockchainCall(notEthToken.methods.symbol)
                ethSelectData = { symbol: notEthTokenSymbol }
            }
        }
        const currentToken = newContract(context.ERC20ABI, tkAddress)
        const symbol = tkAddress === VOID_ETHEREUM_ADDRESS || tkAddress === ammData[0] ? "ETH" : await blockchainCall(currentToken.methods.symbol)
        var name = tkAddress === VOID_ETHEREUM_ADDRESS || tkAddress === ammData[0] ? "Ethereum" : await blockchainCall(currentToken.methods.name)
        var decimals = parseInt(tkAddress === VOID_ETHEREUM_ADDRESS ? "18" : await blockchainCall(currentToken.methods.decimals))
        tokens.push({ symbol, name, decimals, address: tkAddress, isEth: tkAddress.toLowerCase() === ammData[0].toLowerCase() })
        var uniToken = new Token(chainId, tkAddress, decimals, name, symbol)
        uniTokens.push(uniToken)
    }))
    ethSelectData = ethTokenFound ? ethSelectData : null
    return {
        address,
        name: 'Uniswap V3',
        tokens,
        poolContract,
        fee,
        tick,
        ethTokenFound,
        involvingETH,
        ethereumAddress,
        realTickLower,
        realTickUpper,
        ethSelectData,
        uniTokens
    }
}