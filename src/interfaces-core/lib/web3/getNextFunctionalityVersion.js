import blockchainCall from './blockchainCall'
import { newContract } from './contracts'

/**
 * Get next functionality version
 *
 * @param {Object} adapters - The adapters injected required by the function.
 * @param {web3} adapters.web3 - The web3 instance.
 * @param {EthosContext} adapters.context - The application context.
 * @param codeName
 * @param replaces
 * @return {Promise<number>}
 */
async function getNextFunctionalityVersion(
  { web3, context },
  data,
  codeName,
  replaces
) {
  let version = 0
  if (replaces && codeName) {
    try {
      const functionalityLocation = (
        await blockchainCall(
          { web3, context },
          data.element.functionalitiesManager.methods.getFunctionalityData,
          data.replaces
        )
      )[0]

      const metadataLink = await blockchainCall(
        { web3, context },
        newContract({ web3 }, context.IFunctionalityAbi, functionalityLocation)
          .methods.getMetadataLink
      )

      const metadata = await (await fetch(metadataLink)).json()
      version = Number(metadata.version) + 1
    } catch (e) {}
  }
  return version
}

export default getNextFunctionalityVersion
