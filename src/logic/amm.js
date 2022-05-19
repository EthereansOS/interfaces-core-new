import { blockchainCall, web3Utils, sendAsync, getNetworkElement, numberToString, VOID_ETHEREUM_ADDRESS, formatLink, abi, fromDecimals } from "@ethereansos/interfaces-core"

import { getRawField } from './generalReader'

const MAX_UINT256 = '0x' + web3Utils.toBN(2).pow(web3Utils.toBN(256)).sub(web3Utils.toBN(1)).toString('hex')

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

async function calculateUniswapV3PriceWithSlippage({ provider, context, chainId }, pool, inputTokenAddress, outputTokenAddress, middleTokenAddress, value, decimals, method) {

    var path = inputTokenAddress + conversionEncode[pool[0].fee] + (middleTokenAddress || outputTokenAddress).substring(2)

    if(middleTokenAddress) {
        path += (conversionEncode[pool[1].fee] + outputTokenAddress.substring(2))
    }

    if(method === 'quoteExactOutput') {
        path = outputTokenAddress + conversionEncode[pool[0].fee] + inputTokenAddress.substring(2)

        if(middleTokenAddress) {
            path = outputTokenAddress + conversionEncode[pool[1].fee] + middleTokenAddress.substring(2) + conversionEncode[pool[0].fee] + inputTokenAddress.substring(2)
        }
    }

    var output
    try {
        output = await sendAsync(provider, 'eth_call', {
            to : getNetworkElement({ context, chainId }, 'uniswapV3QuoterAddress'),
            data : (web3Utils.sha3((method || 'quoteExactInput') + '(bytes,uint256)').substring(0, 10)) + (abi.encode(["bytes", "uint256"], [path, value]).substring(2))
        }, 'latest')
    } catch(e) {
        return {
            swapInput : '0',
            swapOutput : '0',
            priceImpact : '0',
            path
        }
    }

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
        swapInput : swapOutput,
        swapOutput,
        priceImpact,
        path,
        liquidityPoolAddresses : pool.map(it => it.liquidityPoolAddress),
        inputTokenAddress,
        swapPath : middleTokenAddress ? [middleTokenAddress, outputTokenAddress] : [outputTokenAddress]
    }
}

export async function elaborateForUniswapV3Calculation({ context, chainId }, input, output, amm, middleTokenAddress, value, method) {

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

    const prices = await Promise.all(pools.map(pool => calculateUniswapV3PriceWithSlippage({ provider, context, chainId }, pool, inputTokenAddress, outputTokenAddress, middleTokenAddress, value, decimals, method)))

    return prices
}

export async function calculateUniswapV3SwapOutput({ context, chainId }, input, output, amm, middleTokenAddress) {

    const prices = await elaborateForUniswapV3Calculation({ context, chainId }, input, output, amm, middleTokenAddress, input.value)

    const swapOutputs = prices.map(it => parseInt(it.swapOutput))

    var selected = Math.max.apply(null, swapOutputs);
    selected = swapOutputs.indexOf(selected)
    selected = prices[selected]

    return selected
}

export async function calculateUniswapV3SwapInput({ context, chainId }, input, output, amm, middleTokenAddress) {

    const prices = await elaborateForUniswapV3Calculation({ context, chainId }, input, output, amm, middleTokenAddress, output.value, 'quoteExactOutput')

    const swapInputs = prices.map(it => parseInt(it.swapInput))

    var selected = Math.max.apply(null, swapInputs);
    selected = swapInputs.indexOf(selected)
    selected = prices[selected]

    return selected
}

async function calculateAMMBasedSwapInput(data, input, output, amm, liquidityPoolAddresses, inputTokenAddress, inputTokens) {

    const { context, newContract } = data

    var path = [
        inputTokenAddress,
        ...inputTokens
    ]

    if(amm.name === 'UniswapV2') {
        var result = (await blockchainCall(newContract(context.uniswapV2RouterABI, context.uniswapV2RouterAddress).methods.getAmountsIn, output.value, path)).map(it => it).reverse()
        result.splice(0, 1)
        return result
    }
    if(amm.name === 'SushiSwap') {
        var result = (await blockchainCall(newContract(context.uniswapV2RouterABI, context.sushiSwapRouterAddress).methods.getAmountsIn, output.value, path)).map(it => it).reverse()
        result.splice(0, 1)
        return result
    }
    if(amm.name === 'Balancer') {
        var result = [output.value]
        for(var i = liquidityPoolAddresses.length - 1; i >= 0; i--) {
            const liquidityPoolAddress = liquidityPoolAddresses[i]
            const from = path[i]
            const to = path[i + 1]
            const bPool = newContract(context.BPoolABI, liquidityPoolAddress)
            const res = await bPool.methods.swapExactAmountOut(from, MAX_UINT256, to, result[0], MAX_UINT256).call()
            result.unshift(res.tokenAmountIn)
        }
        result.splice(result.length - 1, 1)
        return result
    }

    return inputTokens.map(() => '0')
}

async function calculateAMMBasedSwap(data, input, output, amm, middleTokenAddress, exactOutput) {

    const { chainId, context } = data

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
        return { swapInput : '0', swapOutput : '0', priceImpact : 0, liquidityPoolAddresses }
    }

    inputTokens.push(outputTokenAddress)

    var dataArray = exactOutput ? await calculateAMMBasedSwapInput(data, input, output, amm, liquidityPoolAddresses, inputTokenAddress, inputTokens) : await blockchainCall(amm.contract.methods.getSwapOutput, inputTokenAddress, input.value, liquidityPoolAddresses, inputTokens)

    var swapOutput = dataArray[dataArray.length - 1]

    var liquidityPoolAddress = await blockchainCall(amm.contract.methods.byLiquidityPool, liquidityPoolAddresses[liquidityPoolAddresses.length - 1])
    var amounts = liquidityPoolAddress[1]
    var tokens = liquidityPoolAddress[2]
    liquidityPoolAddress = liquidityPoolAddresses[liquidityPoolAddresses.length - 1]

    var inputPosition = tokens[0] === (middleTokenAddress || inputTokenAddress) ? 0 : 1

    if(exactOutput && parseInt(amounts[1 - inputPosition]) < parseInt(output.value)) {
        return { swapInput : '0', priceImpact : '0', liquidityPoolAddresses }
    }

    var token0Decimals = tokens[0] === VOID_ETHEREUM_ADDRESS ? '18' : abi.decode(['uint256'], await getRawField({ provider }, tokens[0], 'decimals'))[0]
    var token1Decimals = tokens[1] === VOID_ETHEREUM_ADDRESS ? '18' : abi.decode(['uint256'], await getRawField({ provider }, tokens[1], 'decimals'))[0]

    var normalizedInputAmount = parseFloat(fromDecimals(dataArray[dataArray.length - 2], token0Decimals, true))

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

    return { swapInput : swapOutput, swapOutput, priceImpact, liquidityPoolAddresses,
        inputTokenAddress,
        swapPath : middleTokenAddress ? [middleTokenAddress, outputTokenAddress] : [outputTokenAddress] }
}

export async function calculateSwapOutput({ chainId, context }, input, output, amm) {
    if(!input?.token || !input?.value || !input?.value === '0' || !output?.token || !amm) {
        return
    }

    if(amm instanceof Array) {
        var ammData = await Promise.all(amm.map(it => calculateSwapOutput({ chainId, context }, input, output, it)))
        ammData = ammData.filter(it => it && it.swapOutput)
        var idx = '0'
        for(var i in ammData) {
            var item = ammData[i]
            if(parseInt(item.swapOutput) > parseInt(ammData[idx].swapOutput)) {
                idx = i
            }
        }
        return ammData[idx]
    }

    const inputTokenAddress = web3Utils.toChecksumAddress(input.token.address === VOID_ETHEREUM_ADDRESS ? amm.ethereumAddress : input.token.address)
    const outputTokenAddress = web3Utils.toChecksumAddress(output.token.address === VOID_ETHEREUM_ADDRESS ? amm.ethereumAddress : output.token.address)

    const middleTokens = amm.name === 'Mooniswap' || amm.name === 'Balancer' ? [undefined] : [
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
        var swapPath
        var inputTokenAddress
        try {
            if(amm.name === 'UniswapV3') {
                var out = await calculateUniswapV3SwapOutput({ chainId, context }, input, output, amm, middleTokenAddress)
                swapOutput = out.swapOutput
                priceImpact = out.priceImpact
                path = out.path
                liquidityPoolAddresses = out.liquidityPoolAddresses
                swapPath = out.swapPath
                inputTokenAddress = out.inputTokenAddress
            } else {
                var out = await calculateAMMBasedSwap({ chainId, context }, input, output, amm, middleTokenAddress)
                swapOutput = out.swapOutput
                priceImpact = out.priceImpact
                liquidityPoolAddresses = out.liquidityPoolAddresses
                swapPath = out.swapPath
                inputTokenAddress = out.inputTokenAddress
            }
        } catch(e) {
            liquidityPoolAddresses = []
        }
        return { swapOutput, priceImpact, middleTokenAddress, liquidityPoolAddresses, path, swapPath, inputTokenAddress }
    }))

    var swapOutputs = data.map(it => parseInt(it.swapOutput))

    var selected = Math.max.apply(null, swapOutputs)
    selected = swapOutputs.indexOf(selected)
    selected = data[selected]
    selected.middleSymbol = selected.middleTokenAddress && abi.decode(['string'], await getRawField({ provider : amm.contract.currentProvider }, selected.middleTokenAddress, 'symbol'))[0]
    selected.middleSymbol && (selected.middleSymbol = selected.middleSymbol.split('WETH').join('ETH'))
    selected.amm = amm

    return selected
}

const swapActions = {
    UniswapV2BasedSwap(address, data, swapData, amountOutMinimum, value) {
        const { newContract, context } = data
        const methodName = `swapExact${swapData.enterInETH ? 'ETH' : 'Tokens'}For${swapData.exitInETH ? 'ETH' : 'Tokens'}`
        const args = [
            newContract(context.uniswapV2RouterABI, address).methods[methodName]
        ]
        !swapData.enterInETH && args.push(swapData.inputTokenAmount)
        args.push(...[
            amountOutMinimum,
            [swapData.inputTokenAddress, ...swapData.path],
            swapData.receiver,
            new Date().getTime() + 10000,
            {value}
        ])
        return blockchainCall.apply(window, args)
    },
    UniswapV2(data, swapData, amountOutMinimum, value) {
        return this.UniswapV2BasedSwap(data.context.uniswapV2RouterAddress, data, swapData, amountOutMinimum, value)
    },
    SushiSwap(data, swapData, amountOutMinimum, value) {
        return this.UniswapV2BasedSwap(data.context.sushiSwapRouterAddress, data, swapData, amountOutMinimum, value)
    },
    Balancer(data, swapData, amountOutMinimum, value) {
        const { context, newContract } = data
        const contract = newContract(context.BPoolABI, swapData.liquidityPoolAddresses[0])
        return blockchainCall(contract.methods.swapExactAmountIn, swapData.inputTokenAddress, swapData.inputTokenAmount, swapData.path[0], amountOutMinimum, MAX_UINT256, { value })
    },
    MooniSwap(data, swapData, amountOutMinimum, value) {
        const { context, newContract } = data
        const contract = newContract(context.MooniswapABI, swapData.liquidityPoolAddresses[0])
        return blockchainCall(contract.methods.swap, swapData.inputTokenAddress, swapData.path[0], swapData.inputTokenAmount, amountOutMinimum, VOID_ETHEREUM_ADDRESS, { value })
    }
}

export async function performSwap(data, input, output, amm, swapDataInfo, slippage, receiver) {

    const { chainId, context, account } = data

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

        return await swapActions[amm.name](data, swapData, amountOutMinimum, value)

        //await blockchainCall(amm.contract.methods.swapLiquidity, swapData, { value })
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

export async function calculateSwapInput(data, input, output, amm) {
    if(!input?.token || !output?.value || !output?.value === '0' || !output?.token || !amm) {
        return
    }

    if(amm instanceof Array) {
        var ammData = await Promise.all(amm.map(it => calculateSwapInput(data, input, output, it)))
        ammData = ammData.filter(it => it && it.swapInput)
        var idx = '0'
        for(var i in ammData) {
            var item = ammData[i]
            if(parseInt(item.swapInput) < parseInt(ammData[idx].swapInput)) {
                idx = i
            }
        }
        return ammData[idx]
    }

    const { chainId, context } = data

    const inputTokenAddress = web3Utils.toChecksumAddress(input.token.address === VOID_ETHEREUM_ADDRESS ? amm.ethereumAddress : input.token.address)
    const outputTokenAddress = web3Utils.toChecksumAddress(output.token.address === VOID_ETHEREUM_ADDRESS ? amm.ethereumAddress : output.token.address)

    const middleTokens = amm.name === 'Mooniswap' || amm.name === 'Balancer' ? [undefined] : [
        undefined,
        amm.ethereumAddress,
        web3Utils.toChecksumAddress(getNetworkElement({chainId, context}, "osTokenAddress")),
        web3Utils.toChecksumAddress(getNetworkElement({chainId, context}, "usdtTokenAddress")),
        web3Utils.toChecksumAddress(getNetworkElement({chainId, context}, "usdcTokenAddress")),
        web3Utils.toChecksumAddress(getNetworkElement({chainId, context}, "daiTokenAddress"))
    ].filter(it => it !== inputTokenAddress && it !== outputTokenAddress)

    var data = await Promise.all(middleTokens.map(async middleTokenAddress => {

        var swapInput = '0'
        var priceImpact = '0'
        var liquidityPoolAddresses
        var path
        var swapPath
        var inputTokenAddress
        try {
            if(amm.name === 'UniswapV3') {
                var out = await calculateUniswapV3SwapInput({ chainId, context }, input, output, amm, middleTokenAddress)
                swapInput = out.swapInput
                priceImpact = out.priceImpact
                path = out.path
                liquidityPoolAddresses = out.liquidityPoolAddresses
                swapPath = out.swapPath
                inputTokenAddress = out.inputTokenAddress
            } else {
                var out = await calculateAMMBasedSwap(data, input, output, amm, middleTokenAddress, true)
                swapInput = out.swapInput
                priceImpact = out.priceImpact
                liquidityPoolAddresses = out.liquidityPoolAddresses
                swapPath = out.swapPath
                inputTokenAddress = out.inputTokenAddress
            }
        } catch(e) {
            liquidityPoolAddresses = []
        }
        return { swapInput, priceImpact, middleTokenAddress, liquidityPoolAddresses, path, swapPath, inputTokenAddress }
    }))

    var swapInputs = data.map(it => parseInt(it.swapInput))

    if(swapInputs.filter(it => it > 0).length === 0) {
        return
    }

    var selected = Math.min.apply(null, swapInputs.filter(it => it > 0))
    selected = swapInputs.indexOf(selected)
    selected = data[selected]
    selected.middleSymbol = selected.middleTokenAddress && abi.decode(['string'], await getRawField({ provider : amm.contract.currentProvider }, selected.middleTokenAddress, 'symbol'))[0]
    selected.middleSymbol && (selected.middleSymbol = selected.middleSymbol.split('WETH').join('ETH'))
    selected.amm = amm

    return selected
}