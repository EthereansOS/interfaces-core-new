export default function truncatedWord({ context, charsAmount }, word) {
  charsAmount = charsAmount || (context && context.defaultCharsAmount) || 4
  if (!word) {
    return ''
  }
  var pippo = word.length - charsAmount
  if (pippo <= 0) {
    return word
  }
  var firstPart = word.substring(0, charsAmount)
  var secondPart = word.substring(pippo, word.length)
  return firstPart + '...' + secondPart
}
