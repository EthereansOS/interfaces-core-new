import { toChecksumAddress } from 'web3-utils'
import { Base64 } from 'js-base64'
import web3Utils from 'web3-utils'

import blockchainCall from '../web3/blockchainCall'

import formatLink from './formatLink'
import getElementImage from './getElementImage'
import memoryFetch from './memoryFetch'

function cleanLink(linkToClean) {
  var cleanedLink = linkToClean

  if (
    cleanedLink.indexOf('data:') === 0 ||
    cleanedLink.indexOf('ipfs') === -1
  ) {
    return cleanedLink
  }

  var split = cleanedLink.split('/ipfs/')
  var ipfsLink = split[split.length - 1]

  cleanedLink = '//ipfs.io/ipfs/' + ipfsLink

  return cleanedLink
}

export default async function tryRetrieveMetadata(
  { context, itemsTokens, ethItemElementImages, metadatas },
  item
) {
  if (item.metadataLink) {
    return item
  }
  if (
    (context.pandorasBox &&
      context.pandorasBox.indexOf(toChecksumAddress(item.address)) !== -1) ||
    (item.collection &&
      context.pandorasBox.indexOf(
        toChecksumAddress(item.collection.address)
      ) !== -1) ||
    (item.collection &&
      item.collection.sourceAddress &&
      item.collection.sourceAddress !== 'blank' &&
      context.pandorasBox.indexOf(
        toChecksumAddress(item.collection.sourceAddress)
      ) !== -1)
  ) {
    item.metadataLink = 'blank'
    item.image = getElementImage({ context }, item)
    return item
  }
  var clearMetadata = true
  try {
    item.metadataLink = item.id
      ? await blockchainCall(
          (item.mainInterface || item.contract).methods[
            item.id.startsWith('0x') ? 'collectionUri' : 'uri'
          ],
          item.id
        )
      : await blockchainCall((item.mainInterface || item.contract).methods.uri)
    item.metadataLink = decodeURI(item.metadataLink)
    if (item.id) {
      item.metadataLink = item.metadataLink.split('{id}').join(item.id)
      item.metadataLink = item.metadataLink
        .split('0x{id}')
        .join(web3Utils.numberToHex(item.id))
    }
    item.metadataLink =
      (metadatas && metadatas[item.address]) || item.metadataLink
    item.uri = item.metadataLink
    if (item.metadataLink !== '') {
      item.image = cleanLink(formatLink({ context }, item.metadataLink))
      try {
        item.metadata = item.metadataLink.startsWith(
          'data:application/json;base64,'
        )
          ? JSON.parse(
              Base64.decode(
                item.metadataLink.substring(
                  'data:application/json;base64,'.length
                )
              )
            )
          : await memoryFetch(
              cleanLink(formatLink({ context }, item.metadataLink))
            )
        if (typeof item.metadata !== 'string') {
          Object.entries(item.metadata).forEach((it) => {
            if (it[1] === undefined || it[1] === null) {
              delete item.metadata[it[0]]
              return item
            }
            item[it[0]] = it[1]
          })
          item.name = item.item_name || item.name
          item.description =
            item.description && item.description.split('\n\n').join(' ')
        }
      } catch (e) {
        delete item.image
        item.image = getElementImage({ context }, item)
        item.metadataMessage = `Could not retrieve metadata, maybe due to CORS restriction policies for the link (<a href="${
          item.metadataLink
        }" target="_blank">${item.metadataLink}</a>), check it on <a href="${
          item.collection
            ? context.openSeaItemLinkTemplate.format(
                item.collection.address,
                item.id
              )
            : context.openSeaCollectionLinkTemplate.format(item.address)
        }" target="_blank">Opensea</a>`
        console.error(item.metadataMessage)
      }
      clearMetadata = false
    }
  } catch (e) {}
  clearMetadata && delete item.metadata
  clearMetadata &&
    (item.metadataLink = clearMetadata ? 'blank' : item.metadataLink)
  if (
    !clearMetadata &&
    ethItemElementImages &&
    ethItemElementImages[item.address] &&
    !item.elementImageLoaded
  ) {
    item.elementImageLoaded = ethItemElementImages[item.address]
    item.logoURI = item.elementImageLoaded
    item.logoUri = item.elementImageLoaded
    item.image = item.elementImageLoaded
  }
  if (
    (itemsTokens = itemsTokens || []).filter(
      (it) => it.address === item.address
    ).length === 0
  ) {
    itemsTokens.push({
      address: item.address,
      logoURI: item.image,
    })
  }
  return item
}
