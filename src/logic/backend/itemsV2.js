import { web3Utils, sendAsync, blockchainCall, abi, tryRetrieveMetadata } from "@ethereansos/interfaces-core"

export async function loadItemsByFactories({context, web3, account, newContract}, factories) {

    const {toChecksumAddress, sha3} = web3Utils

    var array = factories instanceof Array ? factories : [factories];

    var address = await Promise.all(array.map(it => blockchainCall(it.methods.mainInterface)))
    address = address.filter((it, i) => address.indexOf(it) === i)

    var items = address.map(it => newContract(context.ItemMainInterfaceABI, it))

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

    return await Promise.all(itemIds.map(it => loadItem({context, account, newContract}, it.itemId, it.item)))
}

export async function loadItem({context, account, newContract}, itemId, item) {
    var address = item ? await blockchainCall(item.methods.interoperableOf, itemId) : itemId
    var interoperableInterface = newContract(context.ItemInteroperableInterfaceABI, address)
    itemId = item ? itemId : await blockchainCall(interoperableInterface.methods.itemId)
    item = item || newContract(context.ItemMainInterfaceABI, await blockchainCall(interoperableInterface.methods.mainInterface))
    var itemData = await blockchainCall(item.methods.item, itemId)
    var collectionData = {...(await blockchainCall(item.methods.collection, itemData.collectionId))}
    collectionData.mainInterface = item
    collectionData = await tryRetrieveMetadata({context}, collectionData)
    return await loadItemDynamicInfo({context, account, newContract}, {
        id : itemId,
        name : await blockchainCall(item.methods.name, itemId),
        symbol : await blockchainCall(item.methods.symbol, itemId),
        decimals : await blockchainCall(item.methods.decimals, itemId),
        mainInterface : item,
        collectionId : itemData.collectionId,
        mainInterfaceAddress : item.options.address,
        host : collectionData.host,
        collectionData,
        address,
        interoperableInterface
    }, item)
}

export async function loadItemDynamicInfo({context, account, newContract}, itemData, item) {
    if(typeof itemData === 'string') {
        return await loadItem({context, account, newContract}, itemData, item)
    }
    return {
        ...itemData,
        ...(await tryRetrieveMetadata({context}, itemData)),
        balance : await blockchainCall(itemData.mainInterface.methods.balanceOf, account, itemData.id),
        totalSupply : await blockchainCall(itemData.mainInterface.methods.totalSupply, itemData.id)
    }
}