import { VOID_ETHEREUM_ADDRESS } from '../constants'

import { newContract } from './contracts'
import getNetworkElement from './getNetworkElement'
import blockchainCall from './blockchainCall'
import split from './split'

/**
 * Mint
 *
 * @param {Object} adapters - The adapters injected required by the function.
 * @param {web3} adapters.web3 - The web3 instance.
 * @param {EthosContext} adapters.context - The application context.
 * @param {string} adapters.chainId - The network id.
 * @param {ethosEvents} adapters.ethosEvents - The pub sub event manager.
 * @param inputs
 * @param ocelotAddress
 * @param silent
 * @param firstChunkCallback
 * @param tokenId
 * @param start
 * @return {Promise<*>}
 */
async function mint(
  { web3, context, chainId, ethosEvents },
  inputs,
  ocelotAddress,
  silent,
  firstChunkCallback,
  tokenId,
  start
) {
  const ocelot = newContract(
    { web3 },
    context.OcelotAbi,
    ocelotAddress || !ocelotAddress || ocelotAddress === VOID_ETHEREUM_ADDRESS
      ? getNetworkElement({ context, chainId }, 'defaultOcelotTokenAddress')
      : ocelotAddress
  )
  inputs =
    (typeof inputs).toLowerCase() === 'string'
      ? split({ context }, inputs)
      : inputs
  for (let i = start || 0; i < inputs.length; i++) {
    const input = inputs[i]
    !silent &&
      ethosEvents.publish(
        'message',
        'Minting ' + (i + 1) + ' of ' + inputs.length + ' tokens',
        'info'
      )
    const method =
      ocelot.methods[
        'mint' +
          (i === inputs.length - 1 ? 'AndFinalize' : '') +
          (i === 0 ? '' : '(uint256,bytes)')
      ]
    const args = [method]
    i > 0 && args.push(tokenId)
    args.push(input)
    const txReceipt = await blockchainCall.apply(null, [
      { web3, context },
      ...args,
    ])
    if (!tokenId) {
      tokenId = parseInt(txReceipt.events.Minted.returnValues.tokenId)
      firstChunkCallback && firstChunkCallback(tokenId)
    }
  }
  return tokenId
}

export default mint
