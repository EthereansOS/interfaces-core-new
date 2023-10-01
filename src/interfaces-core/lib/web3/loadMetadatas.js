/**
 * Load metadatas
 *
 * @param {Object} adapters - The adapters injected required by the function.
 * @param {EthosContext} adapters.context - The application context.
 * @return {Promise<void>}
 */
async function loadMetadatas({ context }) {
  context.metadatas = []
  try {
    context.metadatas = await (await fetch(context.ethItemMetadatasURL)).json()
  } catch (e) {
    console.error('loadMetadatas', e)
  }
}

export default loadMetadatas
