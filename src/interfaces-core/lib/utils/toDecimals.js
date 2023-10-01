import web3Utils from 'web3-utils'

import toEthereumSymbol from './toEthereumSymbol'
import numberToString from './numberToString'

/**
 * To decimals
 * @param number
 * @param decimals
 * @return {string|number|BN}
 */
function toDecimals(number, decimals) {
  number = numberToString(number?.value || number || 0)
  decimals = numberToString(decimals?.value || decimals || 0)

  if (!number) {
    number = '0'
  }

  if (!decimals || parseInt(decimals) === 0) {
    return number
  }

  const symbol = toEthereumSymbol(decimals)
  if (symbol) {
    number = numberToString(number)
    while (true) {
      try {
        return web3Utils.toWei(number, symbol)
      } catch (e) {
        const message = (e.message || e).toLowerCase()
        if (message.indexOf('too many') !== -1) {
          number = number.substring(0, number.length - 1)
        } else {
          throw e
        }
      }
    }
  }
  return numberToString(number * (decimals < 2 ? 1 : Math.pow(10, decimals)))
}

export default toDecimals
