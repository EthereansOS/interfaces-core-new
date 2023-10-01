import numberToString from './numberToString'

/**
 * Format number
 * @param value
 * @return {number}
 */
function formatNumber(value) {
  return parseFloat(numberToString(value).split(',').join(''))
}

export default formatNumber
