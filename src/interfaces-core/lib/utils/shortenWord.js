/**
 * Shorten word
 * @param context
 * @param word
 * @return {string|string}
 */
function shortenWord({ context, charsAmount, shortenWordSuffix }, word) {
  charsAmount = charsAmount || (context && context.defaultCharsAmount) || 5
  return word
    ? word.substring(0, word.length < charsAmount ? word.length : charsAmount) +
        (word.length <= charsAmount ? '' : shortenWordSuffix || '')
    : ''
}

export default shortenWord
