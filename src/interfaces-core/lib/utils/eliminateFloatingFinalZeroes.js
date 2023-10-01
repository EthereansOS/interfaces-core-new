/**
 * Eliminate floating number final zero
 * @param value
 * @param decSeparator
 * @return {*}
 */
function eliminateFloatingFinalZeroes(value, decSeparator) {
  decSeparator = decSeparator || '.'
  if (value.indexOf(decSeparator) === -1) {
    return value
  }
  let split = value.split(decSeparator)
  while (split[1].endsWith('0')) {
    split[1] = split[1].substring(0, split[1].length - 1)
  }
  return split[1].length === 0 ? split[0] : split.join(decSeparator)
}

export default eliminateFloatingFinalZeroes
