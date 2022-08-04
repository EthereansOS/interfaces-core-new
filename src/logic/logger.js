import { sendAsync, web3Utils } from "@ethereansos/interfaces-core"
import Web3 from "web3"
import { sleep } from "./uiUtilities"

const chainProvider = {
    "10" : "https://opt-mainnet.g.alchemy.com/v2/n7RB1WD8al75IGI-5d15ttII4vNBOCEO"
}

const providers = {}

export async function getLogs(provider, _, args) {

    const chainId = parseInt(await sendAsync(provider, 'eth_chainId'))

    const latestBlock = parseInt(await sendAsync(provider, 'eth_blockNumber'))

    var realProvider = chainId === 10 ? providers[chainId] = providers[chainId] || new Web3.providers.HttpProvider(chainProvider[chainId]) : provider

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
            for(var i = 0; i < 5; i++) {
                try {
                    return await sendAsync(realProvider, _, { ...args, fromBlock : web3Utils.toHex(start), toBlock : web3Utils.toHex(end)})
                } catch(e) {
                    var message = (e.stack || e.message || e).toLowerCase()
                    if(chainId === 10 && message.indexOf('response has no error') !== -1) {
                        await sleep(600)
                    } else {
                        throw e
                    }
                }
            }
            return []
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