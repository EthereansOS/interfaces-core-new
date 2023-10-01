import web3Utils from 'web3-utils'
import { tickToPrice } from '@uniswap/v3-sdk'
import { Token } from '@uniswap/sdk-core'

import { fromDecimals, toDecimals, numberToString } from '../utils'

import getEthereumPrice from './getEthereumPrice'
import blockchainCall from './blockchainCall'

const conversionEncode = {
  100: '000064',
  500: '0001f4',
  3000: '000bb8',
  10000: '002710',
}

export async function getTokenPriceInDollarsOnUniswap(
  { context, newContract },
  tokenAddress,
  decimals,
  amountPlain
) {
  var uniswapV2Router = newContract(
    context.uniswapV2RouterABI,
    context.uniswapV2RouterAddress
  )
  var wethAddress = web3Utils.toChecksumAddress(
    await blockchainCall(uniswapV2Router.methods.WETH)
  )
  var ethereumPrice = await getEthereumPrice({ context })
  var path = [tokenAddress, wethAddress]
  var amount = toDecimals(
    numberToString(!isNaN(amountPlain) ? amountPlain : 1),
    decimals
  )
  var ethereumValue = '0'
  try {
    ethereumValue = (
      await blockchainCall(uniswapV2Router.methods.getAmountsOut, amount, path)
    )[1]
  } catch (e) {}
  ethereumValue = parseFloat(fromDecimals(ethereumValue, 18, true))
  ethereumValue *= ethereumPrice
  return ethereumValue
}

export async function getTokenPriceInDollarsOnSushiSwap(
  { context, newContract },
  tokenAddress,
  decimals,
  amountPlain
) {
  var uniswapV2Router = newContract(
    context.uniswapV2RouterABI,
    context.sushiSwapRouterAddress
  )
  var wethAddress = web3Utils.toChecksumAddress(
    await blockchainCall(uniswapV2Router.methods.WETH)
  )
  var ethereumPrice = await getEthereumPrice({ context })
  var path = [tokenAddress, wethAddress]

  var amount = toDecimals(
    numberToString(!isNaN(amountPlain) ? amountPlain : 1),
    decimals
  )
  var ethereumValue = '0'
  try {
    ethereumValue = (
      await blockchainCall(uniswapV2Router.methods.getAmountsOut, amount, path)
    )[1]
  } catch (e) {}
  ethereumValue = parseFloat(fromDecimals(ethereumValue, 18, true))
  ethereumValue *= ethereumPrice
  return ethereumValue
}

export async function getTokenPriceInDollarsOnUniswapV3(
  { context, newContract, chainId },
  tokenAddress,
  decimals
) {
  var uniswapV2Router = newContract(
    context.uniswapV2RouterABI,
    context.uniswapV2RouterAddress
  )
  var wethAddress = web3Utils.toChecksumAddress(
    await blockchainCall(uniswapV2Router.methods.WETH)
  )
  var ethereumPrice = await getEthereumPrice({ context })
  var ethereumValue = '0'
  var univ3Factory = newContract(
    context.UniswapV3FactoryABI,
    context.uniswapV3FactoryAddress
  )
  var uniToken = new Token(
    chainId,
    tokenAddress,
    parseInt(decimals),
    'TOK',
    'Token'
  )
  var uniTokenWeth = new Token(chainId, wethAddress, 18, 'ETH', 'Ethereum')
  try {
    var proms = (
      await Promise.all(
        Object.keys(conversionEncode).map(async (fee) => {
          try {
            var pool = newContract(
              context.UniswapV3PoolABI,
              await blockchainCall(
                univ3Factory.methods.getPool,
                wethAddress,
                tokenAddress,
                fee
              )
            )
            var slot0 = await blockchainCall(pool.methods.slot0)
            var price = tickToPrice(
              uniToken,
              uniTokenWeth,
              parseInt(slot0.tick)
            ).toSignificant(15)
            return toDecimals(price, 18)
          } catch (e) {
            return '0'
          }
        })
      )
    ).filter((it) => it && it !== '0')
    ethereumValue = proms.reduce((a, b) => a.ethereansosAdd(b))
    ethereumValue = ethereumValue.ethereansosDiv(proms.length)
  } catch (e) {}
  ethereumValue = parseFloat(fromDecimals(ethereumValue, 18, true))
  ethereumValue *= ethereumPrice
  return ethereumValue
}
