import Web3 from 'web3'

import { VOID_ETHEREUM_ADDRESS } from '../constants'

import sendBlockchainTransaction from './sendBlockchainTransaction'
import sendAsync from './sendAsync'
import { web3Utils } from 'interfaces-core'
import decodeCallResponse from './decodeCallResponse'

async function blockchainCall() {
  var method = arguments[0]
  var args = [...arguments].slice(1)
  var from = VOID_ETHEREUM_ADDRESS
  var value = 0
  var blockNumber = null
  try {
    method = (
      method.implementation ? method.get : method.new ? method.new : method
    )(...args)
  } catch (e) {
    var data = args[args.length - 1]
    from = data.fromOrPlainPrivateKey || data.from || from
    value = data.value || value
    blockNumber = data.blockNumber || blockNumber
    args = args.slice(0, args.length - 1)
    method = (
      method.implementation ? method.get : method.new ? method.new : method
    )(...args)
  }
  if (from === VOID_ETHEREUM_ADDRESS) {
    try {
      from = method._parent.currentProvider.accounts[0]
    } catch (e) {
      try {
        from =
          window.account ||
          (
            await method._parent.currentProvider.request({
              method: 'eth_requestAccounts',
            })
          )[0]
      } catch (e) {
        var data = args[args.length - 1]
        if (data) {
          from = data.fromOrPlainPrivateKey || data.from || from
          value = data.value || value
          blockNumber = data.blockNumber || blockNumber
        }
      }
    }
  }
  var fromForSend = from
  try {
    from = new Web3(
      method._parent.currentProvider
    ).eth.accounts.privateKeyToAccount(fromForSend).address
  } catch (e) {}
  var to = method._parent.options.address
  var dataInput = data
  data = method.encodeABI()
  var result = await (method._method.stateMutability === 'view' ||
  method._method.stateMutability === 'pure'
    ? callMethod(method, from, value, blockNumber)
    : sendBlockchainTransaction(
        method._parent.currentProvider,
        fromForSend,
        to,
        data,
        value,
        dataInput
      ))
  if (!to) {
    method._parent.options.address = result.contractAddress
    var address = method._parent.options.address
    var web3 = new Web3(method._parent.currentProvider)
    await new Promise(async (ok) => {
      var set = async () => {
        try {
          var key = web3.utils.sha3(await web3.eth.getCode(address))
          if (!key) {
            setTimeout(set)
          }
          ;(global.compiledContracts = global.compiledContracts || {})[key] = {
            name: method._parent.name,
            abi: method._parent.abi,
          }
        } catch (e) {}
        return ok()
      }
      setTimeout(set)
    })
    return method._parent
  }
  return result
}

export default blockchainCall

async function callMethod(method, from, value, blockNumber) {
  if(method._parent.options.address === VOID_ETHEREUM_ADDRESS) {
    return await method.call({from, value}, blockNumber)
  }
  try {
    return decodeCallResponse(await sendAsync(method._parent.currentProvider, 'eth_call', {
      from,
      to : method._parent.options.address,
      value : web3Utils.numberToHex(value),
      data : method.encodeABI()
    }, blockNumber && !isNaN(parseInt(blockNumber)) ? web3Utils.numberToHex(blockNumber) : blockNumber || 'latest'), method._method.outputs)
  } catch(e) {
    var message = e.message
    while(message.message) {
      message = message.message
    }
    throw new Error(message)
  }
}