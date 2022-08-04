import { sendAsync, web3Utils } from "@ethereansos/interfaces-core"
import { sleep } from "./uiUtilities"

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
            while(true) {
                try {
                    return await sendAsync(provider, _, { ...args, fromBlock : web3Utils.toHex(start), toBlock : web3Utils.toHex(end)})
                } catch(e) {
                    var message = (e.stack || e.message || e).toLowerCase()
                    if(chainId === 10 && message.indexOf('response has no error') !== -1) {
                        await sleep(600)
                    } else {
                        throw e
                    }
                }
            }
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