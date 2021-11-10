import { web3Utils, sendAsync, blockchainCall, abi, tryRetrieveMetadata } from "@ethereansos/interfaces-core"

export async function loadItemsByFactories({context, web3, account, newContract, collectionData, excluding}, factories) {

    var topics = collectionData ? [
        web3Utils.sha3("CollectionItem(bytes32,bytes32,uint256)"),
        [],
        collectionData.id
    ] : "CollectionItem(bytes32,bytes32,uint256)"

    var { items, logs } = await getLogsFromFactories({context, web3, newContract}, factories, topics)

    var itemIds = logs.reduce((acc, log) => {
        var itemId = abi.decode(["uint256"], log.topics[3])[0].toString()
        var item = items.filter(it => web3Utils.toChecksumAddress(it.options.address) === web3Utils.toChecksumAddress(log.address))[0]
        return {
            ...acc,
            [itemId] : {
                itemId,
                item
            }
        }
    }, {})

    excluding = excluding || []
    excluding = excluding instanceof Array ? excluding : [excluding]

    itemIds = Object.values(itemIds).filter(it => excluding.indexOf(it.itemId) === -1)

    return await Promise.all(itemIds.map(it => loadItem({context, account, newContract, collectionData}, it.itemId, it.item)))
}

export async function loadCollectionsByFactories({context, web3, account, newContract}, factories) {

    var { items, logs } = await getLogsFromFactories({context, web3, newContract}, factories, "Collection(address,address,bytes32)")

    var collectionIds = logs.reduce((acc, log) => {
        var collectionId = log.topics[3]
        var item = items.filter(it => web3Utils.toChecksumAddress(it.options.address) === web3Utils.toChecksumAddress(log.address))[0]
        return {
            ...acc,
            [collectionId] : {
                collectionId,
                item
            }
        }
    }, {})

    collectionIds = Object.values(collectionIds)

    return await Promise.all(collectionIds.map(it => loadCollection({context, web3, account, newContract}, it.collectionId, factories, it.item)))
}

export async function getLogsFromFactories({context, web3, newContract}, factories, topics) {
    var array = factories instanceof Array ? factories : [factories];

    var address = await Promise.all(array.map(it => blockchainCall(it.methods.mainInterface)))
    address = address.filter((it, i) => address.indexOf(it) === i)

    var items = address.map(it => newContract(context.ItemMainInterfaceABI, it))

    var args = {
        address,
        topics : typeof topics === 'string' ? [
            web3Utils.sha3(topics)
        ] : topics,
        fromBlock : '0x0',
        toBlock : 'latest'
    }

    var logs = await sendAsync(web3.currentProvider, 'eth_getLogs', args)

    return {
        items,
        logs
    }
}

export async function loadItem({context, account, newContract, collectionData}, itemId, item) {
    var address = item ? await blockchainCall(item.methods.interoperableOf, itemId) : itemId
    var interoperableInterface = newContract(context.ItemInteroperableInterfaceABI, address)
    itemId = item ? itemId : await blockchainCall(interoperableInterface.methods.itemId)
    item = item || newContract(context.ItemMainInterfaceABI, await blockchainCall(interoperableInterface.methods.mainInterface))
    var itemData = await blockchainCall(item.methods.item, itemId)
    collectionData = collectionData || await loadCollectionMetadata({context}, itemData.collectionId, item)
    return await loadItemDynamicInfo({context, account, newContract}, {
        id : itemId,
        ...itemData,
        ...itemData.header,
        mainInterface : item,
        mainInterfaceAddress : item.options.address,
        host : collectionData.host,
        collectionData,
        address,
        interoperableInterface,
        decimals : "18"
    }, item)
}

export async function loadItemDynamicInfo({context, account, newContract}, itemData, item) {
    if(typeof itemData === 'string') {
        return await loadItem({context, account, newContract}, itemData, item)
    }
    return {
        ...itemData,
        ...(await tryRetrieveMetadata({context}, itemData)),
        balance : await blockchainCall(itemData.mainInterface.methods.balanceOf, account, itemData.id)
    }
}

export async function loadCollectionMetadata({context}, collectionId, mainInterface) {
    return await tryRetrieveMetadata({context}, {
        ...(await blockchainCall(mainInterface.methods.collection, collectionId)),
        mainInterface,
        id : collectionId
    })
}

export async function loadCollection({context, web3, newContract, account}, collectionId, factory, item) {
    var collectionData = await loadCollectionMetadata({context}, collectionId, item = item || newContract(context.ItemMainInterfaceABI, await blockchainCall(factory.methods.mainInterface)))
    return {
        ...collectionData,
        items : await loadItemsByFactories({context, web3, account, newContract, collectionData}, factory)
    }
}