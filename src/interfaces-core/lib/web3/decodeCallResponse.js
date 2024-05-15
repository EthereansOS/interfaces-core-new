import { abi } from 'interfaces-core'
import { VOID_BYTES32, VOID_ETHEREUM_ADDRESS } from '../constants'

export default function decodeCallResponse(response, outputs) {
    var types = recursiveOutput(outputs)
    if(response === '0x') {
      return types.length !== 1 ? null : types[0].toLowerCase().indexOf('[]') !== -1 ? [] : types[0].toLowerCase().indexOf('tuple') !== -1 ? null : types[0].toLowerCase() === 'bytes' ? '0x' : types[0].toLowerCase() === 'string' ? '' : types[0].toLowerCase() === 'bool' ? false : types[0].toLowerCase() === 'address' ? VOID_ETHEREUM_ADDRESS  : types[0].toLowerCase() === 'bytes32' ? VOID_BYTES32 : "0"
    }
    response = abi.decode(types, response)
    response = toStringRecursive(response)
    response = reduceRecursive(response, outputs)
    if(outputs.length === 1) {
      response = response[0]
    }
    return response
  }
  
  function recursiveOutput(outputs) {
    return outputs.map(it => it.components ? `tuple(${recursiveOutput(it.components).join(',')})${it.type.indexOf('[]') !== -1 ? '[]' : ''}`: it.type)
  }
  
  function toStringRecursive(outputs) {
    return outputs.map(it => Array.isArray(it) ? toStringRecursive(it) : it.toString())
  }
  
  function reduceRecursive(result, metadata) {
    return result.reduce((acc, it, i) => ({...acc, [i] : metadata[i].components ? metadata[i].type.indexOf('[]') !== -1 ? it.map(elem => reduceRecursive(elem, metadata[i].components)) : reduceRecursive(it, metadata[i].components) : it, [metadata[i].name || i] : metadata[i].components ? metadata[i].type.indexOf('[]') !== -1 ? it.map(elem => reduceRecursive(elem, metadata[i].components)) : reduceRecursive(it, metadata[i].components) : it}), {})
  }