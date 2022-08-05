import { sendAsync, web3Utils } from "@ethereansos/interfaces-core"

export async function getLogs(provider, _, args) {

    const chainId = parseInt(await sendAsync(provider, 'eth_chainId'))

    const latestBlock = parseInt(await sendAsync(provider, 'eth_blockNumber'))

    var firstBlock = parseInt(args.fromBlock)
    firstBlock = isNaN(firstBlock) ? 0 : firstBlock

    var lastBlock = parseInt(args.toBlock)
    lastBlock = isNaN(lastBlock) ? latestBlock : lastBlock

    const interval = chainId === 10 ? 10000 : 45000

    var start = firstBlock
    var end = start + interval
    end = end > lastBlock ? lastBlock : end

    var logs = []
    while(start < end) {
        logs.push((async () => {
            var newArgs = { ...args, fromBlock : web3Utils.toHex(start), toBlock : web3Utils.toHex(end)}
            var key = web3Utils.sha3(JSON.stringify(newArgs))
            var value
            try {
                value = JSON.parse(window.localStorage.getItem(key))
                if(value) {
                    return value
                }
            } catch(e) {}
            try {
                value = await sendAsync(provider, _, newArgs)
            } catch(e) {
                var message = (e.stack || e.message || e).toLowerCase()
                if(message.indexOf("response has no error") !== -1) {
                    value = []
                }
            }

            value && window.localStorage.setItem(key, JSON.stringify(value))

            return value || []
        })())
        if(end === lastBlock) {
            break
        }
        start = end
        end = start + interval
        end = end > lastBlock ? lastBlock : end
    }

    logs = await Promise.all(logs)
    logs = logs.reduce((acc, it) => [...acc, ...it], [])

    return logs
}