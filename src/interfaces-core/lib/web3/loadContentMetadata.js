import blockchainCall from './blockchainCall'

/**
 * Load content metadata
 *
 * @param {Object} adapters - The adapters injected required by the function.
 * @param {web3} adapters.web3 - The web3 instance.
 * @param {EthosContext} adapters.context - The application context.
 * @param tokenId
 * @param ocelotContract
 * @return {Promise<*>}
 */
const loadContentMetadata = async (
  { context, web3 },
  tokenId,
  ocelotContract
) => {
  const metadata = await blockchainCall(
    { web3, context },
    ocelotContract.methods.metadata,
    tokenId
  )
  metadata[0] = parseInt(metadata[0])
  metadata[1] = parseInt(metadata[1]) * 2 + 4
  return metadata
}

export default loadContentMetadata
