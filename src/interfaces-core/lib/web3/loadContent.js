import { BASE64_REGEXP, VOID_ETHEREUM_ADDRESS } from '../constants'

import blockchainCall from './blockchainCall'
import { newContract } from './contracts'
import getNetworkElement from './getNetworkElement'
import loadContentMetadata from './loadContentMetadata'

/**
 * Load content
 *
 * @param {Object} adapters - The adapters injected required by the function.
 * @param {web3} adapters.web3 - The web3 instance.
 * @param {EthosContext} adapters.context - The application context.
 * @param {string} adapters.chainId - The network id.
 * @param tokenId
 * @param ocelotAddress
 * @param raw
 * @return {Promise<string>}
 */
async function loadContent(
  { web3, context, chainId },
  tokenId,
  ocelotAddress,
  raw
) {
  const chains = []
  const ocelot = newContract(
    { web3 },
    context.OcelotAbi,
    !ocelotAddress || ocelotAddress === VOID_ETHEREUM_ADDRESS
      ? getNetworkElement({ context, chainId }, 'defaultOcelotTokenAddress')
      : ocelotAddress
  )
  const metadata = await loadContentMetadata({ context, web3 }, tokenId, ocelot)

  for (let i = 0; i < metadata[0]; i++) {
    const content = await blockchainCall(
      { web3, context },
      ocelot.methods.content,
      tokenId,
      i
    )
    chains.push(i === 0 ? content : content.substring(2))
  }
  let value = chains.join('')
  value = web3.utils.toUtf8(value).trim()
  value = raw ? value : atob(value.substring(value.indexOf(',') + 1))
  const regex = new RegExp(BASE64_REGEXP).exec(value)
  !raw &&
    regex &&
    regex.index === 0 &&
    (value = atob(value.substring(value.indexOf(',') + 1)))
  return value
}

export default loadContent
