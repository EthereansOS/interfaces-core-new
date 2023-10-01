import { VOID_ETHEREUM_ADDRESS } from '../constants'

import getEthereumPrice from './getEthereumPrice'
import blockchainCall from './blockchainCall'
import {
  getTokenPriceInDollarsOnUniswap,
  getTokenPriceInDollarsOnUniswapV3,
  getTokenPriceInDollarsOnSushiSwap,
} from './getTokenPriceInDollarsOnUniswap'

const tokenPrices = {}
const tokenPricesPromises = {}

async function elaboratePrices({ context, web3Data }, res, tokens) {
  var response = {
    data: {},
  }
  Object.entries(res.data).forEach(
    (entry) => (response.data[entry[0]] = entry[1])
  )
  tokens = (!(tokens instanceof Array) ? (tokens = tokens.split(',')) : tokens)
    .map((it) => it.toLowerCase())
    .filter((it) => it && it !== VOID_ETHEREUM_ADDRESS && !response.data[it])
  for (var token of tokens) {
    try {
      response.data[token] = {
        usd: await getTokenPriceInDollarsOnUniswapV3(
          { context, ...web3Data },
          token,
          await blockchainCall(
            web3Data.newContract(context.ERC20ABI, token).methods.decimals
          )
        ),
      }
    } catch (e) {
      try {
        response.data[token] = {
          usd: await getTokenPriceInDollarsOnUniswap(
            { context, ...web3Data },
            token,
            await blockchainCall(
              web3Data.newContract(context.ERC20ABI, token).methods.decimals
            )
          ),
        }
      } catch (e) {}
      try {
        if (
          !response.data[token].usd ||
          parseFloat(response.data[token].usd) === 0
        ) {
          response.data[token] = {
            usd: await getTokenPriceInDollarsOnSushiSwap(
              { context, ...web3Data },
              token,
              await blockchainCall(
                web3Data.newContract(context.ERC20ABI, token).methods.decimals
              )
            ),
          }
        }
      } catch (e) {}
    }
  }
  return response
}

export default async function getTokenPricesInDollarsOnCoingecko(
  { context, web3Data },
  t
) {
  var tokens = (!(t instanceof Array) ? (t = t.split(',')) : t).map((it) =>
    it.toLowerCase()
  )
  var response = {
    data: {},
  }
  var tkns = []
  for (var token of tokens) {
    if (!token || token === VOID_ETHEREUM_ADDRESS) {
      response.data[token] = await getEthereumPrice({ context })
      continue
    }
    if (
      tokenPrices[token] &&
      tokenPrices[token].requestExpires > new Date().getTime() &&
      tokenPrices[token].price !== 0
    ) {
      response.data[token] = { usd: tokenPrices[token].price }
    } else if (tokenPricesPromises[token]) {
      response.data[token] = {
        usd: (await tokenPricesPromises[token]).data[token].usd,
      }
    } else {
      tkns.push(token)
    }
  }
  var prom = async function (t1, t2) {
    var res = {
      data: {},
    }
    try {
      t1.length > 0 &&
        (res.data = (
          await Promise.all(
            context.coingeckoCoinPriceURLTemplates.map(
              async (it) => await (await fetch(it + t1.join(','))).json()
            )
          )
        ).reduce((acc, it) => ({ ...acc, ...it }), {}))
    } catch (e) {}
    return await elaboratePrices({ context, web3Data }, res, t2)
  }
  prom = prom(tkns, t)
  for (var token of tkns) {
    tokenPricesPromises[token] = prom
  }
  prom = await prom
  Object.entries(prom.data).forEach((it) => (response.data[it[0]] = it[1]))
  for (var token of tkns) {
    tokenPrices[token] = {
      requestExpires:
        new Date().getTime() + context.coingeckoEthereumPriceRequestInterval,
      price: response.data[token].usd,
    }
  }

  for (var token of tokens) {
    delete tokenPricesPromises[token]
  }
  return response
}
