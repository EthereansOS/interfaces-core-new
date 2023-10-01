import blockchainCall from './blockchainCall'

/**
 * Load functionality names
 *
 * @param {Object} adapters - The adapters injected required by the function.
 * @param {web3} adapters.web3 - The web3 instance.
 * @param {EthosContext} adapters.context - The application context.
 * @param element
 * @return {Promise<*>}
 */
async function loadFunctionalityNames({ web3, context }, element) {
  var functionalityNames = await blockchainCall(
    { web3, context },
    element.functionalitiesManager.methods.functionalityNames
  )
  functionalityNames = JSON.parse(
    (functionalityNames.endsWith(',]')
      ? functionalityNames.substring(0, functionalityNames.lastIndexOf(',]')) +
        ']'
      : functionalityNames
    ).trim()
  )
  return functionalityNames
}

export default loadFunctionalityNames
