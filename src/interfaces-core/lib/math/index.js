import web3Utils from 'web3-utils'

import numberToString from '../utils/numberToString'

function op(a, operator, b) {
  const operations = {
    '+': 'add',
    '-': 'sub',
    '*': 'mul',
    '/': 'div',
  }

  const firstElement = (a.ethereansosAdd ? a.toString() : numberToString(a))
    .split(',')
    .join('')
    .split('.')[0]

  const secondElement = (b.ethereansosAdd ? b.toString() : numberToString(b))
    .split(',')
    .join('')
    .split('.')[0]

  return web3Utils
    .toBN(firstElement)
    [operations[operator] || operator](web3Utils.toBN(secondElement))
    .toString()
}

/**
 * Add
 * @param a
 * @param b
 * @return {*}
 */
export function add(a, b) {
  return op(a, '+', b)
}

/**
 * Sub
 * @param a
 * @param b
 * @return {*}
 */
export function sub(a, b) {
  return op(a, '-', b)
}

/**
 * Mul
 * @param a
 * @param b
 * @return {*}
 */
export function mul(a, b) {
  return op(a, '*', b)
}

/**
 * Div
 * @param a
 * @param b
 * @return {*}
 */
export function div(a, b) {
  return op(a, '/', b)
}

const methods = {
  add: function add(b) {
    return op(this, '+', b)
  },
  sub: function sub(b) {
    return op(this, '-', b)
  },
  mul: function mul(b) {
    return op(this, '*', b)
  },
  div: function div(b) {
    return op(this, '/', b)
  },
}

String.prototype.ethereansosAdd = methods.add // eslint-disable-line no-extend-native
String.prototype.ethereansosSub = methods.sub // eslint-disable-line no-extend-native
String.prototype.ethereansosMul = methods.mul // eslint-disable-line no-extend-native
String.prototype.ethereansosDiv = methods.div // eslint-disable-line no-extend-native
Number.prototype.ethereansosAdd = methods.add // eslint-disable-line no-extend-native
Number.prototype.ethereansosSub = methods.sub // eslint-disable-line no-extend-native
Number.prototype.ethereansosMul = methods.mul // eslint-disable-line no-extend-native
Number.prototype.ethereansosDiv = methods.div // eslint-disable-line no-extend-native
