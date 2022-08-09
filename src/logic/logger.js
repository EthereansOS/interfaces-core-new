import { cache, sendAsync, web3Utils } from "@ethereansos/interfaces-core"

function getLogKey(args) {
    var key = {
        ...args
    }
    delete key.fromBlock
    delete key.toBlock
    key = JSON.stringify(key)
    key = web3Utils.sha3('log-' + key)
    return key
}

function ascending(a, b) {
    return parseInt(a.blockNumber) - parseInt(b.blockNumber)
}

export async function getLogs(provider, _, args) {

    const chainId = parseInt(await sendAsync(provider, 'eth_chainId'))

    const latestBlock = parseInt(await sendAsync(provider, 'eth_blockNumber'))

    var firstBlock = parseInt(args.fromBlock)
    firstBlock = isNaN(firstBlock) ? 0 : firstBlock

    var lastBlock = parseInt(args.toBlock)
    lastBlock = isNaN(lastBlock) ? latestBlock : lastBlock

    firstBlock = parseInt(firstBlock)
    lastBlock = parseInt(lastBlock)

    const logKey = getLogKey(args)
    const cached = JSON.parse(await cache.getItem(logKey)) || {
        logs : []
    }

    var cachedLogs = cached.logs.filter(it => parseInt(it.blockNumber) >= firstBlock && parseInt(it.blockNumber) <= lastBlock)

    const interval = chainId === 10 ? 10000 : 45000

    var logs = []

    var ranges = []

    if(cached.fromBlock && cached.fromBlock > firstBlock) {
        ranges.push([firstBlock, cached.fromBlock - 1])
    }

    if(cached.toBlock && cached.toBlock < lastBlock) {
        ranges.push([cached.toBlock + 1, lastBlock])
    }

    if(!cached.fromBlock && !cached.toBlock) {
        ranges.push([firstBlock, lastBlock])
    }

    for(var range of ranges) {

        var start = range[0]
        var end = start + interval
        end = end > range[1] ? range[1] : end

        while(start < end) {
            logs.push((async () => {
                var newArgs = { ...args, fromBlock: web3Utils.toHex(start), toBlock : web3Utils.toHex(end)}
                try {
                    return await sendAsync(provider, _, newArgs)
                } catch(e) {
                    var message = (e.stack || e.message || e).toLowerCase()
                    if(message.indexOf("response has no error") !== -1) {
                        return []
                    }
                }
                return []
            })())
            if(end === range[1]) {
                break
            }
            start = end
            end = start + interval
            end = end > range[1] ? range[1] : end
        }
    }

    logs = await Promise.all(logs)
    logs = logs.reduce((acc, it) => [...acc, ...it], [])

    cached.logs = [
        ...cached.logs,
        ...logs.filter(it => cached.logs.filter(stored => stored.transactionHash.toLowerCase() === it.transactionHash.toLowerCase()).length === 0)
    ].sort(ascending)

    logs = [
        ...logs,
        ...cachedLogs
    ].sort(ascending)

    cached.fromBlock = (cached.fromBlock = cached.fromBlock || firstBlock) > firstBlock ? firstBlock : cached.fromBlock
    cached.toBlock = (cached.toBlock = cached.toBlock || lastBlock) > lastBlock ? lastBlock : cached.toBlock

    try {
        await cache.setItem(logKey, JSON.stringify(cached))
    } catch(e) {
        console.error(e)
    }

    return logs
}