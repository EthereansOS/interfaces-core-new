import numberToString from '../utils/numberToString'

import getNetworkElement from './getNetworkElement'

/**
 * Load block search trances
 *
 * @param {Object} adapters - The adapters injected required by the function.
 * @param {web3} adapters.web3 - The web3 instance.
 * @param {EthosContext} adapters.context - The application context.
 * @param {string} adapters.chainId - The network id.
 * @return {Promise<Array>}
 */
async function loadBlockSearchTranches({ web3, context, chainId }) {
  var startBlock = parseInt(
    numberToString(
      getNetworkElement({ context, chainId }, 'deploySearchStart') || '0'
    )
  )
  var endBlock = parseInt(numberToString(await web3.eth.getBlockNumber()))
  var limit = context.blockSearchLimit || 50000
  var toBlock = endBlock
  var fromBlock = endBlock - limit
  fromBlock = fromBlock < startBlock ? startBlock : fromBlock
  var blocks = []
  while (true) {
    blocks.push([numberToString(fromBlock), numberToString(toBlock)])
    if (fromBlock === startBlock) {
      break
    }
    toBlock = fromBlock - 1
    fromBlock = toBlock - limit
    fromBlock = fromBlock < startBlock ? startBlock : fromBlock
  }
  return blocks
}

export default loadBlockSearchTranches
