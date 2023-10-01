import './ethereumjs-tx.min.js'
import Web3 from 'web3'

import sendAsync from './sendAsync'

var web3 = new Web3()

var getEtherscanAddress = function getEtherscanAddress(postFix, chainId) {
  var address = 'http://'
  if (chainId) {
    var idToNetwork = {
      1: '',
      3: 'ropsten',
      4: 'rinkeby',
      42: 'kovan',
    }
    var prefix = idToNetwork[parseInt(chainId)]
    prefix && (prefix += '.')
    address += prefix
  }
  address += 'etherscan.io/'
  postFix && (address += postFix)
  return address
}

function sendBlockchainTransaction(
  provider,
  fromOrPlainPrivateKey,
  to,
  data,
  value,
  additionalData
) {
  additionalData = additionalData || {}
  var address = fromOrPlainPrivateKey
  var privateKey
  try {
    address = web3.eth.accounts.privateKeyToAccount(
      fromOrPlainPrivateKey
    ).address
    privateKey = Buffer.from(fromOrPlainPrivateKey, 'hex')
  } catch (e) {}
  return new Promise(async (ok, ko) => {
    try {
      var tx = {}
      var nonce = await sendAsync(
        provider,
        'eth_getTransactionCount',
        address,
        'latest'
      )
      nonce = web3.utils.toHex(nonce)
      tx.nonce = nonce
      tx.from = address
      to && (tx.to = to)
      tx.data = data
      tx.value = web3.utils.toHex(value || '0')
      tx.chainId = web3.utils.toHex(await sendAsync(provider, 'eth_chainId'))
      tx.gasLimit = web3.utils.toHex(
        additionalData.gasLimit ||
          (await sendAsync(provider, 'eth_getBlockByNumber', 'latest', false))
            .gasLimit
      )

      if (provider === window.customProvider) {
        return ok(
          await sendAsync(
            provider,
            'eth_getTransactionReceipt',
            await sendAsync(provider, 'eth_sendTransaction', tx)
          )
        )
      }

      tx.gasLimit =
        window.bypassEstimation || additionalData.gasLimit
          ? tx.gasLimit
          : web3.utils.toHex(
              web3.utils
                .toBN(
                  parseInt(
                    parseInt(await sendAsync(provider, 'eth_estimateGas', tx)) *
                      1.10269
                  )
                )
                .toString()
            )
      !window.bypassEstimation &&
        (await sendAsync(provider, 'eth_estimateGas', tx))
      tx.gas = tx.gasLimit
      var sendTransaction
      if (privateKey) {
        var transaction = new global.EthereumJSTransaction.Transaction(tx, {
          chain: parseInt(await sendAsync(provider, 'eth_chainId')),
        })
        transaction.sign(privateKey)
        var serializedTx = '0x' + transaction.serialize().toString('hex')
        sendTransaction = sendAsync(
          provider,
          'eth_sendRawTransaction',
          serializedTx
        )
      } else {
        sendTransaction = sendAsync(provider, 'eth_sendTransaction', tx)
      }
      var transactionHash = await sendTransaction
      console.log(
        new Date().toUTCString(),
        'Transaction!',
        getEtherscanAddress('tx/' + transactionHash, tx.chainId)
      )
      var timeout = async function () {
        var receipt = await sendAsync(
          provider,
          'eth_getTransactionReceipt',
          transactionHash
        )
        if (!receipt || !receipt.blockNumber) {
          return setTimeout(timeout, 3000)
        }
        return ok(receipt)
      }
      setTimeout(timeout)
    } catch (e) {
      return ko(e)
    }
  })
}

export default sendBlockchainTransaction
