import parse from 'node-html-parser'

import numberToString from '../utils/numberToString'

import sendAsync from './sendAsync'

var url = 'https://etherscan.io/gastracker/'

const defaultGasValueInGWEI = '1.500000009'

export default async function getGasValueInGWEI(provider) {
  var chainId = parseInt(await sendAsync(provider, 'eth_chainId'))

  if (chainId !== 1 && !provider.blockchainConnection) {
    return defaultGasValueInGWEI
  }

  return await new Promise(async function (ok) {
    var backup = function backup() {
      return ok(defaultGasValueInGWEI)
    }
    try {
      var gas = parseInt(
        parse(await (await fetch(url)).text())
          .querySelectorAll('#spanHighPrice')[0]
          .innerHTML.trim()
      )
      return ok(numberToString(parseInt(numberToString(gas * 1.3))))
    } catch (e) {
      console.error(e)
      backup()
    }
  })
}
