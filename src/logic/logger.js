import { sendAsync, web3Utils } from "@ethereansos/interfaces-core"

export async function getLogs(provider, _, args) {

    const latestBlock = parseInt(await sendAsync(provider, 'eth_blockNumber'))

    var firstBlock = parseInt(args.fromBlock)
    firstBlock = isNaN(firstBlock) ? 0 : firstBlock

    var lastBlock = parseInt(args.toBlock)
    lastBlock = isNaN(lastBlock) ? latestBlock : lastBlock

    const interval = 45000

    var start = firstBlock
    var end = start + interval
    end = end > lastBlock ? lastBlock : end

    var logs = []
    while(start < end) {
        logs.push(sendAsync(provider, _, { ...args, fromBlock : web3Utils.toHex(start), toBlock : web3Utils.toHex(end)}))
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