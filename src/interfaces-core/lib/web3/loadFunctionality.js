import blockchainCall from './blockchainCall'
import loadContent from './loadContent'
import formatLink from './formatLink'
import extractHTMLDescription from './extractHTMLDescription'
import { newContract } from './contracts'
import searchForCodeErrors from './searchForCodeErrors'

/**
 * Load functionality
 *
 * @param {Object} adapters - The adapters injected required by the function.
 * @param {web3} adapters.web3 - The web3 instance.
 * @param {EthosContext} adapters.context - The application context.
 * @param {string} adapters.chainId - The network id.
 * @param functionalityName
 * @param organization
 * @return {Promise<any>}
 */
async function loadFunctionality(
  { web3, context, chainId },
  functionalityName,
  organization
) {
  const functionality = JSON.parse(
    await blockchainCall(
      { web3, context },
      organization.functionalitiesManager.methods.functionalityToJSON,
      functionalityName
    )
  )

  try {
    functionality.metadataLink = formatLink(
      { context },
      await blockchainCall(
        { web3, context },
        newContract({ web3 }, context.IFunctionalityAbi, functionality.location)
          .methods.getMetadataLink
      )
    )

    functionality.metadata = await (
      await fetch(functionality.metadataLink)
    ).json()

    Object.entries(functionality.metadata).forEach(
      (it) => (functionality[it[0]] = it[1])
    )
    functionality.description = extractHTMLDescription(
      { context },
      functionality.description || functionality.code
    )
  } catch (e) {}
  functionality.inputParameters = []

  try {
    functionality.inputParameters = functionality.methodSignature
      .split(
        functionality.methodSignature.substring(
          0,
          functionality.methodSignature.indexOf('(') + 1
        )
      )
      .join('')
      .split(')')
      .join('')
    functionality.inputParameters = functionality.inputParameters
      ? functionality.inputParameters.split(',')
      : []
  } catch (e) {}

  try {
    if (!functionality.code) {
      functionality.code =
        functionality.code ||
        (await loadContent(
          { web3, context, chainId },
          functionality.sourceLocationId,
          functionality.sourceLocation
        ))

      if (
        functionality.codeName !== 'getEmergencySurveyStaking' &&
        functionality.sourceLocationId === 0
      ) {
        delete functionality.code
      }
      functionality.description = extractHTMLDescription(
        { context },
        functionality.code
      )
    }
  } catch (e) {}

  functionality.compareErrors = await searchForCodeErrors(
    { context },
    functionality.location,
    functionality.code,
    functionality.codeName,
    functionality.methodSignature,
    functionality.replaces,
    true
  )
  functionality.compareErrors &&
    functionality.compareErrors.length > 0 &&
    console.log(functionality.name, functionality.compareErrors.join(' - '))

  return functionality
}

export default loadFunctionality
