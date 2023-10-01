import numberToString from './numberToString'
import formatMoney from './formatMoney'

export default function formatMoneyUniV3(value, decimals) {
  var str = numberToString(value).split('.')
  if (str[1] && str[1].indexOf('0') === 0) {
    var n = str[1]
    for (var i = 0; i < n.length; i++) {
      if (n[i] !== '0') {
        str[1] = str[1].substring(0, i + 1)
        break
      }
    }
  } else {
    return formatMoney(value, decimals)
  }
  var newN = formatMoney(str[0]) + (str.length === 1 ? '' : '.' + str[1])
  return newN
}
