import eliminateFloatingFinalZeroes from './eliminateFloatingFinalZeroes'

/**
 * Format money
 * @param value
 * @param decPlaces
 * @param thouSeparator
 * @param decSeparator
 * @return {*}
 */
function formatMoney(value, decPlaces, thouSeparator, decSeparator) {
  value = (typeof value).toLowerCase() !== 'number' ? parseFloat(value) : value
  let n = value
  decPlaces = isNaN((decPlaces = Math.abs(decPlaces))) ? 2 : decPlaces
  decSeparator = !decSeparator ? '.' : decSeparator
  thouSeparator = !thouSeparator ? ',' : thouSeparator
  let sign = n < 0 ? '-' : ''
  let i = parseInt((n = Math.abs(+n || 0).toFixed(decPlaces))) + ''
  let j = i.length > 3 ? i.length % 3 : 0

  const result =
    sign +
    (j ? i.substr(0, j) + thouSeparator : '') +
    i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thouSeparator) +
    (decPlaces
      ? decSeparator +
        Math.abs(n - i)
          .toFixed(decPlaces)
          .slice(2)
      : '')
  return eliminateFloatingFinalZeroes(result, decSeparator)
}

export default formatMoney
