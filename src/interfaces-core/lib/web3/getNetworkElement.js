/**
 * Get network element
 *
 * @param {Object} adapters - The adapters injected required by the function.
 * @param {EthosContext} adapters.context - The application context.
 * @param {string} adapters.chainId - The network id. * @param element
 * @return {*}
 */
function getNetworkElement({ context, chainId }, element) {
  // TODO: fix me: how this work if it's a number when set chainId?
  // https://github.com/EthereansOS/Organizations-Interface/blob/master/assets/scripts/script.js#L260
  const network = context.ethereumNetwork[chainId]
  if (network === undefined || network === null) {
    return
  }
  return context[element + network]
}

export default getNetworkElement
