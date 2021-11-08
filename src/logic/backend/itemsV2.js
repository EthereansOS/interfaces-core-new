import { web3Utils, sendAsync, blockchainCall, abi } from "@ethereansos/interfaces-core"

export async function loadItemsFromFactories({context, web3, account}, factories) {

    const {toChecksumAddress, sha3} = web3Utils

    var array = factories instanceof Array ? factories : [factories];

    var address = await Promise.all(array.map(it => blockchainCall(it.methods.mainInterface)))
    address = address.filter((it, i) => address.indexOf(it) === i)

    var items = address.map(it => new web3.eth.Contract(context.ItemABI, it))

    var args = {
        address,
        topics : [
            sha3('CollectionItem(bytes32,bytes32,uint256)')
        ],
        fromBlock : '0x0',
        toBlock : 'latest'
    }

    var logs = await sendAsync(web3.currentProvider, 'eth_getLogs', args)

    var itemIds = logs.reduce((acc, log) => {
        var itemId = abi.decode(["uint256"], log.topics[3])[0].toString()
        var item = items.filter(it => toChecksumAddress(it.options.address) === toChecksumAddress(log.address))[0]
        return {
            ...acc,
            [itemId] : {
                itemId,
                item
            }
        }
    }, {})

    itemIds = Object.values(itemIds)

    return await Promise.all(itemIds.map(it => loadItemFromItemId({account}, it.itemId, it.item)))
}

export async function loadItemFromItemId({account}, itemId, item) {
    return {
        name : await blockchainCall(item.methods.name, itemId),
        symbol : await blockchainCall(item.methods.symbol, itemId),
        decimals : await blockchainCall(item.methods.decimals, itemId),
        ...(await loadItemDynamicInfoFromItemId({account}, itemId, item))
    }
}

export async function loadItemDynamicInfoFromItemId({account}, itemId, item) {
    var uri = await blockchainCall(item.methods["uri(uint256)"], itemId)
    return {
        uri,
        balance : await blockchainCall(item.methods.balanceOf, account, itemId)
    }
}