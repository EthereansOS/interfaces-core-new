import { abi, VOID_ETHEREUM_ADDRESS, uploadMetadata, formatLink, fromDecimals, toDecimals, getNetworkElement, blockchainCall, web3Utils, sendAsync, tryRetrieveMetadata, VOID_BYTES32, numberToString, getLogs } from "interfaces-core"

export async function getFactoryData(web3Data, names) {

    const { context, chainId, web3, provider } = web3Data

    names = Array.isArray(names) ? names : [names]

    var factoryIndices = getNetworkElement({ context, chainId }, "factoryIndices")

    var indices = Object.entries(factoryIndices).filter(it => names.indexOf(it[0]) !== -1).map(it => it[1])

    if(indices.length === 0) {
        return
    }

    var args = {
        address : getNetworkElement({context, chainId}, "factoryOfFactoriesAddress"),
        topics : [
            web3Utils.sha3('FactoryAdded(uint256,address,address,uint256)'),
            indices.map(it => abi.encode(["uint256"], [it]))
        ],
        fromBlock: web3Utils.toHex(chainId === 10 ? '14322598' : getNetworkElement({ context, chainId }, 'deploySearchStart')) || "0x0",
        toBlock: 'latest'
    }

    var logs = await getLogs(web3 || provider, args)

    if(logs.length === 0) {
        return
    }

    var fromBlock = Math.min(...logs.map(it => parseInt(it.blockNumber)))

    fromBlock = web3Utils.numberToHex(fromBlock)

    var factoryData = {
        fromBlock,
        all : []
    }

    logs.forEach(it => {
        var index = abi.decode(["uint256"], it.topics[1])[0].toString()
        var addr = abi.decode(["address"], it.topics[3])[0].toString()
        var position = abi.decode(["uint256"], it.data)[0].toString()
        (factoryData[index] = factoryData[index] || {})[position] = addr
        factoryData.all.push(addr)
    })

    return factoryData
}