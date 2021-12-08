import { blockchainCall, web3Utils, sendAsync, getNetworkElement, numberToString, VOID_ETHEREUM_ADDRESS, formatLink, abi, fromDecimals } from "@ethereansos/interfaces-core"

import { getRawField } from './generalReader'

export async function getUniswapV3AMMForSwap({context, chainId, newContract}) {
    var ammAggregatorAddress = getNetworkElement({context, chainId}, "ammAggregatorAddress")
    var ammAggregator = newContract(context.AMMAggregatorABI, ammAggregatorAddress)
    var address = getNetworkElement({context, chainId}, "uniswapV3SwapRouterAddress")
    var contract = newContract(context.UniswapV3SwapRouterABI, address)
    var amm = {
        address,
        contract,
        ammAggregatorAddress,
        ammAggregator,
        name : 'UniswapV3',
        version : '1',
        ethereumAddress : getNetworkElement({ context, chainId }, 'wethTokenAddress'),
        image : `${process.env.PUBLIC_URL}/img/amms/UniswapV3.png`
    }
    return amm
}

export async function getAMMs({context, chainId, newContract}) {
    var ammAggregatorAddress = getNetworkElement({context, chainId}, "ammAggregatorAddress")
    var ammAggregator = newContract(context.AMMAggregatorABI, ammAggregatorAddress)
    var amms = await Promise.all((await blockchainCall(ammAggregator.methods.amms)).map(async address => {
        var contract = newContract(context.AMMABI, address)
        var amm = {
            ammAggregatorAddress,
            ammAggregator,
            address,
            contract,
            data : {...await blockchainCall(contract.methods.data)},
            info : {...await blockchainCall(contract.methods.info)}
        }
        return {...amm, ...amm.data, ethereumAddress : amm.data[0], name : amm.info[0], version : amm.info[1], image : `${process.env.PUBLIC_URL}/img/amms/${amm.info[0]}.png`}
    }))

    amms.unshift(await getUniswapV3AMMForSwap({context, chainId, newContract}))
    return amms
}

var conversionEncode = {
    "100": "000064",
    "500" : "0001f4",
    "3000" : "000bb8",
    "10000": "002710"
}

async function calculateUniswapV3PriceWithSlippage({ provider, context, chainId }, pool, inputTokenAddress, outputTokenAddress, middleTokenAddress, value, decimals) {

    var path = inputTokenAddress + conversionEncode[pool[0].fee] + (middleTokenAddress || outputTokenAddress).substring(2)

    if(middleTokenAddress) {
        path += (conversionEncode[pool[1].fee] + outputTokenAddress.substring(2))
    }

    var output = await sendAsync(provider, 'eth_call', {
        to : getNetworkElement({ context, chainId }, 'uniswapV3QuoterAddress'),
        data : (web3Utils.sha3('quoteExactInput(bytes,uint256)').substring(0, 10)) + (abi.encode(["bytes", "uint256"], [path, value]).substring(2))
    }, 'latest')

    const swapOutput = abi.decode(['uint256'], output)[0].toString()
    var priceImpact = '0'

    var tokens = [
        inputTokenAddress,
        middleTokenAddress || outputTokenAddress
    ]

    var amounts = [
        abi.decode(['uint256'], await sendAsync(provider, 'eth_call', {
            to : tokens[0],
            data : (web3Utils.sha3('balanceOf(address)').substring(0, 10)) + (abi.encode(["address"], [pool[0].liquidityPoolAddress]).substring(2))
        }, 'latest'))[0].toString(),
        abi.decode(['uint256'], await sendAsync(provider, 'eth_call', {
            to : tokens[1],
            data : (web3Utils.sha3('balanceOf(address)').substring(0, 10)) + (abi.encode(["address"], [pool[0].liquidityPoolAddress]).substring(2))
        }, 'latest'))[0].toString()
    ]

    var inputPosition = 0

    var normalizedInputAmount = parseFloat(fromDecimals(value, decimals[inputPosition], true))

    var normalizedAmounts = [
        parseFloat(fromDecimals(amounts[0], decimals[0], true)),
        parseFloat(fromDecimals(amounts[1], decimals[1], true))
    ]

    var constantProduct = normalizedAmounts[0] * normalizedAmounts[1]

    var newOtherAmount = constantProduct / (normalizedAmounts[inputPosition] + normalizedInputAmount)

    var otherAmountReceived = normalizedAmounts[1 - inputPosition] - newOtherAmount

    var pricePerSingleBeforeSwap = normalizedAmounts[inputPosition] / normalizedAmounts[1 - inputPosition]

    var pricePerSingleAfterSwap = normalizedInputAmount / otherAmountReceived

    priceImpact = numberToString(((pricePerSingleAfterSwap / pricePerSingleBeforeSwap) - 1) * 100)

    return {
        swapOutput,
        priceImpact,
        path
    }
}

export async function calculateUniswapV3SwapOutput({ context, chainId }, input, output, amm, middleTokenAddress) {

    const inputTokenAddress = input.token.address === VOID_ETHEREUM_ADDRESS ? amm.ethereumAddress : input.token.address
    const outputTokenAddress = output.token.address === VOID_ETHEREUM_ADDRESS ? amm.ethereumAddress : output.token.address
    const provider = amm.contract.currentProvider
    const factoryAddress = abi.decode(['address'], await getRawField({ provider }, amm.address, 'factory'))[0]

    var pools = await Promise.all(Object.keys(conversionEncode).map(async fee => ({
        fee,
        liquidityPoolAddress : abi.decode(['address'], await sendAsync(provider, 'eth_call', {
            to : factoryAddress,
            data : (web3Utils.sha3('getPool(address,address,uint24)').substring(0, 10)) + (abi.encode(["address", "address", 'uint24'], [inputTokenAddress, middleTokenAddress || outputTokenAddress, fee]).substring(2))
        }, 'latest'))[0]
    })))
    pools = pools.filter(it => it.liquidityPoolAddress !== VOID_ETHEREUM_ADDRESS)

    if(pools.length === 0) {
        return {swapOutput : '0'}
    }

    if(middleTokenAddress) {
        var otherPools = await Promise.all(Object.keys(conversionEncode).map(async fee => ({
            fee,
            liquidityPoolAddress : abi.decode(['address'], await sendAsync(provider, 'eth_call', {
                to : factoryAddress,
                data : (web3Utils.sha3('getPool(address,address,uint24)').substring(0, 10)) + (abi.encode(["address", "address", 'uint24'], [middleTokenAddress, outputTokenAddress, fee]).substring(2))
            }, 'latest'))[0]
        })))
        otherPools = otherPools.filter(it => it.liquidityPoolAddress !== VOID_ETHEREUM_ADDRESS)

        if(otherPools.length === 0) {
            return {swapOutput : '0'}
        }

        var p = []
        for(var pool of pools) {
            for(var otherPool of otherPools) {
                p.push([
                    pool,
                    otherPool
                ])
            }
        }
        pools = p
    } else {
        pools = pools.map(it => ([it]))
    }

    var decimals = [
        abi.decode(['uint256'], await getRawField({ provider }, inputTokenAddress, 'decimals'))[0].toString(),
        abi.decode(['uint256'], await getRawField({ provider }, middleTokenAddress || outputTokenAddress, 'decimals'))[0].toString()
    ]

    const prices = await Promise.all(pools.map(pool => calculateUniswapV3PriceWithSlippage({ provider, context, chainId }, pool, inputTokenAddress, outputTokenAddress, middleTokenAddress, input.value, decimals)))

    const swapOutputs = prices.map(it => parseInt(it.swapOutput))

    var selected = Math.max.apply(null, swapOutputs);
    selected = swapOutputs.indexOf(selected)
    selected = prices[selected]

    return selected
}

async function calculateAMMBasedSwapOutput({ chainId, context }, input, output, amm, middleTokenAddress) {
    const inputTokenAddress = input.token.address === VOID_ETHEREUM_ADDRESS ? amm.ethereumAddress : input.token.address
    const outputTokenAddress = output.token.address === VOID_ETHEREUM_ADDRESS ? amm.ethereumAddress : output.token.address
    const provider = amm.contract.currentProvider

    var inputTokens = []

    var liquidityPoolAddresses = [
        (await blockchainCall(amm.contract.methods.byTokens, [inputTokenAddress, middleTokenAddress || outputTokenAddress]))[2]
    ]

    if(middleTokenAddress) {
        inputTokens.push(middleTokenAddress)
        liquidityPoolAddresses.push((await blockchainCall(amm.contract.methods.byTokens, [middleTokenAddress, outputTokenAddress]))[2])
    }

    if(liquidityPoolAddresses.filter(it => it === VOID_ETHEREUM_ADDRESS).length > 0) {
        return { swapOutput : '0', priceImpact : 0, liquidityPoolAddresses }
    }

    inputTokens.push(outputTokenAddress)

    var swapOutputArray = await blockchainCall(amm.contract.methods.getSwapOutput, inputTokenAddress, input.value, liquidityPoolAddresses, inputTokens)

    var swapOutput = swapOutputArray[swapOutputArray.length - 1]

    var liquidityPoolAddress = await blockchainCall(amm.contract.methods.byLiquidityPool, liquidityPoolAddresses[liquidityPoolAddresses.length - 1])
    var amounts = liquidityPoolAddress[1]
    var tokens = liquidityPoolAddress[2]
    liquidityPoolAddress = liquidityPoolAddresses[liquidityPoolAddresses.length - 1]

    var inputPosition = tokens[0] === (middleTokenAddress || inputTokenAddress) ? 0 : 1

    var token0Decimals = abi.decode(['uint256'], await getRawField({ provider }, tokens[0], 'decimals'))[0]
    var token1Decimals = abi.decode(['uint256'], await getRawField({ provider }, tokens[1], 'decimals'))[0]

    var normalizedInputAmount = parseFloat(fromDecimals(swapOutputArray[swapOutputArray.length - 2], token0Decimals, true))

    var normalizedAmounts = [
        parseFloat(fromDecimals(amounts[0], token0Decimals, true)),
        parseFloat(fromDecimals(amounts[1], token1Decimals, true))
    ]

    var constantProduct = normalizedAmounts[0] * normalizedAmounts[1]

    var newOtherAmount = constantProduct / (normalizedAmounts[inputPosition] + normalizedInputAmount)

    var otherAmountReceived = normalizedAmounts[1 - inputPosition] - newOtherAmount

    var pricePerSingleBeforeSwap = normalizedAmounts[inputPosition] / normalizedAmounts[1 - inputPosition]

    var pricePerSingleAfterSwap = normalizedInputAmount / otherAmountReceived

    var priceImpact = numberToString(((pricePerSingleAfterSwap / pricePerSingleBeforeSwap) - 1) * 100)

    return { swapOutput, priceImpact, liquidityPoolAddresses }
}

export async function calculateSwapOutput({ chainId, context }, input, output, amm) {
    if(!input?.token || !input?.value || !input?.value === '0' || !output?.token || !amm) {
        return
    }

    const inputTokenAddress = web3Utils.toChecksumAddress(input.token.address === VOID_ETHEREUM_ADDRESS ? amm.ethereumAddress : input.token.address)
    const outputTokenAddress = web3Utils.toChecksumAddress(output.token.address === VOID_ETHEREUM_ADDRESS ? amm.ethereumAddress : output.token.address)

    const middleTokens = [
        undefined,
        amm.ethereumAddress,
        web3Utils.toChecksumAddress(getNetworkElement({chainId, context}, "osTokenAddress")),
        web3Utils.toChecksumAddress(getNetworkElement({chainId, context}, "usdtTokenAddress")),
        web3Utils.toChecksumAddress(getNetworkElement({chainId, context}, "usdcTokenAddress")),
        web3Utils.toChecksumAddress(getNetworkElement({chainId, context}, "daiTokenAddress"))
    ].filter(it => it !== inputTokenAddress && it !== outputTokenAddress)

    var data = await Promise.all(middleTokens.map(async middleTokenAddress => {

        var swapOutput = '0'
        var priceImpact = '0'
        var liquidityPoolAddresses
        var path

        if(amm.name === 'UniswapV3') {
            var out = await calculateUniswapV3SwapOutput({ chainId, context }, input, output, amm, middleTokenAddress)
            swapOutput = out.swapOutput
            priceImpact = out.priceImpact
            path = out.path
        } else {
            var out = await calculateAMMBasedSwapOutput({ chainId, context }, input, output, amm, middleTokenAddress)
            swapOutput = out.swapOutput
            priceImpact = out.priceImpact
            liquidityPoolAddresses = out.liquidityPoolAddresses
        }

        return { swapOutput, priceImpact, middleTokenAddress, liquidityPoolAddresses, path }
    }))

    var swapOutputs = data.map(it => parseInt(it.swapOutput))

    var selected = Math.max.apply(null, swapOutputs);
    selected = swapOutputs.indexOf(selected)
    selected = data[selected]
    selected.middleSymbol = selected.middleTokenAddress && abi.decode(['string'], await getRawField({ provider : amm.contract.currentProvider }, selected.middleTokenAddress, 'symbol'))[0]
    selected.middleSymbol && (selected.middleSymbol = selected.middleSymbol.split('WETH').join('ETH'))

    return selected
}

export async function performSwap({ chainId, context, account }, input, output, amm, swapDataInfo, slippage, receiver) {

    var amountOutMinimum = numberToString(parseInt(swapDataInfo.swapOutput) * (1 - (slippage / 100))).split('.')[0]

    var realReceiver = receiver && receiver !== VOID_ETHEREUM_ADDRESS ? receiver : account

    if(amm.name === 'UniswapV3') {
        await performUniswapV3Swap({ chainId, context, account }, input, output, amm, swapDataInfo, amountOutMinimum, realReceiver)
    } else {
        const inputTokenAddress = input.token.address === VOID_ETHEREUM_ADDRESS ? amm.ethereumAddress : input.token.address
        const outputTokenAddress = output.token.address === VOID_ETHEREUM_ADDRESS ? amm.ethereumAddress : output.token.address

        var path = [outputTokenAddress]
        if(swapDataInfo.liquidityPoolAddresses.length > 1) {
            path.unshift(swapDataInfo.middleTokenAddress)
        }

        var swapData = {
            enterInETH : input.token.address === VOID_ETHEREUM_ADDRESS,
            exitInETH : output.token.address === VOID_ETHEREUM_ADDRESS,
            liquidityPoolAddresses : swapDataInfo.liquidityPoolAddresses,
            path,
            inputToken : inputTokenAddress,
            amount : input.value,
            receiver : realReceiver
        }

        const value = swapData.enterInETH ? swapData.amount : '0'

        await blockchainCall(amm.contract.methods.swapLiquidity, swapData, { value })
    }
}

export async function performUniswapV3Swap({ chainId, context }, input, output, amm, swapDataInfo, amountOutMinimum, realReceiver) {

    var multicallData = [
        amm.contract.methods.exactInput({
            path : swapDataInfo.path,
            recipient : output.token.address === VOID_ETHEREUM_ADDRESS ? VOID_ETHEREUM_ADDRESS : realReceiver,
            deadline : numberToString((new Date().getTime() / 1000) + 10000).split('.')[0],
            amountIn : input.value,
            amountOutMinimum
        }).encodeABI()
    ]

    input.token.address === VOID_ETHEREUM_ADDRESS && multicallData.push(amm.contract.methods.refundETH().encodeABI())
    output.token.address === VOID_ETHEREUM_ADDRESS && multicallData.push(amm.contract.methods.unwrapWETH9(0, realReceiver).encodeABI())

    const value = input.token.address === VOID_ETHEREUM_ADDRESS ? input.value : '0'

    await blockchainCall(amm.contract.methods.multicall, multicallData, { value })
}