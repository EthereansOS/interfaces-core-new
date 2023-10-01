import web3Utils from 'web3-utils'

/**
 * Normalize value
 * @param amount
 * @param decimals
 * @return {*}
 */
function normalizeValue(amount, decimals) {
  return web3Utils
    .toBN(amount)
    .mul(web3Utils.toBN(10 ** (18 - decimals)))
    .toString()
}

export default normalizeValue
