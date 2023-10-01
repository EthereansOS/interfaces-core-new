import web3Utils from 'web3-utils'

import cache from './cache'

export default async function memoryFetch(url, type) {
  var element

  if (url.indexOf('data') === 0) {
    element = await fetch(url)
    element = await element[type || 'json']()
    return element
  }

  var key = web3Utils.sha3(url)

  try {
    element = JSON.parse(await cache.getItem(key))
  } catch (e) {}
  if (element) {
    return element
  }

  element = await fetch(url)
  element = await element[type || 'json']()

  try {
    await cache.setItem(key, JSON.stringify(element))
  } catch (e) {}
  return element
}
