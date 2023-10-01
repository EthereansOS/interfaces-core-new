import { getLogs, abi, VOID_ETHEREUM_ADDRESS, formatMoney, fromDecimals, toDecimals, getNetworkElement, blockchainCall, web3Utils, sendAsync, tryRetrieveMetadata, VOID_BYTES32, numberToString } from "interfaces-core"
import { loadTokenFromAddress } from "./erc20"

import { getRawField } from './generalReader'

export async function allRoutines(data) {
    const { context, chainId, web3, getGlobalContract } = data
    const args = {
        address : (await blockchainCall(getGlobalContract("factoryOfFactories").methods.get, getNetworkElement({ context, chainId }, "factoryIndices").fixedInflation)).factoryList,
        topics: [
            web3Utils.sha3('Deployed(address,address,address,bytes)')
        ],
        fromBlock: web3Utils.toHex(getNetworkElement({ context, chainId }, 'deploySearchStart')) || "0x0",
        toBlock: 'latest'
    }
    const logs = await getLogs(web3.currentProvider, args)

    var routineContractsAddresses = logs.map(it => abi.decode(["address"], it.topics[2])[0])

    var deployedRoutinesToExclude = [...context.deployedRoutinesToExclude].map(web3Utils.toChecksumAddress)

    routineContractsAddresses = routineContractsAddresses.filter(it => deployedRoutinesToExclude.indexOf(it) === -1)

    const routines = await Promise.all(routineContractsAddresses.map(it => getRoutine({ ...data, lightweight : true }, it)))
    return chainId !== 1 ? routines : [await getRoutine({...data, lightweight : true}, getNetworkElement({ context, chainId }, 'hardcabledRoutineAddress')), ...routines]
}

export async function getRoutine(data, address) {
    const { context, chainId, newContract, lightweight } = data

    if(web3Utils.toChecksumAddress(address) === web3Utils.toChecksumAddress(getNetworkElement({ context, chainId }, 'hardcabledRoutineAddress'))) {
        return await getHardcabledRoutine(data)
    }

    const contract = newContract(context.NewFixedInflationABI, address)
    const extensionAddress = await blockchainCall(contract.methods.host)
    const extension = newContract(context.FixedInflationExtensionABI, extensionAddress)
    const { host } = await blockchainCall(extension.methods.data)
    var entry = { ...(await blockchainCall(contract.methods.entry)) }

    entry = {
        entry : entry[0],
        operations : entry[1]
    }

    if(!lightweight) {

    }

    return {
        key : address,
        address,
        contract,
        extensionAddress,
        extension,
        host,
        ...entry
    }
}

export async function getHardcabledRoutine(data) {

    const { web3, context, chainId, newContract, block } = data

    const address = getNetworkElement({ context, chainId }, 'hardcabledRoutineAddress')

    const contract = newContract(context.OSFixedInflationManagerABI, address)
    const extensionAddress = await blockchainCall(contract.methods.host)
    const extension = newContract(context.FixedInflationExtensionABI, extensionAddress)
    const host = extensionAddress

    const entry = {
        name : "Ethereans (OS) Inflation",
        blockInterval : abi.decode(["uint256"], await getRawField({ provider : web3.currentProvider }, address, 'swapToETHInterval'))[0].toString(),
        lastBlock : abi.decode(["uint256"], await getRawField({ provider : web3.currentProvider }, address, 'lastSwapToETHBlock'))[0].toString(),
        callerRewardPercentage : abi.decode(["uint256"], await getRawField({ provider : web3.currentProvider }, address, 'executorRewardPercentage'))[0].toString()
    }
    const period = Object.values(context.blockIntervals).filter(value => value === entry.blockInterval)
    const oneHundred = numberToString(1e18)
    const executorReward = formatMoney(parseFloat(fromDecimals(entry.callerRewardPercentage, 18, true)) * 100)
    var blockNumber = parseInt(block)
    var nextBlock = parseInt(entry.lastBlock) + parseInt(entry.blockInterval)
    nextBlock = nextBlock <= parseInt(entry.blockInterval) ? 0 : nextBlock

    var lastInflationPerDay = abi.decode(["uint256"], await getRawField({ provider : web3.currentProvider }, address, 'lastInflationPerDay'))[0].toString()
    var tokenReceiverPercentage = abi.decode(["uint256"], await getRawField({ provider : web3.currentProvider }, address, 'tokenReceiverPercentage'))[0].toString()

    const inputTokenAddress = abi.decode(["address", "address"], await getRawField({ provider : web3.currentProvider }, address, 'tokenInfo'))[0].toString()

    const inputToken = await loadTokenFromAddress(data, inputTokenAddress)

    var perc = parseFloat(fromDecimals(tokenReceiverPercentage, 18, true))
    const tokenReceiverAmount = numberToString(parseInt(lastInflationPerDay) * perc).split('.')[0]

    const tokenSwapAmount = lastInflationPerDay.ethereansosSub(tokenReceiverAmount)

    const amm = {
        info: ["UniV3", "1"],
        data: [getNetworkElement({ chainId, context }, "wethTokenAddress")]
    }

    const destination = abi.decode(["address", "address", "uint256"], await getRawField({ provider : web3.currentProvider }, address, 'destination'))

    var perc = parseFloat(fromDecimals(destination[2].toString(), 18, true))

    var nervAmount = numberToString(parseInt(lastInflationPerDay) * perc).split('.')[0]
    var commonTreasuryAmount = tokenSwapAmount.ethereansosSub(nervAmount)

    perc = parseInt(commonTreasuryAmount) / parseInt(tokenSwapAmount)
    perc = toDecimals(perc, 18)

    const operations = [{
        inputTokenAddress,
        inputToken,
        inputTokenAmount : tokenReceiverAmount,
        inputTokenAmountIsPercentage : false,
        inputTokenAmountIsByMint : true,
        ammPlugin : VOID_ETHEREUM_ADDRESS,
        liquidityPoolAddresses : [],
        swapPath : [],
        enterInETH : false,
        exitInETH : false,
        receivers : [
            "0x3889ABE350A054701e8ea55055CcD960cB4cB91a"
        ],
        receiversPercentages : []
    }, {
        inputTokenAddress,
        inputToken,
        inputTokenAmount : tokenSwapAmount,
        inputTokenAmountIsPercentage : false,
        inputTokenAmountIsByMint : true,
        ammPlugin : context.uniswapV3SwapRouterAddress,
        amm,
        liquidityPoolAddresses : [
            "0xccc42cf5d6a2f3ed8f948541455950ed6ce14707"
        ],
        swapPath : [
            amm.data[0]
        ],
        swapTokens : [
            await loadTokenFromAddress(data, VOID_ETHEREUM_ADDRESS)
        ],
        enterInETH : false,
        exitInETH : true,
        receivers : [
            "0x06C5CB470b9923bcB780150F96c3968C2C0f76F6",
            destination[1]
        ],
        receiversPercentages : [
            perc
        ]
    },]

    return {
        key : address,
        address,
        contract,
        extensionAddress,
        extension,
        host,
        loaded : true,
        period: period[0],
        executorReward,
        entry,
        operations,
        executable: false && blockNumber >= nextBlock,
        active : true,
        contract,
        oneHundred,
        nextBlock,
        async execute(addr) {
            return await blockchainCall(contract.methods.swapToETH, await contract.methods.swapToETH('1', VOID_ETHEREUM_ADDRESS).call(), addr)
        }
    }

}