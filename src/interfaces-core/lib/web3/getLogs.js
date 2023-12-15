import { toHex, sha3 } from 'web3-utils'
import Mutex from '../utils/mutex'

import cache from '../utils/cache'

import sendAsync from './sendAsync'

export async function getSearchBlocks(context, chainId) {
  const now = new Date().getTime()
  const interval = 3.6e+6
  const key = 'searchBlocks'
  var searchBlocks = JSON.parse(await cache.getItem(key))
  if(!searchBlocks || (now - searchBlocks.lastDownload) > interval) {
    searchBlocks = (await (await fetch(context?.eventBlockURL || 'https://raw.githubusercontent.com/EthereansOS/event-blocks/main/src/output/output.json')).json())
    searchBlocks.lastDownload = now
    await cache.setItem(key, JSON.stringify(searchBlocks))
  }
  return searchBlocks[chainId]
}

function destroyUniqueKey(it, uniqueKeyName) {
  var d = {
    ...it,
  }
  delete d[uniqueKeyName]
  return d
}

function cleanDuplicates(array, uniqueKey) {
  var uniqueKeyName =
    (typeof uniqueKey).toLowerCase() === 'string'
      ? uniqueKey
      : 'uniqueKey_' + new Date().getTime() + '_' + Math.random()
  var dups = [...array.map((it) => ({ ...it }))]
  dups = dups.map((it) => ({
    ...it,
    [uniqueKeyName]:
      uniqueKey instanceof Function ? uniqueKey(it) : it[uniqueKeyName],
  }))

  var uniq = {}
  dups = dups.filter(
    (it) => !uniq[it[uniqueKeyName]] && (uniq[it[uniqueKeyName]] = true)
  )
  dups =
    (typeof uniqueKey).toLowerCase() === 'string'
      ? dups
      : dups.map((it) => destroyUniqueKey(it, uniqueKeyName))
  return dups
}

function getLogKey(args) {
  var key = {
    ...args,
  }
  delete key.fromBlock
  delete key.toBlock
  key = JSON.stringify(key)
  key = sha3('log-' + key)
  return key
}

function ascending(a, b) {
  return parseInt(a.blockNumber) - parseInt(b.blockNumber)
}

export default async function getLogs(prov, args, tempCache) {

  args.toBlock = args.toBlock || 'latest'

  if (window.customProvider) {
    delete args.clear
    return await sendAsync(window.customProvider, 'eth_getLogs', args)
  }

  var provider = prov.provider || prov.currentProvider || prov

  if(!tempCache && !args.searchBlocks && (Array.isArray(args.topics[0]) ? args.topics[0] : [args.topics[0]]).indexOf(web3Utils.sha3('Transfer(address,address,uint256)')) === -1) {
      args.searchBlocks = await getSearchBlocks(undefined, parseInt(await sendAsync(provider, 'eth_chainId')))
  }

  if(args.searchBlocks) {
    var searchBlocks = args.searchBlocks
    var newArgs = {...args}
    delete newArgs.fromBlock
    delete newArgs.toBlock,
    delete newArgs.searchBlocks
    var key = getLogKey(args)
    tempCache = (!args.clear && JSON.parse(await cache.getItem(key))) || {
      logs: []
    }
    var logs = await Promise.all([getLogs(prov, {...newArgs, fromBlock : searchBlocks.fromBlock, toBlock : searchBlocks.lastSearchedBlock}, tempCache), getLogs(prov, {...newArgs, fromBlock : searchBlocks.lastSearchedBlock + 1, toBlock : 'latest'}, tempCache)])
    try {
      await cache.setItem(key, JSON.stringify(tempCache))
    } catch (e) {}
    logs = logs.reduce((acc, it) => [...acc, ...it], [])
    return logs
  }

  delete args.searchBlocks

  var firstBlock = parseInt(args.fromBlock)
  firstBlock = isNaN(firstBlock) ? 0 : firstBlock

  var lastBlock = parseInt(args.toBlock)
  lastBlock = isNaN(lastBlock) ? parseInt(await sendAsync(provider, 'eth_blockNumber')) : lastBlock

  firstBlock = parseInt(firstBlock)
  lastBlock = parseInt(lastBlock)

  const logKey = getLogKey(args)
  const cached = tempCache || (!args.clear && JSON.parse(await cache.getItem(logKey))) || {
    logs: [],
  }

  delete args.clear

  var cachedLogs = cached.logs.filter(
    (it) =>
      parseInt(it.blockNumber) >= firstBlock &&
      parseInt(it.blockNumber) <= lastBlock
  )

  var logs = []

  var ranges = []

  if (cached.fromBlock && cached.fromBlock > firstBlock) {
    ranges.push([firstBlock, cached.fromBlock - 1])
  }

  if (cached.toBlock && cached.toBlock < lastBlock) {
    ranges.push([cached.toBlock + 1, lastBlock])
  }

  if (!cached.fromBlock && !cached.toBlock) {
    ranges.push([firstBlock, lastBlock])
  }

  for (var range of ranges) {
    logs.push(
      sendAsync(provider, 'eth_getLogs', {
        ...args,
        fromBlock: toHex(range[0]),
        toBlock: toHex(range[1]),
      }).catch((e) => {
        console.log(e)
        return []
      })
    )
  }

  logs = await Promise.all(logs)
  logs = logs.reduce((acc, it) => [...acc, ...it], [])

  cached.logs = [
    ...cached.logs,
    ...logs.filter(
      (it) =>
        cached.logs.filter(
          (stored) =>
            stored.transactionHash.toLowerCase() ===
            it.transactionHash.toLowerCase()
        ).length === 0
    ),
  ].sort(ascending)

  logs = cleanDuplicates([...logs, ...cachedLogs], (it) =>
    sha3(
      it.transactionHash +
        it.address +
        JSON.stringify(it.topics) +
        (it.data || '0x')
    )
  ).sort(ascending)

  cached.fromBlock =
    (cached.fromBlock = cached.fromBlock || firstBlock) > firstBlock
      ? firstBlock
      : cached.fromBlock
  cached.toBlock =
    (cached.toBlock = cached.toBlock || lastBlock) < lastBlock
      ? lastBlock
      : cached.toBlock

  try {
    !tempCache && await cache.setItem(logKey, JSON.stringify(cached))
  } catch (e) {}

  return logs
}
