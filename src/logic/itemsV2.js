import { getTokenPriceInDollarsOnUniswapV3, memoryFetch, VOID_ETHEREUM_ADDRESS, web3Utils, sendAsync, blockchainCall, abi, tryRetrieveMetadata, uploadMetadata, formatLink, VOID_BYTES32, toDecimals, getNetworkElement, async, newContract, numberToString, swap, fromDecimals } from "@ethereansos/interfaces-core"

import itemProjectionsMetadata from './itemProjectionsMetadata.json'

import { loadTokenFromAddress } from "./erc20"
import { tryRetrieveDelegationAddressFromItem } from "./delegation"
import { getOwnedTokens, loadAsset, retrieveAsset } from './opensea'
import { getRawField } from './generalReader'

import { getLogs } from "./logger"

const MAX_UINT128 = '0x' + web3Utils.toBN(2).pow(web3Utils.toBN(128)).sub(web3Utils.toBN(1)).toString('hex')
const MAX_UINT256 = '0x' + web3Utils.toBN(2).pow(web3Utils.toBN(256)).sub(web3Utils.toBN(1)).toString('hex')

const wrappedCollectionIds = {
    chainId : undefined,
    wrappers : [],
    wrapTypes : [
        'ERC20',
        'ERC721',
        'ERC1155',
        'ERC721',
        'ERC1155'
    ],
    collectionIds : []
}

export async function loadWrappedCollectionIds(data) {

    const { getGlobalContract, chainId } = data

    if(chainId !== wrappedCollectionIds.chainId) {
        wrappedCollectionIds.chainId = chainId
        wrappedCollectionIds.collectionIds = Promise.all((wrappedCollectionIds.wrappers = [
            getGlobalContract('eRC20Wrapper'),
            getGlobalContract('eRC721Wrapper'),
            getGlobalContract('eRC1155Wrapper'),
            getGlobalContract('eRC721WrapperDeck'),
            getGlobalContract('eRC1155WrapperDeck')
        ]).map(it => blockchainCall(it.methods.collectionId)))
    }

    return await wrappedCollectionIds.collectionIds
}

export async function loadItemsByFactories({seaport, context, chainId, web3, account, newContract, getGlobalContract, collectionData, excluding, wrappedOnly, allMine}, factories) {

    try {
        var topics = collectionData ? [
            web3Utils.sha3("CollectionItem(bytes32,bytes32,uint256)"),
            [],
            collectionData.id
        ] : "CollectionItem(bytes32,bytes32,uint256)"

        var { items, logs } = await getLogsFromFactories({chainId, context, web3, newContract}, factories, topics)

        const wrappedCollectionIds = await loadWrappedCollectionIds({ chainId, getGlobalContract})
        var exclusiveIncluding = []

        const noDecks = wrappedOnly !== 'Deck' ? [
            wrappedCollectionIds[3],
            wrappedCollectionIds[4]
        ] : []

        if(wrappedOnly) {
            exclusiveIncluding = [
                wrappedCollectionIds[wrappedOnly === true ? 3 : 1],
                wrappedCollectionIds[wrappedOnly === true ? 4 : 2]
            ]
            wrappedOnly === true && exclusiveIncluding.unshift(await loadWrappedCollectionIds({ chainId, getGlobalContract})[0])
        }

        var exclusiveIncluding = wrappedOnly && [
            await blockchainCall(getGlobalContract(`eRC721Wrapper${wrappedOnly === true ? '' : wrappedOnly}`).methods.collectionId),
            await blockchainCall(getGlobalContract(`eRC1155Wrapper${wrappedOnly === true ? '' : wrappedOnly}`).methods.collectionId)
        ]
        wrappedOnly === true && exclusiveIncluding.unshift(await loadWrappedCollectionIds({ chainId, getGlobalContract})[0])

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
            if(noDecks.indexOf(collectionId) !== -1) {
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
            const args = {
                address : itemIds.map(it => abi.decode(["address"], abi.encode(["uint256"], [it.itemId]))[0]).filter((it, i, arr) => arr.indexOf(it) === i),
                topics : [
                    web3Utils.sha3('Transfer(address,address,uint256)'),
                    [],
                    abi.encode(['address'], [account])
                ],
                fromBlock : web3Utils.toHex(getNetworkElement({ context, chainId }, 'deploySearchStart')) || "0x0",
                toBlock : 'latest'
            }
            var logs = await getLogs(web3.currentProvider, 'eth_getLogs', args)
            logs = logs.map(it => it.address).filter((it, index, arr) => arr.indexOf(it) === index)
            logs = await Promise.all(logs.map(async it => ({
                address : it,
                balance : await blockchainCall(newContract(context.IERC20ABI, it).methods.balanceOf, account)
            })))
            logs = logs.filter(it => parseInt(it.balance) > 0).map(it => abi.decode(["uint256"], abi.encode(["address"], [it.address]))[0].toString())
            itemIds = itemIds.filter(it => logs.indexOf(it.itemId) !== -1)
        }

        var vals = await Promise.all(itemIds.map(it => loadItem({ seaport, context, chainId, account, newContract, collectionData, getGlobalContract, lightweight : true }, it.itemId, it.item)))
        //vals = await Promise.all(vals.map(it => loadItemDynamicInfo({ seaport, chainId, context, account, newContract }, it)))

        if(allMine) {
            vals = vals.filter(it => it.balance !== '0')
        }
        return vals
    } catch(e) {
        const message = (e.message || e).toLowerCase()
        if(message.indexOf('header not found') !== -1) {
            await new Promise(ok => setTimeout(ok, 3000))
            return await loadItemsByFactories({seaport, context, chainId, web3, account, newContract, getGlobalContract, collectionData, excluding, wrappedOnly, allMine}, factories)
        }
        throw e
    }
}

export async function loadCollectionsByFactories({seaport, chainId, context, web3, account, newContract, getGlobalContract}, factories) {

    var { items, logs } = await getLogsFromFactories({chainId, context, web3, newContract}, factories, "Collection(address,address,bytes32)")

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

    var itemLogs = await getLogsFromFactories({chainId, context, web3, newContract}, factories, topics)

    var nonEmptyCollections = {}

    itemLogs.logs.forEach(it => nonEmptyCollections[it.topics[2]] = true)

    var toExclude = collectionIds.filter(it => !nonEmptyCollections[it.collectionId])

    var collections = await Promise.all(collectionIds.map(it => loadCollection({seaport, chainId, context, web3, account, newContract, getGlobalContract, deep : true}, it.collectionId, factories, it.item)))

    var wrapperCollectionIds = await loadWrappedCollectionIds({getGlobalContract, chainId})
    const wrapperCollectionsItems = [
        ...collections.filter(it => it.id === wrapperCollectionIds[3])[0].items,
        ...collections.filter(it => it.id === wrapperCollectionIds[4])[0].items
    ]

    collections = collections.filter(it => it.id !== wrapperCollectionIds[3] && it.id !== wrapperCollectionIds[4])

    collections.push({
        name : 'Decks',
        isDecks : true,
        items : wrapperCollectionsItems
    })

    return collections
}

export async function getLogsFromFactories({context, web3, newContract, chainId}, factories, topics) {
    var array = factories instanceof Array ? factories : [factories]

    var address = await Promise.all(array.map(it => blockchainCall(it.methods.mainInterface)))
    address = address.filter((it, i) => address.indexOf(it) === i)

    var items = address.map(it => newContract(context.ItemMainInterfaceABI, it))

    var args = {
        address,
        topics : typeof topics === 'string' ? [
            web3Utils.sha3(topics)
        ] : topics,
        fromBlock : web3Utils.toHex(getNetworkElement({ context, chainId }, 'deploySearchStart')) || "0x0",
        toBlock : 'latest'
    }

    var logs = await getLogs(web3.currentProvider, 'eth_getLogs', args)

    return {
        items,
        logs
    }
}

export async function loadiETH({context, chainId, account, newContract, getGlobalContract}) {
    return await loadItem({context, chainId, account, newContract, getGlobalContract}, await blockchainCall(getGlobalContract('eRC20Wrapper').methods.itemIdOf, VOID_ETHEREUM_ADDRESS))
}

export async function loadItem({seaport, context, chainId, account, newContract, getGlobalContract, collectionData, lightweight }, itemId, item) {
    var address = item ? await blockchainCall(item.methods.interoperableOf, itemId) : itemId.indexOf('0x') === 0 ? itemId : abi.decode(["address"], abi.encode(["uint256"], [itemId]))[0]
    var contract = newContract(context.ItemInteroperableInterfaceABI, address)
    itemId = item ? itemId : await blockchainCall(contract.methods.itemId)
    item = item || newContract(context.ItemMainInterfaceABI, await blockchainCall(contract.methods.mainInterface))
    var itemData = await blockchainCall(item.methods.item, itemId)
    collectionData = collectionData || await loadCollectionMetadata({chainId, context, newContract, getGlobalContract}, itemData.collectionId, item)
    var index = -1
    try {
        index = (await loadWrappedCollectionIds({ chainId, getGlobalContract })).indexOf(itemData.collectionId)
    } catch(e) {}

    var result = {
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
        wrapType : wrappedCollectionIds.wrapTypes[index],
        wrapper : wrappedCollectionIds.wrappers[index],
        /*balance : await blockchainCall(contract.methods.balanceOf, account),
        price : await getTokenPriceInDollarsOnUniswapV3({context, newContract, chainId}, address, 18),*/
        isDeck : index > 2
    }

    try {
        result = lightweight ? result : await loadItemDynamicInfo({seaport, chainId, context, account, newContract}, result, item)
    } catch(e) {
    }

    return result
}

export async function loadDeckMetadata({chainId, context, account, newContract, seaport}, itemData) {

    var asset = loadAsset(itemData.id)

    if(!asset) {
        try {
            const args = {
                address : itemData.wrapper.options.address,
                topics : [
                    web3Utils.sha3('Token(address,uint256,uint256)'),
                    [],
                    [],
                    abi.encode(["uint256"], [itemData.id])
                ],
                fromBlock : web3Utils.toHex(getNetworkElement({ context, chainId }, 'deploySearchStart')) || "0x0",
                toBlock : 'latest'
            }
            const logs = await getLogs(itemData.contract.currentProvider, 'eth_getLogs', args)
            if(logs.length !== 0) {
                var element = {
                    id : abi.decode(["uint256"], logs[0].topics[2])[0].toString(),
                    mainInterface : {
                        options : {
                            address : abi.decode(["address"], logs[0].topics[1])[0].toString()
                        }
                    }
                }
                asset = await retrieveAsset({context, seaport, newContract, account}, element.mainInterface.options.address, element.id)

                window.localStorage.setItem(itemData.id, JSON.stringify({ collection : asset.collection }))
            }
        } catch(e) {
            console.log(e)
        }
    }
    return asset.collection.imageUrl?.split('s120').join('s300')
}

export async function loadItemDynamicInfo({chainId, context, account, newContract, seaport}, itemData, item) {
    if(typeof itemData === 'string') {
        return await loadItem({context, chainId, account, newContract}, itemData, item)
    }

    const oldData = {...itemData}
    var metadata = { ...oldData }

    var delegation

    if(itemData.wrapper && itemData.isDeck && seaport) {
        metadata.image = await loadDeckMetadata({chainId, context, account, newContract, seaport}, itemData)
    } else {
        const key = `${web3Utils.toChecksumAddress(itemData.mainInterfaceAddress)}-${itemData.id}`
        var asset = loadAsset(key)

        if(asset && Object.keys(asset).length === 0) {
            asset = undefined
        }

        try {
            metadata = asset || {...(await tryRetrieveMetadata({context}, itemData))}
            //metadata = asset || {...(await loadMetadata({ context, provider : itemData.contract.currentProvider, newContract }, itemData.mainInterfaceAddress, itemData.id))}
            if(!asset) {
                try {
                    asset = { ...metadata.metadata }
                    if(asset && Object.keys(asset).length > 0) {
                        window.localStorage.setItem(key, JSON.stringify(asset))
                    }
                } catch(e) {
                }
            }
            metadata = {...metadata, ...asset, metadata : asset }
        } catch(e) {
            console.log(e)
        }

        delegation = await tryRetrieveDelegationAddressFromItem({context, chainId}, itemData)
    }

    metadata.id = oldData.id
    metadata.address = oldData.address

    var result = {
        ...itemData,
        ...metadata,
        image : delegation?.tokenURI || delegation?.image || metadata.image,
        delegation,
        metadata,
        //balance : await blockchainCall(itemData.mainInterface.methods.balanceOf, account, itemData.id)
    }

    return result
}

export async function loadCollectionMetadata({chainId, context, newContract, getGlobalContract, deep}, collectionId, mainInterface) {
    var data = {...await blockchainCall(mainInterface.methods.collection, collectionId)}
    data.hostContract = newContract(context.MultiOperatorHostABI, data.host)
    try {
        data.mintOperator = await blockchainCall(data.hostContract.methods.operator, 1)
        data.metadataOperator = await blockchainCall(data.hostContract.methods.operator, 4)
    } catch(e) {
    }

    var metadata = {
        ...data,
        mainInterface,
        id : collectionId
    }
    metadata = !deep ? metadata : await tryRetrieveMetadata({context}, {
        ...data,
        mainInterface,
        id : collectionId
    })
    if(collectionId === '0xc8ae2302153c696a508f505d7a046ff5fa78dcf79478eea09c682d0101f02252') {
        metadata.image = 'https://gateway.ipfs.io/ipfs/QmYpYpHVNtvPYJsuDcjfGEXc9y5FozERzQ92JaRcAcfq3h'
    }
    var wrappers
    var index = (await loadWrappedCollectionIds({ chainId, getGlobalContract })).indexOf(collectionId)

    metadata = {...metadata, ...itemProjectionsMetadata[index]}
    return metadata
}

export async function loadCollection({seaport, chainId, context, web3, newContract, account, getGlobalContract, deep}, collectionId, factory, item) {
    var collectionData = await loadCollectionMetadata({chainId, context, newContract, getGlobalContract, deep}, collectionId, item = item || newContract(context.ItemMainInterfaceABI, await blockchainCall(factory.methods.mainInterface)))
    return {
        ...collectionData,
        items : await loadItemsByFactories({seaport, chainId, context, web3, account, newContract, collectionData, getGlobalContract}, factory)
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

export function wrapNFT({ account }, token, _, value, wrapper, type, reserve) {

    if(type.indexOf('ERC1155') !== -1) {
        var data = abi.encode(['uint256[]', 'address[]'], [[value], [account]])
        if(type.indexOf('Deck') !== -1) {
            data = abi.encode(['uint256[]', 'address[]', 'bool'], [[value], [account], reserve === true])
        }
        return blockchainCall(token.mainInterface.methods.safeTransferFrom, account, wrapper.options.address, token.id, value, data)
    }

    const createItems = [{
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
    }]

    if(type.indexOf('Deck') !== -1) {
        const mintItems = Object.entries(wrapper.methods).filter(it => it[0].indexOf('mintItems') !== -1 && it[0].indexOf('bool[]') !== -1)[0]
        return blockchainCall(mintItems[1], createItems, [reserve === true])
    }

    return blockchainCall(wrapper.methods.mintItems, createItems)
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
        fromBlock : web3Utils.toHex(getNetworkElement({ context, chainId }, 'deploySearchStart')) || "0x0",
        toBlock : 'latest',
        topics : [
            web3Utils.sha3('Deployed(address,address,address,bytes)')
        ]
    }
    var logs = await getLogs(web3.currentProvider, 'eth_getLogs', args)

    args.address = logs.map(it => abi.decode(["address"], it.topics[2])[0])
    args.topics = [
        web3Utils.sha3('Operator(uint256,address,address)'),
        abi.encode(["uint256"], [1]),
        [],
        abi.encode(["address"], [account])
    ]
    logs = await getLogs(web3.currentProvider, 'eth_getLogs', args)

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

    var itemLogs = await getLogsFromFactories({chainId, context, web3, newContract}, factories, topics)
    itemLogs = itemLogs.logs.map(it => abi.decode(["uint256"], it.topics[3])[0].toString())

    return await Promise.all(itemLogs.map(it => loadItem({context, chainId, web3, account, newContract, getGlobalContract}, it)))
}

export async function loadDeckWrapper(data, item) {

    const { getGlobalContract } = data

    const wrappers = [
        getGlobalContract('eRC721WrapperDeck'),
        getGlobalContract('eRC1155WrapperDeck')
    ]

    return wrappers[await blockchainCall(wrappers[0].methods.source, item.id) !== VOID_ETHEREUM_ADDRESS ? 0 : 1]

}

export async function loadTokens(data, item) {

    var { wrapper, chainId, context } = data

    wrapper = wrapper || await loadDeckWrapper(data, item)

    const args = {
        address : wrapper.options.address,
        topics : [
            web3Utils.sha3('Token(address,uint256,uint256)'),
            [],
            [],
            abi.encode(["uint256"], [item.id])
        ],
        fromBlock : web3Utils.toHex(getNetworkElement({ context, chainId }, 'deploySearchStart')) || "0x0",
        toBlock : 'latest'
    }

    const logs = await getLogs(wrapper.currentProvider, 'eth_getLogs', args)

    if(logs.length === 0) {
        return {}
    }

    return {
        tokenAddress : abi.decode(["address"], logs[0].topics[1])[0],
        ids : logs.map(it => abi.decode(["uint256"], it.topics[2])[0].toString()).filter((it, i, arr) => arr.indexOf(it) === i)
    }
}

export async function loadDeckItem(data, itemId, item) {

    item = await loadItem(data, itemId, item)

    var { getGlobalContract, wrapper, is721, seaport, context, newContract, chainId } = data

    wrapper = wrapper || await loadDeckWrapper(data, item)

    is721 = is721 !== undefined ? is721 : wrapper === getGlobalContract('eRC721WrapperDeck')

    var originalAddress = await blockchainCall(wrapper.methods.source, item.id)
    originalAddress = typeof originalAddress === 'string' ? originalAddress : originalAddress[0]

    const args = {
        address : wrapper.options.address,
        topics : [
            web3Utils.sha3('Token(address,uint256,uint256)'),
            abi.encode(["address"], [originalAddress]),
            [],
            abi.encode(["uint256"], [item.id])
        ],
        fromBlock : web3Utils.toHex(getNetworkElement({ context, chainId }, 'deploySearchStart')) || "0x0",
        toBlock : 'latest'
    }

    const logs = await getLogs(wrapper.currentProvider, 'eth_getLogs', args)

    const tokenId = abi.decode(["uint256"], logs[0].topics[2])[0].toString()

    const collection = (await seaport.api.getAsset({ tokenAddress : originalAddress, tokenId })).collection

    item = {
        ...item,
        collectionData : {
            ...item.collectionData,
            ...collection
        },
        wrapper,
        is721,
        originalAddress,
        original : newContract(context[`${is721 ? 'IERC721' : 'IERC1155'}ABI`], originalAddress)
    }

    return item
}

export async function loadDeckItems(data, item, method) {

    var { getGlobalContract, wrapper, is721 } = data

    wrapper = wrapper || await loadDeckWrapper(data, item)

    is721 = is721 !== undefined ? is721 : wrapper === getGlobalContract('eRC721WrapperDeck')

    if(method === 'wrap') {
        return await loadDeckItemsForWrap({...data, wrapper, is721}, item)
    }
    return await loadDeckItemsForUnwrap({...data, wrapper, is721}, item)
}

export async function loadDeckItemsForWrap(data, item) {

    var { getGlobalContract, wrapper, is721 } = data

    wrapper = wrapper || await loadDeckWrapper(data, item)

    is721 = is721 !== undefined ? is721 : wrapper === getGlobalContract('eRC721WrapperDeck')

    if(is721) {
        return await load721DeckItemsForWrap({...data, wrapper, is721}, item)
    }
    return await load1155DeckItemsForWrap({...data, wrapper, is721}, item)
}

export async function loadDeckItemsForUnwrap(data, item) {

    var { getGlobalContract, wrapper, is721 } = data

    wrapper = wrapper || await loadDeckWrapper(data, item)

    is721 = is721 !== undefined ? is721 : wrapper === getGlobalContract('eRC721WrapperDeck')

    if(is721) {
        return await load721DeckItemsForUnwrap({...data, wrapper, is721}, item)
    }
    return await load1155DeckItemsForUnwrap({...data, wrapper, is721}, item)
}

export async function load721DeckItemsForWrap(data, item) {
    return await load721ItemsFromAddress(data, await blockchainCall((data.wrapper = data.wrapper || await loadDeckWrapper(data, item)).methods.source, item.id))
}

export async function load721ItemsFromAddress(data, originalAddress) {

    const { context, account, web3, newContract, chainId } = data

    const args = {
        address : originalAddress,
        topics : [
            web3Utils.sha3('Transfer(address,address,uint256)'),
            [],
            [abi.encode(["address"], [account])]
        ],
        fromBlock : web3Utils.toHex(getNetworkElement({ context, chainId }, 'deploySearchStart')) || "0x0",
        toBlock : 'latest'
    }
    const logs = await getLogs(web3.currentProvider, 'eth_getLogs', args)

    const tokenIds = logs.map(it => abi.decode(["uint256"], it.topics.length > 3 ? it.topics[3] : it.data)[0].toString()).filter((it, i, arr) => arr.indexOf(it) === i)

    const contract = newContract(context.IERC721ABI, originalAddress)

    var originalItems = (await Promise.all(tokenIds.map(async it => {
        if(web3Utils.toChecksumAddress(account) !== web3Utils.toChecksumAddress(await blockchainCall(contract.methods.ownerOf, it))) {
            return
        }
        return it
    }))).filter(it => it)

    if(originalItems.length === 0) {
        return []
    }

    var items = await getOwnedTokens(data, 'ERC721', originalAddress)

    if(items.length !== originalItems.length) {
        items = items.filter(it => originalItems.indexOf(it.tokenId) !== -1)
        if(items.length !== originalItems.length) {
            const remainingItems = originalItems.filter(it => items.filter(ite => ite.tokenId === it).length === 0)
            items.push(...await Promise.all(remainingItems.map(it => load721(data, contract, it))))
        }
    }

    return items
}

export function loadNFTItemsFromAddress(data, address, type) {
    if(type === 'ERC721') {
        return load721ItemsFromAddress(data, address)
    }
    return load1155ItemsFromAddress(data, address)
}

export async function load1155DeckItemsForWrap(data, item) {
    return load1155ItemsFromAddress(data, (await blockchainCall((data.wrapper = data.wrapper || await loadDeckWrapper(data, item)).methods.source, item.id))[0])
}

export async function load1155ItemsFromAddress(data, originalAddress) {
    var { context, account, web3, newContract, chainId } = data

    const transferSingle = web3Utils.sha3('TransferSingle(address,address,address,uint256,uint256)')
    const transferBatch = web3Utils.sha3('TransferBatch(address,address,address,uint256[],uint256[])')

    const args = {
        address : originalAddress,
        topics : [
            [
                transferSingle,
                transferBatch
            ],
            [],
            [],
            [abi.encode(["address"], [account])]
        ],
        fromBlock : web3Utils.toHex(getNetworkElement({ context, chainId }, 'deploySearchStart')) || "0x0",
        toBlock : 'latest'
    }
    const logs = await getLogs(web3.currentProvider, 'eth_getLogs', args)

    var tokenIds = []
    logs.forEach(it => {
        const type = ('uint256' + (it.topics[0] === transferSingle ? '' : '[]'))
        const args = it.topics.length === 4 ? [
            type,
            type
        ] : [
            type
        ]

        const data = abi.decode(args, it.topics.length === 4 ? it.data : it.topics[5])[0]
        tokenIds.push(data instanceof Array ? data.map(it => it.toString()) : data.toString())
    })
    tokenIds = tokenIds.filter((it, i, arr) => arr.indexOf(it) === i)

    const contract = newContract(context.IERC1155ABI, originalAddress)

    var originalItems = (await Promise.all(tokenIds.map(async it => {
        const balance = await blockchainCall(contract.methods.balanceOf, account, it)
        if(balance === '0') {
            return
        }
        return { id : it, balance }
    }))).filter(it => it)

    if(originalItems.length === 0) {
        return []
    }

    var items = await getOwnedTokens(data, 'ERC1155', originalAddress)
    if(items.length !== originalItems.length) {
        items = items.filter(it => originalItems.filter(ite => it.tokenId === ite.id).length > 0)
        if(items.length !== originalItems.length) {
            const remainingItems = originalItems.filter(it => items.filter(ite => ite.tokenId === it.it).length === 0)
            items.push(...await Promise.all(remainingItems.map(it => load1155(data, contract, it.id))))
        }
    }

    items = items.map(it => ({...it, balance : originalItems.filter(or => or.id === it.tokenId)[0].balance}))

    return items
}

export async function load721DeckItemsForUnwrap(data, item) {

    var { context, wrapper, tokens, newContract } = data

    wrapper = wrapper || await loadDeckWrapper(data, item)
    tokens = tokens || await loadTokens({...data, wrapper}, item)

    if(!tokens.ids || tokens.ids.length === 0) {
        return []
    }

    const contract = newContract(context.IERC721ABI, tokens.tokenAddress)

    var originalItems = tokens.ids = (await Promise.all(tokens.ids.map(async it => web3Utils.toChecksumAddress(await blockchainCall(contract.methods.ownerOf, it)) === web3Utils.toChecksumAddress(wrapper.options.address) && it))).filter(it => it)

    if(originalItems.length === 0) {
        return []
    }

    var items = await getOwnedTokens({...data, owner : wrapper.options.address}, 'ERC721', tokens.tokenAddress)

    if(items.length !== originalItems.length) {
        items = items.filter(it => originalItems.indexOf(it.tokenId) !== -1)
        if(items.length !== originalItems.length) {
            const remainingItems = originalItems.filter(it => items.filter(ite => ite.tokenId === it).length === 0)
            items.push(...await Promise.all(remainingItems.map(it => load721(data, contract, it))))
        }
    }

    return items
}

export async function load1155DeckItemsForUnwrap(data, item) {

    var { context, wrapper, tokens, newContract, chainId } = data

    wrapper = wrapper || await loadDeckWrapper(data, item)
    tokens = tokens || await loadTokens({...data, wrapper}, item)

    if(!tokens.ids || tokens.ids.length === 0) {
        return []
    }

    const contract = newContract(context.IERC1155ABI, tokens.tokenAddress)

    var balances = await Promise.all(tokens.ids.map(it => blockchainCall(contract.methods.balanceOf, wrapper.options.address, it)))
    balances = tokens.ids.reduce((acc, it, i) => ({ ...acc, [it] : balances[i] }), {})

    tokens.ids = tokens.ids.filter(it => parseInt(balances[it]) > 0)

    var originalItems = tokens.ids.map(id => ({id, balance : balances[id]}))

    if(originalItems.length === 0) {
        return []
    }

    var items = await getOwnedTokens({...data, owner : wrapper.options.address }, 'ERC1155', tokens.tokenAddress)
    if(items.length !== originalItems.length) {
        items = items.filter(it => originalItems.filter(ite => it.tokenId === ite.id).length > 0)
        if(items.length !== originalItems.length) {
            const remainingItems = originalItems.filter(it => items.filter(ite => ite.tokenId === it.it).length === 0)
            items.push(...await Promise.all(remainingItems.map(it => load1155(data, contract, it.id))))
        }
    }

    items = items.map(it => ({...it, balance : originalItems.filter(or => or.id === it.tokenId)[0].balance}))

    var args = {
        address : wrapper.options.address,
        topics : [
            web3Utils.sha3('ReserveData(address,address,uint256,uint256,uint256,bytes32)'),
            abi.encode(['address'], [tokens.tokenAddress]),
            tokens.ids.map(it => abi.encode(['uint256'], [it]))
        ],
        fromBlock : web3Utils.toHex(getNetworkElement({ context, chainId }, 'deploySearchStart')) || "0x0",
        toBlock : 'latest'
    }
    var logs = await getLogs(wrapper.currentProvider, 'eth_getLogs', args)
    var args = {
        address : wrapper.options.address,
        topics : [
            web3Utils.sha3('ReserveDataUnlocked(address,bytes32,address,uint256,address,uint256,uint256)'),
            logs.map(it => it.topics[3])
        ],
        fromBlock : web3Utils.toHex(getNetworkElement({ context, chainId }, 'deploySearchStart')) || "0x0",
        toBlock : 'latest'
    }
    var released = await getLogs(wrapper.currentProvider, 'eth_getLogs', args)
    released = released.map(it => it.topics[1])
    logs = logs.filter(it => released.indexOf(it.topics[3]) === -1)

    var reserves = tokens.ids.reduce((acc, it) => ({
        ...acc,
        [it] : logs.filter(log => log.topics[2] === abi.encode(['uint256'], [it])).map(log => {
            var data = abi.decode(['address', 'uint256', 'uint256'], log.data)
            return {
                key : log.topics[3],
                from : data[0],
                amount : data[1].toString(),
                timeout : data[2].toString(),
                address : tokens.tokenAddress,
                id : it
            }
        })
    }), {})

    items = items.map(it => ({...it, balance : balances[it.id], available : reserves[it.id].reduce((acc, it) => acc.ethereansosSub(it.amount), balances[it.id]), reserves : reserves[it.id]}))

    return items
}

export async function load721(data, contract, id) {

    const { context, chainId, wrapper } = data

    const token = {
        address : contract.options.address,
        tokenAddress : contract.options.address,
        mainInterfaceAddress : contract.options.address,
        id,
        tokenId : id,
        contract,
        type : 'ERC721',
        assetContract : {
            schemaName : 'ERC721'
        }
    }

    var metadataLink

    try {
        metadataLink = abi.decode(["string"], await getRawField({provider : contract.currentProvider}, contract.options.address, 'uri(uint256)', id))[0]
    } catch(e) {
        try {
            metadataLink = abi.decode(["string"], await getRawField({provider : contract.currentProvider}, contract.options.address, 'tokenURI(uint256)', id))[0]
        } catch(e) {
            try {
                metadataLink = abi.decode(["string"], await getRawField({provider : contract.currentProvider}, contract.options.address, 'uri'))[0]
            } catch(e) {
                try {
                    metadataLink = abi.decode(["string"], await getRawField({provider : contract.currentProvider}, contract.options.address, 'tokenURI'))[0]
                } catch(e) {
                }
            }
        }
    }

    var metadata

    metadataLink = metadataLink && metadataLink.split('{id}').join(id)
    metadataLink = metadataLink && formatLink({ context, chainId }, metadataLink)

    try {
        metadata = await (await fetch(metadataLink)).json()
    } catch(e) {
    }

    try {
        token.name = abi.decode(["string"], await getRawField({provider : contract.currentProvider}, contract.options.address, 'name(uint256)', id))[0]
    } catch(e) {
        try {
            token.name = abi.decode(["string"], await getRawField({provider : contract.currentProvider}, contract.options.address, 'name'))[0]
        } catch(e) {
        }
    }

    try {
        token.symbol = abi.decode(["string"], await getRawField({provider : contract.currentProvider}, contract.options.address, 'symbol(uint256)', id))[0]
    } catch(e) {
        try {
            token.symbol = abi.decode(["string"], await getRawField({provider : contract.currentProvider}, contract.options.address, 'symbol'))[0]
        } catch(e) {
        }
    }

    wrapper && (token.reserveData = await blockchainCall(wrapper.methods.reserveData, token.address, token.id))

    metadata = metadata || await retrieveAsset(data, contract.options.address, id)

    var result = {
        ...token,
        ...metadata.assetContract,
        ...metadata,
        metadata,
        metadataLink
    }

    result.image = result.imageUrl || result.image

    return result
}

export async function load1155(data, contract, id) {

    const { wrapper, context, chainId } = data

    const token = {
        address : contract.options.address,
        tokenAddress : contract.options.address,
        mainInterfaceAddress : contract.options.address,
        id,
        tokenId : id,
        contract,
        balance : wrapper ? await blockchainCall(contract.methods.balanceOf, wrapper.options.address, id) : '0',
        type : 'ERC1155',
        assetContract : {
            schemaName : 'ERC1155'
        }
    }

    var metadataLink

    try {
        metadataLink = abi.decode(["string"], await getRawField({provider : contract.currentProvider}, contract.options.address, 'uri'))[0]
    } catch(e) {
        try {
            metadataLink = abi.decode(["string"], await getRawField({provider : contract.currentProvider}, contract.options.address, 'uri(uint256)', id))[0]
        } catch(e) {
        }
    }

    metadataLink = metadataLink && metadataLink.split('{id}').join(id)
    metadataLink = metadataLink && formatLink({ context, chainId }, metadataLink)
    var metadata

    try {
        metadata = await (await fetch(metadataLink)).json()
    } catch(e) {
    }

    try {
        token.name = abi.decode(["string"], await getRawField({provider : contract.currentProvider}, contract.options.address, 'name(uint256)', id))[0]
    } catch(e) {
        try {
            token.name = abi.decode(["string"], await getRawField({provider : contract.currentProvider}, contract.options.address, 'name'))[0]
        } catch(e) {
        }
    }

    try {
        token.symbol = abi.decode(["string"], await getRawField({provider : contract.currentProvider}, contract.options.address, 'symbol(uint256)', id))[0]
    } catch(e) {
        try {
            token.symbol = abi.decode(["string"], await getRawField({provider : contract.currentProvider}, contract.options.address, 'symbol'))[0]
        } catch(e) {
        }
    }

    metadata = metadata || await retrieveAsset(data, contract.options.address, id)

    var result = {
        ...token,
        ...metadata.assetContract,
        ...metadata,
        metadata,
        metadataLink
    }

    result.image = result.imageUrl || result.image

    return result
}

export function cartAction(data, mode, item, cart, inputType, selectedAmount, reserveAll, decimals) {
    return mode === 'wrap' ? wrap(data, item, cart, inputType, selectedAmount, reserveAll, decimals) : unwrap(data, item, cart, inputType, selectedAmount, reserveAll, decimals)
}

export function wrap(data, item, cart, inputType, selectedAmount, reserveAll) {

    const { account } = data

    if(item.wrapType === 'ERC1155') {
        var data = cart.map((_, i) => abi.encode(['uint256[]', 'address[]', 'bool'], [[selectedAmount[i]], [account], reserveAll === true]))
        data = abi.encode(["bytes[]"], [data])
        return blockchainCall(cart[0].contract.methods.safeBatchTransferFrom, account, item.wrapper.options.address, cart.map(it => it.id), selectedAmount, data)
    }

    const createItems = cart.map(it => ({
        header : {
          host : VOID_ETHEREUM_ADDRESS,
          name : "",
          symbol : "",
          uri : ""
        },
        collectionId : abi.encode(["address"], [it.tokenAddress]),
        id : it.id,
        accounts : [],
        amounts : []
    }))

    const mintItems = Object.entries(item.wrapper.methods).filter(it => it[0].indexOf('mintItems') !== -1 && it[0].indexOf('bool[]') !== -1)[0]
    return blockchainCall(mintItems[1], createItems, cart.map(() => reserveAll === true))
}

function tryGetReserves(data, item, element, selectedAmount, decimals, buy) {

    if(!element.reserves || element.reserves.length === 0) {
        return []
    }

    const { account, block } = data

    var am = parseInt(fromDecimals(selectedAmount, decimals, true).split('.')[0])

    var res = element.reserves.filter(it => parseInt(block) >= parseInt(it.timeout))

    if(parseInt(element.available) >= parseInt(am) || buy) {
        return res.map(it => it.key)
    }

    am = res.reduce((acc, it) => acc - parseInt(it.amount), am)

    if(parseInt(element.available) >= parseInt(am)) {
        return res.map(it => it.key)
    }

    return element.reserves.filter(it => parseInt(it.timeout) >= parseInt(block) || web3Utils.toChecksumAddress(it.from) === web3Utils.toChecksumAddress(account)).map(it => it.key)
}

export function unwrap(data, item, cart, inputType, selectedAmount, reserveAll, decimals) {

    const { account } = data

    var reserves = item.wrapType === 'ERC1155' && cart.map((it, i) => tryGetReserves(data, item, it, selectedAmount[i], decimals))

    var data = item.wrapType === 'ERC721' ? cart.map(it => abi.encode(["address", "uint256", "address", "bytes", "bool", "bool"], [it.tokenAddress || it.address, it.id, account, "0x", true, true])) : cart.map((it, i) => abi.encode(["address", "uint256", "address", "bytes32[]", "bytes"], [it.tokenAddress || it.address, it.id, account, reserves[i], "0x"]))
    data = abi.encode(["bytes[]"], [data])

    return blockchainCall(item.wrapper.methods.burnBatch, account, cart.map(() => item.id), selectedAmount, data)
}

export function secondaryCartAction(data, mode, item, cart, itemValue, ETHValue, slippage, amm, swapData, inputType, selectedAmount, reserveAll) {
    return mode === 'wrap' ? wrapAndSell(data, item, cart, itemValue, ETHValue, slippage, amm, swapData, inputType, selectedAmount, reserveAll) : buyAndUnrwap(data, item, cart, itemValue, ETHValue, slippage, amm, swapData, inputType, selectedAmount, reserveAll)
}

export async function wrapAndSell(data, item, cart, itemValue, ETHValue, slippage, amm, swapData, inputType, selectedAmount, reserveAll) {

    const { getGlobalContract, account, context, newContract } = data
    const prestoDeck = getGlobalContract("deckPresto")

    const is721 = item.wrapType === 'ERC721'

    const tokenAddress = cart[0].mainInterfaceAddress

    const tokenIds = cart.map(it => it.tokenId)

    const reserve = cart.map(() => reserveAll === true)

    const itemInteroperableAddress = abi.decode(["address"], abi.encode(["uint256"], [item.id]))[0].toString()
    const operations = cart.map(() => ({
        inputTokenAddress : itemInteroperableAddress,
        inputTokenAmount : numberToString(1e18),
        ammPlugin : amm.address,
        liquidityPoolAddresses : swapData.liquidityPoolAddresses,
        swapPath : swapData.swapPath,
        enterInETH : false,
        exitInETH : true,
        receivers : [account],
        receiversPercentages : [],
        tokenMins : [0]
    }))
    operations[0].tokenMins[0] = numberToString(parseInt(ETHValue) * (1 - (parseFloat(slippage) / 100))).split('.')[0]

    if(is721) {
        return await blockchainCall(prestoDeck.methods.wrapAndSell721, tokenAddress, tokenIds, reserve, operations)
    }

    const prestoOperationTypes = [
        "address",
        "uint256",
        "address",
        "address[]",
        "address[]",
        "bool",
        "bool",
        "uint256[]",
        "address[]",
        "uint256[]"
    ]

    const operationsValues = operations.map((it, i) => ([
        it.inputTokenAddress,
        it.inputTokenAmount,
        it.ammPlugin,
        it.liquidityPoolAddresses,
        it.swapPath,
        it.enterInETH,
        it.exitInETH,
        it.tokenMins,
        it.receivers,
        it.receiversPercentages
    ]))

    const payload = abi.encode(["bool[]", `tuple(${prestoOperationTypes.join(',')})[]`, "bool"], [reserve, operationsValues, false])

    const values = selectedAmount

    const NFT = newContract(context.IERC1155ABI, tokenAddress)

    return await blockchainCall(NFT.methods.safeBatchTransferFrom, account, prestoDeck.options.address, tokenIds, values, payload)
}

export async function buyAndUnrwap(data, item, cart, itemValue, ETHValue, slippage, amm, swapData, inputType, selectedAmount, reserveAll, decimals) {
    const { getGlobalContract, account } = data
    const prestoDeck = getGlobalContract("deckPresto")

    var operation = {
        inputTokenAddress : swapData.inputTokenAddress,
        inputTokenAmount : ETHValue,
        ammPlugin : amm.address,
        liquidityPoolAddresses : swapData.liquidityPoolAddresses,
        swapPath : swapData.swapPath,
        enterInETH : true,
        exitInETH : false,
        tokenMins : [itemValue],
        receivers : [],
        receiversPercentages : []
    }
    const is721 = item.wrapType === 'ERC721'
    var payload = cart.map(it => abi.encode(["address", "uint256", "address", "bytes", "bool", "bool"], [it.tokenAddress || it.address, it.id, account, "0x", true, true]))
    if(!is721) {
        var reserves = item.wrapType === 'ERC1155' && cart.map((it, i) => tryGetReserves(data, item, it, selectedAmount[i], decimals, true))
        payload = cart.map((it, i) => abi.encode(["address", "uint256", "address", "bytes32[]", "bytes"], [it.tokenAddress || it.address, it.id, account, reserves[i], "0x"]))
    }

    return await blockchainCall(prestoDeck.methods.buyAndUnwrap, operation, is721, payload, { value : ETHValue })
}

async function decodeString(provider, to, name, id) {
    const args = [{ provider }, to, name]
    id && args.push(id)
    const request = getRawField.apply(this, args)
    const response = await request
    return response !== '0x' && abi.decode(["string"], response)[0]
}

export async function loadMetadata(data, address, id) {

    const { provider, context, newContract, chainId } = data

    var metadata

    var uri = await decodeString(provider, address, "uri(uint256)", id)
    uri = uri || await decodeString(provider, address, "tokenUri(uint256)", id)
    uri = uri || await decodeString(provider, address, "tokenURI(uint256)", id)
    uri = uri || await decodeString(provider, address, "uri")
    uri = uri || await decodeString(provider, address, "tokenUri")
    uri = uri || await decodeString(provider, address, "tokenURI")

    try {
        uri = formatLink({ context }, uri)
        uri.indexOf('//data:') === 0 && (uri = uri.substring(2))
        uri.indexOf('//0x') === 0 && (uri = uri.substring(2))
    } catch(e) {
    }

    var originalUri = uri

    uri && uri.indexOf('0x{id}') !== -1 && (uri = uri.split('0x{id}').join(web3Utils.toHex(id)))
    uri && uri.indexOf('{id}') !== -1 && (uri = uri.split('{id}').join(id))

    var metadata
    try {
        metadata = uri.indexOf('data:') === 0 ? await (await fetch(uri)).json() : await memoryFetch(uri)
    } catch(e) {
    }

    /*if(!metadata && originalUri && originalUri.indexOf('{id}') !== -1) {
        var wrapper = data.wrapper
        if(!wrapper) {
            try {
                const mainInterface = newContract(context.ItemMainInterfaceABI, address)
                wrapper = await blockchainCall(mainInterface.methods.item, id)
                wrapper = wrapper[0]
                wrapper = await blockchainCall(mainInterface.methods.collection, wrapper)
                wrapper = wrapper[0]
            } catch(e) {

            }
        } else {
            wrapper = wrapper.options.address
        }
        const args = {
            address : wrapper,
            topics : [
                web3Utils.sha3('Token(address,uint256,uint256)'),
                [],
                [],
                abi.encode(['uint256'], [id])
            ],
            fromBlock : web3Utils.toHex(getNetworkElement({ context, chainId }, 'deploySearchStart')) || "0x0",
            toBlock : 'latest'
        }
        var logs = await getLogs(provider, 'eth_getLogs', args)
        logs = logs[0]
        var tokenId = abi.decode(['uint256'], logs.topics[2])[0].toString()
        uri = originalUri.split('0x{id}').join(web3Utils.toHex(tokenId)).split('{id}').join(tokenId) + '?format=json'
        try {
            metadata = await memoryFetch(uri)
        } catch(e) {
            console.error(e)
        }
    }*/

    console.log(address, id, uri)

    var name = await decodeString(provider, address, "name(uint256)", id)
    name = name || await decodeString(provider, address, "name")

    var symbol = await decodeString(provider, address, "symbol(uint256)", id)
    symbol = symbol || await decodeString(provider, address, "symbol")

    return {
        ...metadata,
        address,
        id,
        tokenAddress : address,
        tokenId : id,
        name,
        symbol,
        uri,
        metadata
    }
}