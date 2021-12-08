import { getTokenPriceInDollarsOnUniswapV3, VOID_ETHEREUM_ADDRESS, web3Utils, sendAsync, blockchainCall, abi, tryRetrieveMetadata, uploadMetadata, formatLink, VOID_BYTES32, toDecimals, getNetworkElement } from "@ethereansos/interfaces-core"

import itemProjectionsMetadata from './itemProjectionsMetadata.json'

import { loadTokenFromAddress } from "./erc20"
import { tryRetrieveDelegationAddressFromItem } from "./delegation"

export async function loadItemsByFactories({context, chainId, web3, account, newContract, getGlobalContract, collectionData, excluding, wrappedOnly, allMine}, factories) {

    var topics = collectionData ? [
        web3Utils.sha3("CollectionItem(bytes32,bytes32,uint256)"),
        [],
        collectionData.id
    ] : "CollectionItem(bytes32,bytes32,uint256)"

    var { items, logs } = await getLogsFromFactories({context, web3, newContract}, factories, topics)

    var exclusiveIncluding = wrappedOnly && [
        await blockchainCall(getGlobalContract('eRC20Wrapper').methods.collectionId),
        await blockchainCall(getGlobalContract('eRC721Wrapper').methods.collectionId),
        await blockchainCall(getGlobalContract('eRC1155Wrapper').methods.collectionId)
    ]

    var itemIds = logs.reduce((acc, log) => {
        var collectionId = log.topics[2]
        var itemId = abi.decode(["uint256"], log.topics[3])[0].toString()
        if(context.deployedCollectionsToExclude && context.deployedCollectionsToExclude.indexOf(collectionId) !== - 1) {
            return acc
        }
        if(context.deployedItemsToExclude && context.deployedItemsToExclude.indexOf(itemId) !== - 1) {
            return acc
        }
        if(exclusiveIncluding && exclusiveIncluding.indexOf(collectionId) === -1) {
            return acc
        }
        var item = items.filter(it => web3Utils.toChecksumAddress(it.options.address) === web3Utils.toChecksumAddress(log.address))[0]
        return {
            ...acc,
            [itemId] : {
                itemId,
                item,
                address : log.address
            }
        }
    }, {})

    excluding = excluding || []
    excluding = excluding instanceof Array ? excluding : [excluding]

    itemIds = Object.values(itemIds).filter(it => excluding.indexOf(it.itemId) === -1)

    if(allMine) {
        const topics = [
            web3Utils.sha3('TransferSingle(address,address,address,uint256,uint256)'),
            web3Utils.sha3('TransferBatch(address,address,address,uint256[],uint256[])'),
        ]
        const args = {
            address : itemIds.map(it => it.address).filter((it, i, arr) => arr.indexOf(it) === i),
            topics : [
                topics,
                [],
                [],
                abi.encode(['address'], [account])
            ],
            fromBlock : '0x0',
            toBlock : 'latest'
        }
        var logs = await sendAsync(web3.currentProvider, 'eth_getLogs', args)
        var owned = {}
        for(var log of logs) {
            var postfix = log.topics[0] === topics[0] ? '' : '[]'
            var data = abi.decode(['uint256' + postfix, 'uint256' + postfix], log.data)
            data = log.topics[0] === topics[0] ? [data[0]] : data[0]
            data.forEach(it => owned[it.toString()] = true)
        }
        itemIds = itemIds.filter(it => owned[it.itemId])
    }

    var vals = await Promise.all(itemIds.map(it => loadItem({context, chainId, account, newContract, collectionData, getGlobalContract}, it.itemId, it.item)))

    if(allMine) {
        vals = vals.filter(it => it.balance !== '0')
    }
    return vals
}

export async function loadCollectionsByFactories({chainId, context, web3, account, newContract, getGlobalContract}, factories) {

    var { items, logs } = await getLogsFromFactories({context, web3, newContract}, factories, "Collection(address,address,bytes32)")

    var collectionIds = logs.reduce((acc, log) => {
        var collectionId = log.topics[3]
        if(context.deployedCollectionsToExclude && context.deployedCollectionsToExclude.indexOf(collectionId) !== - 1) {
            return acc
        }
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

    var topics = [
        web3Utils.sha3("CollectionItem(bytes32,bytes32,uint256)"),
        [],
        collectionIds.map(it => it.collectionId)
    ]

    var itemLogs = await getLogsFromFactories({context, web3, newContract}, factories, topics)

    var nonEmptyCollections = {}

    itemLogs.logs.forEach(it => nonEmptyCollections[it.topics[2]] = true)

    var toExclude = collectionIds.filter(it => !nonEmptyCollections[it.collectionId])

    return await Promise.all(collectionIds.map(it => loadCollection({chainId, context, web3, account, newContract, getGlobalContract}, it.collectionId, factories, it.item)))
}

export async function getLogsFromFactories({context, web3, newContract}, factories, topics) {
    var array = factories instanceof Array ? factories : [factories]

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

export async function loadiETH({context, chainId, account, newContract, getGlobalContract}) {
    return await loadItem({context, chainId, account, newContract, getGlobalContract}, await blockchainCall(getGlobalContract('eRC20Wrapper').methods.itemIdOf, VOID_ETHEREUM_ADDRESS))
}

export async function loadItem({context, chainId, account, newContract, getGlobalContract, collectionData}, itemId, item) {
    var address = item ? await blockchainCall(item.methods.interoperableOf, itemId) : itemId.indexOf('0x') === 0 ? itemId : abi.decode(["address"], abi.encode(["uint256"], [itemId]))[0]
    var contract = newContract(context.ItemInteroperableInterfaceABI, address)
    itemId = item ? itemId : await blockchainCall(contract.methods.itemId)
    item = item || newContract(context.ItemMainInterfaceABI, await blockchainCall(contract.methods.mainInterface))
    var itemData = await blockchainCall(item.methods.item, itemId)
    collectionData = collectionData || await loadCollectionMetadata({context, newContract, getGlobalContract}, itemData.collectionId, item)
    var index = -1
    var wrappers = []
    const wrapTypes = [
        'ERC20',
        'ERC721',
        'ERC1155'
    ]
    try {
        index = (await Promise.all((wrappers = [
            getGlobalContract('eRC20Wrapper'),
            getGlobalContract('eRC721Wrapper'),
            getGlobalContract('eRC1155Wrapper')
        ]).map(it => blockchainCall(it.methods.collectionId)))).indexOf(itemData.collectionId)
    } catch(e) {}

    return await loadItemDynamicInfo({chainId, context, account, newContract}, {
        id : itemId,
        ...itemData,
        ...itemData.header,
        mainInterface : item,
        mainInterfaceAddress : item.options.address,
        host : collectionData.host,
        collectionData,
        address,
        contract,
        decimals : "18",
        wrapType : wrapTypes[index],
        wrapper : wrappers[index],
        balance : await blockchainCall(contract.methods.balanceOf, account),
        price : await getTokenPriceInDollarsOnUniswapV3({context, newContract, chainId}, address, 18)
    }, item)
}

export async function loadItemDynamicInfo({chainId, context, account, newContract}, itemData, item) {
    if(typeof itemData === 'string') {
        return await loadItem({context, chainId, account, newContract}, itemData, item)
    }
    const metadata = await tryRetrieveMetadata({context}, itemData)
    const delegation = await tryRetrieveDelegationAddressFromItem({context, chainId}, itemData)
    return {
        ...itemData,
        ...metadata,
        image : delegation?.tokenURI || delegation?.image || metadata.image,
        delegation,
        metadata,
        balance : await blockchainCall(itemData.mainInterface.methods.balanceOf, account, itemData.id)
    }
}

export async function loadCollectionMetadata({context, newContract, getGlobalContract}, collectionId, mainInterface) {
    var data = {...await blockchainCall(mainInterface.methods.collection, collectionId)}
    data.hostContract = newContract(context.MultiOperatorHostABI, data.host)
    try {
        data.mintOperator = await blockchainCall(data.hostContract.methods.operator, 1)
        data.metadataOperator = await blockchainCall(data.hostContract.methods.operator, 4)
    } catch(e) {
    }
    var metadata = await tryRetrieveMetadata({context}, {
        ...data,
        mainInterface,
        id : collectionId
    })
    if(collectionId === '0xc8ae2302153c696a508f505d7a046ff5fa78dcf79478eea09c682d0101f02252') {
        metadata.image = 'https://gateway.ipfs.io/ipfs/QmYpYpHVNtvPYJsuDcjfGEXc9y5FozERzQ92JaRcAcfq3h'
    }
    var wrappers
    var index = (await Promise.all((wrappers = [
        getGlobalContract('eRC20Wrapper'),
        getGlobalContract('eRC721Wrapper'),
        getGlobalContract('eRC1155Wrapper')
    ]).map(it => blockchainCall(it.methods.collectionId)))).indexOf(collectionId)

    metadata = {...metadata, ...itemProjectionsMetadata[index]}
    return metadata
}

export async function loadCollection({chainId, context, web3, newContract, account, getGlobalContract}, collectionId, factory, item) {
    var collectionData = await loadCollectionMetadata({context, newContract, getGlobalContract}, collectionId, item = item || newContract(context.ItemMainInterfaceABI, await blockchainCall(factory.methods.mainInterface)))
    return {
        ...collectionData,
        items : await loadItemsByFactories({chainId, context, web3, account, newContract, collectionData, getGlobalContract}, factory)
    }
}

export function wrapERC20({web3}, token, _, value, w20) {
    var items = [{
        header : {
          host : VOID_ETHEREUM_ADDRESS,
          name : "",
          symbol : "",
          uri : ""
        },
        collectionId : web3.eth.abi.encodeParameter("address", token.address),
        id : "0",
        accounts : [],
        amounts : [value]
    }]
    return blockchainCall(w20.methods.mintItemsWithPermit, items, [], {value : token.address === VOID_ETHEREUM_ADDRESS ? value : '0'})
}

export function encodeHeader(header) {
    var headerType = [
        "address",
        "string",
        "string",
        "string"
    ]
    var headerVal = [
        header.host,
        header.name,
        header.symbol,
        header.uri
    ]
    return abi.encode([`tuple(${headerType.join(',')})`], [headerVal])
}

export function wrapNFT({ account }, token, _, value, wrapper, type) {
    if(type === 'ERC1155') {
        return blockchainCall(token.mainInterface.methods.safeTransferFrom, account, wrapper.options.address, token.id, value, abi.encode(['uint256[]', 'address[]'], [[value], [account]]))
    }
    return blockchainCall(wrapper.methods.mintItems, [{
        header : {
          host : VOID_ETHEREUM_ADDRESS,
          name : "",
          symbol : "",
          uri : ""
        },
        collectionId : abi.encode(["address"], [token.mainInterfaceAddress]),
        id : token.id,
        accounts : [],
        amounts : []
    }])
}

export async function checkCoverSize({context}, file, mandatory) {
    if(!file && mandatory) {
        throw "Cover is Mandatory"
    }
    var cover
    if ((typeof file).toLowerCase() === "string") {
        cover = await (await fetch(formatLink({context}, file))).blob()
    } else {
        cover = file.size ? file : file.item ? file.item(0) : file.get(0)
    }
    if(!cover && mandatory) {
        throw "Cover is Mandatory"
    }
    return await new Promise(function(ok, ko) {
        try {
            var reader = new FileReader()
            reader.addEventListener("load", function() {
                var image = new Image()
                image.onload = function onload() {
                    var byteLength = parseInt(reader.result.substring(reader.result.indexOf(',') + 1).replace(/=/g, "").length * 0.75)
                    var mBLength = byteLength / 1024 / 1024
                    return ok(image.width <= context.metadataCoverMaxWidth && mBLength <= (context.metadataCoverMaxWeightInMB || 100000))
                }
                image.src = (window.URL || window.webkitURL).createObjectURL(cover)
            }, false)
            reader.readAsDataURL(cover)
        } catch(e) {
            return ko(e)
        }
    })
}

export function checkCollectionMetadata(metadata, throwOnError) {
    var errors = []

    if(!metadata) {
        errors.push('Metadata')
    }

    if(metadata && !metadata.description) {
        errors.push('Description is mandatory')
    }

    if(metadata && (!metadata.image || ((typeof metadata.image).toLowerCase() === 'filelist' && metadata.image.length === 0))) {
        errors.push('Cover image is mandatory')
    }

    if(metadata && !metadata.background_color) {
        errors.push('Background Color is mandatory')
    }

    if(errors.length > 0 && throwOnError) {
        throw `Errors:\n${errors.join('\n')}`
    }

    return errors.length === 0
}

export async function deployCollection({ context, ipfsHttpClient, projectionFactory }, state) {
    if(state.disabled) {
        return
    }
    var uri = state.metadataLink || await uploadMetadata({ context, ipfsHttpClient }, state.metadata)

    console.log(uri)

    var ops = [
        1,
        4
    ]

    var authorized = [
        state.host,
        state.metadataHost
    ]

    var headerType = [
        "address",
        "string",
        "string",
        "string"
    ]

    var headerVal = [
        VOID_ETHEREUM_ADDRESS,
        state.name,
        state.symbol,
        uri
    ]

    var createItemType = [
        `tuple(${headerType.join(',')})`,
        'bytes32',
        'uint256',
        'address[]',
        'uint256[]'
    ]

    var deployData = abi.encode(["uint256[]", "address[]"], [ops, authorized])
    deployData = abi.encode(["bytes32", `tuple(${headerType.join(',')})`, `tuple(${createItemType.join(',')})[]`, 'bytes'], [VOID_BYTES32, headerVal, [], deployData])
    deployData = abi.encode(['address', 'bytes'], [VOID_ETHEREUM_ADDRESS, deployData])
    deployData = abi.encode(['uint256', 'bytes'], [0, deployData])

    return await blockchainCall(projectionFactory.methods.deploy, deployData)
}

function checkSingleItemMetadata(field, metadataType) {
    if((!metadataType.type || metadataType.type === 'color' || metadataType.type === 'textarea' || metadataType.type === 'text' || metadataType.type === 'url') && !field) {
        return `${metadataType.label} is empty`
    }

    if(metadataType?.type === 'file' && !field || (((typeof field).toLowerCase() === 'filelist' && field.length === 0))) {
        return `${metadataType.label} is not set`
    }
}

export function checkItemMetadata(metadata, metadataTypes, throwOnError) {
    if(!metadataTypes) {
        return false
    }

    var errors = []

    if(!metadata) {
        errors.push('Metadata')
    } else {
        var mandatoryFields = metadataTypes.filter(it => it.mandatory)
        for(var mandatoryField of mandatoryFields) {
            var error = checkSingleItemMetadata(metadata[mandatoryField.field], mandatoryField)
            error && errors.push(error)
        }
    }

    if(errors.length > 0 && throwOnError) {
        throw `Errors:\n${errors.join('\n')}`
    }

    return errors.length === 0
}

export async function deployItem({ context, ipfsHttpClient, projectionFactory, newContract, account }, state) {
    if(state.disabled) {
        return
    }

    const mainInterface = newContract(context.ItemMainInterfaceABI, await blockchainCall(projectionFactory.methods.mainInterface))

    const header = await blockchainCall(mainInterface.methods.collection, state.collectionId)

    const projection = newContract(context.MultiOperatorHostABI, header.host)

    if(state.hostType === 'metadata') {
        return await blockchainCall(projection.methods.setOperator, 4, state.host)
    }

    if(state.hostType === 'mint') {
        return await blockchainCall(projection.methods.setOperator, 1, state.host)
    }

    var uri = state.metadataLink || await uploadMetadata({ context, ipfsHttpClient }, {...state.metadata, attributes : state.attributes || [], name : state.name, symbol : state.symbol})

    console.log(uri)

    const newHeader = {
        host : VOID_ETHEREUM_ADDRESS,
        name: state.name,
        symbol : state.symbol,
        uri
    }

    if(state.item !== 'new' && !state.amount) {
        var id = abi.decode(['uint256'], abi.encode(['address'], [state.item]))[0].toString()
        return await blockchainCall(projection.methods.setItemsMetadata, [id], [newHeader])
    }

    const createItems = [{
        header : newHeader,
        collectionId : state.collectionId,
        id : state.item === 'new' ? '0' : abi.decode(['uint256'], abi.encode(['address'], [state.item]))[0].toString(),
        accounts : [account],
        amounts : [toDecimals(state.amount, 18)]
    }]

    return await blockchainCall(projection.methods.mintItems, createItems)
}

export async function loadToken({context, chainId, web3, account, newContract, getGlobalContract}, collectionAddress, objectId) {
    if(!objectId || collectionAddress === VOID_ETHEREUM_ADDRESS) {
        var tokenAddress = objectId || collectionAddress
        tokenAddress = tokenAddress.toLowerCase().indexOf('0x') === 0 ? tokenAddress : abi.decode(["address"], abi.encode(["uint256"], [objectId]))[0]
        tokenAddress = web3Utils.toChecksumAddress(tokenAddress)
        await loadTokenFromAddress({ context, account, web3, newContract }, tokenAddress)
    }

    return await loadItem({context, chainId, web3, account, newContract, getGlobalContract}, objectId)
}

export async function hostedItems({context, chainId, web3, account, newContract, getGlobalContract}) {

    const factories = [getGlobalContract("itemProjectionFactory")]

    const itemMainInterface = newContract(context.ItemMainInterfaceABI, await blockchainCall(factories[0].methods.mainInterface))

    var args = {
        address : factories.map(it => it.options.address),
        fromBlock : '0x0',
        toBlock : 'latest',
        topics : [
            web3Utils.sha3('Deployed(address,address,address,bytes)')
        ]
    }
    var logs = await sendAsync(web3.currentProvider, 'eth_getLogs', args)

    args.address = logs.map(it => abi.decode(["address"], it.topics[2])[0])
    args.topics = [
        web3Utils.sha3('Operator(uint256,address,address)'),
        abi.encode(["uint256"], [1]),
        [],
        abi.encode(["address"], [account])
    ]
    logs = await sendAsync(web3.currentProvider, 'eth_getLogs', args)

    if(logs.length === 0) {
        return []
    }

    var projectionAddresses = logs.map(it => it.address).filter((it, index, array) => array.indexOf(it) === index)

    var projections = projectionAddresses.map(it => newContract(context.MultiOperatorHostABI, it))
    var hosts = await Promise.all(projections.map(it => blockchainCall(it.methods.operator, 1)))

    var collectionIds = await Promise.all(projections.map((it, i) => hosts[i] === account && blockchainCall(it.methods.collectionId)))
    collectionIds = collectionIds.filter(it => it)

    var topics = [
        web3Utils.sha3("CollectionItem(bytes32,bytes32,uint256)"),
        [],
        collectionIds
    ]

    var itemLogs = await getLogsFromFactories({context, web3, newContract}, factories, topics)
    itemLogs = itemLogs.logs.map(it => abi.decode(["uint256"], it.topics[3])[0].toString())

    return await Promise.all(itemLogs.map(it => loadItem({context, chainId, web3, account, newContract, getGlobalContract}, it)))
}