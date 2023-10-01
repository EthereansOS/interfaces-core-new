/**
 * Format string
 * @param str
 * @param args
 * @return {*}
 */
export default function formatString(str, ...args) {
  // const args = arguments.slice(1) // we slice here since the first parameter now is the string itself
  return str.replace(/{(\d+)}/g, function (match, number) {
    return typeof args[number] !== 'undefined' ? args[number] : match
  })
}
