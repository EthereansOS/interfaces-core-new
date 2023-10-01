import formatLink from './formatLink'

/**
 * Get the element image
 *
 * @param {Object} adapters - The adapters injected required by the function.
 * @param {EthosContext} adapters.context - The application context.
 * @param element
 * @return {string|*}
 */
function getElementImage({ context }, element) {
  if (!element || !element.metadataLink) {
    return 'assets/img/loadMonolith.png'
  }
  return formatLink(
    { context },
    element.image ||
      context.defaultItemData[element.category || element.collection.category][
        element.collection ? 'item' : 'collection'
      ].image
  )
}

export default getElementImage
