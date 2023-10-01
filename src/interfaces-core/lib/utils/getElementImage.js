import formatLink from './formatLink'

export default function getElementImage({ context }, element) {
  if (!element || !element.metadataLink) {
    return context.defaultElementImage
  }
  return formatLink(
    element.image ||
      context.defaultItemData[element.category || element.collection.category][
        element.collection ? 'item' : 'collection'
      ].image
  )
}
