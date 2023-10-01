import { toHex, sha3 } from 'web3-utils'

import cache from '../utils/cache'

import sendAsync from './sendAsync'

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

export default async function getLogs(provider, args) {
  if (window.customProvider) {
    delete args.clear
    return await sendAsync(window.customProvider, 'eth_getLogs', args)
  }

  const chainId = parseInt(await sendAsync(provider, 'eth_chainId'))

  const latestBlock = parseInt(await sendAsync(provider, 'eth_blockNumber'))

  var firstBlock = parseInt(args.fromBlock)
  firstBlock = isNaN(firstBlock) ? 0 : firstBlock

  var lastBlock = parseInt(args.toBlock)
  lastBlock = isNaN(lastBlock) ? latestBlock : lastBlock

  firstBlock = parseInt(firstBlock)
  lastBlock = parseInt(lastBlock)

  const logKey = getLogKey(args)
  const cached = (!args.clear && JSON.parse(await cache.getItem(logKey))) || {
    logs: [],
  }

  delete args.clear

  var cachedLogs = cached.logs.filter(
    (it) =>
      parseInt(it.blockNumber) >= firstBlock &&
      parseInt(it.blockNumber) <= lastBlock
  )

  const interval = chainId === 10 ? 10000 : 45000

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
    /*var start = range[0]
    var end = start + interval
    end = end > range[1] ? range[1] : end

    while (start < end) {
      logs.push(
        (async () => {
          var newArgs = {
            ...args,
            fromBlock: toHex(start),
            toBlock: toHex(end),
          }
          try {
            return await sendAsync(provider, 'eth_getLogs', newArgs)
          } catch (e) {
            var message = (e.stack || e.message || e).toLowerCase()
            if (message.indexOf('response has no error') !== -1) {
              return []
            }
          }
          return []
        })()
      )
      if (end === range[1]) {
        break
      }
      start = end
      end = start + interval
      end = end > range[1] ? range[1] : end
    }*/
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
    (cached.toBlock = cached.toBlock || lastBlock) > lastBlock
      ? lastBlock
      : cached.toBlock

  try {
    await cache.setItem(logKey, JSON.stringify(cached))
  } catch (e) {}

  return logs
}
