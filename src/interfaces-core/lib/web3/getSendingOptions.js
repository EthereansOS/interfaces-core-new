import getAddress from './getAddress'

/**
 * Get sending options
 *
 * @param {Object} adapters - The adapters injected required by the function.
 * @param {web3} adapters.web3 - The web3 instance.
 * @param transaction
 * @param value
 * @return {Promise<unknown>}
 */
function getSendingOptions({ web3 }, transaction, value) {
  return new Promise(async function (resolve, reject) {
    let walletAddress
    const lastGasLimit = (await web3.eth.getBlock('latest')).gasLimit
    if (transaction) {
      walletAddress = await getAddress({ web3 })
      const from = walletAddress
      const nonce = await web3.eth.getTransactionCount(from)
      // window.bypassEstimation is a value that can be set in the console to debug the prodct in production
      return window.bypassEstimation
        ? resolve({
            nonce,
            from,
            // window.gasLimit is a value that can be set in the console to debug the prodct in production
            gas: window.gasLimit || lastGasLimit,
            value,
          })
        : transaction.estimateGas(
            {
              nonce,
              from,
              value,
              gas: lastGasLimit,
              gasLimit: lastGasLimit,
            },
            function (error, gas) {
              if (error) {
                return reject(error.message || error)
              }
              return resolve({
                nonce,
                from,
                // TODO I can't find the code that sets window.gasLimit in the production code, so I guess is always undefined
                gas: gas || window.gasLimit || lastGasLimit,
                value,
              })
            }
          )
    }
    return resolve({
      from: walletAddress || null,
      gas: window.gasLimit || lastGasLimit,
    })
  })
}

export default getSendingOptions
