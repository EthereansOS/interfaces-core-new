import { cache, getNetworkElement, VOID_ETHEREUM_ADDRESS, blockchainCall, abi, web3Utils, formatLink, memoryFetch } from '@ethereansos/interfaces-core'
import { loadTokenFromAddress } from './erc20'
import { OrderSide } from 'opensea-js/lib/types'
import { getLogs } from './logger'
import { getRawField } from './generalReader'

const sleepMillis = 350

var retrieveCache = {}
var semaphore

export function getAsset(seaport, tokenAddress, tokenId) {
    const key = web3Utils.sha3(`asset-${web3Utils.toChecksumAddress(tokenAddress)}-${tokenId}`)
    return retrieveCache[key] = retrieveCache[key] || (async () => {
        var asset = JSON.parse(await cache.getItem(key))

        if(asset) {
            return asset
        }

        while(semaphore) {
            await new Promise(ok => setTimeout(ok, sleepMillis))
        }

        semaphore = true

        while(true) {
            try {
                asset = await seaport.api.getAsset({tokenAddress, tokenId})
                asset.image = (asset.image || asset.imagePreviewUrl).split('s250').join('s300')
                if(asset.collection && asset.collection.imageUrl) {
                    asset.collection.imageUrl = asset.collection.imageUrl.split('s120').join('s300')
                }
                semaphore = false
                await cache.setItem(key, JSON.stringify(asset))
                return asset
            } catch(e) {
                await new Promise(ok => setTimeout(ok, sleepMillis))
            }
        }
    })()
}

export async function retrieveAsset({ context, dualChainId, seaport, newContract, account }, tokenAddress, tokenId) {
    return await toItem({context, newContract, account}, !dualChainId && seaport ? await getAsset(seaport, tokenAddress, tokenId) : (await cleanTokens({context, web3 : window.web3}, {
        [web3Utils.toChecksumAddress(tokenAddress)] : [{
            id : tokenId,
            owned : true
        }]
    }, 'ERC1155', ['uri(uint256)', 'uri', 'tokenURI(uint256)', 'tokenUri(uint256)']))[0])
}

export async function getOwnedTokens(web3Data, type, asset_contract_address) {
    const { context, seaport, account, owner, newContract, getGlobalContract } = web3Data
    const toExclude = [
        await blockchainCall(getGlobalContract("itemProjectionFactory").methods.mainInterface),
        getGlobalContract('eRC20Wrapper'),
        getGlobalContract('eRC721Wrapper'),
        getGlobalContract('eRC1155Wrapper'),
        getGlobalContract('eRC721WrapperDeck'),
        getGlobalContract('eRC1155WrapperDeck')
    ].map(it => web3Utils.toChecksumAddress(it.options ? it.options.address : it))
    var assets = await (asset_contract_address ? getOwnedTokensOnOpensea(web3Data, type, asset_contract_address, toExclude) : type === 'ERC721' ? getOwned721Tokens(web3Data, toExclude) : getOwned1155Tokens(web3Data, toExclude))
    return await Promise.all(assets.map(it => toItem({context, newContract, account}, it)))
}

async function getOwnedTokensOnOpensea(web3Data, type, asset_contract_address, toExclude) {

    var { seaport, account, owner } = web3Data

    var assets = []
    const length = 3
    const limit = 50
    for(var i = 0; i < length; i++) {
        try {
            assets.push(...(await seaport.api.getAssets({ asset_contract_address, owner : owner || account, offset : i * limit, limit })).assets)
        } catch(e) {
            var message = (e.message || e || "").toLowerCase()
            if(message.indexOf("fetch") !== -1) {
                i--
                await new Promise(ok => setTimeout(ok, 15000))
            }
        }
    }
    assets = assets.filter(it => it.assetContract.schemaName === type && toExclude.indexOf(web3Utils.toChecksumAddress(it.tokenAddress)) === -1)
    assets = assets.map(it => ({...it, name : it.name || it.assetContract.name, symbol : it.assetContract.tokenSymbol, image : it.imageUrl?.split('s120').join('s300')}))
    return assets
}

async function getOwned721Tokens(web3Data, toExclude) {
    const { web3, account, owner, context, chainId } = web3Data
    const address = web3Utils.toChecksumAddress(owner || account)
    var args = {
        topics : [
            web3Utils.sha3('Transfer(address,address,uint256)'),
            [],
            abi.encode(["address"], [address])
        ],
        fromBlock: web3Utils.toHex(getNetworkElement({ context, chainId }, 'deploySearchStart')) || "0x0",
        toBlock : 'latest'
    }
    var logs = await getLogs(web3.currentProvider, 'eth_getLogs', args)
    var tokens = {}
    await Promise.all(logs.map(async it => {
        var addr = web3Utils.toChecksumAddress(it.address)
        if(toExclude.indexOf(addr) !== -1 || tokens[addr] === null) {
            return
        }
        var id
        try {
            id = abi.decode(["uint256"], it.topics[3])[0].toString()
        } catch(e) {
            id = abi.decode(["uint256"], it.data)[0].toString()
            return tokens[addr] = null
        }
        if((tokens[addr] = tokens[addr] || []).filter(it => it.id === id).length !== 0) {
            return
        }
        var index = tokens[addr].length
        tokens[addr].push({
            id
        })
        try {
            tokens[addr][index].owned = address === web3Utils.toChecksumAddress(abi.decode(["address"], await getRawField({ provider : web3.currentProvider}, addr, 'ownerOf(uint256)', id))[0])
        } catch(e) {
            return tokens[addr] = null
        }
    }))
    return await cleanTokens(web3Data, tokens, 'ERC721', ['tokenURI(uint256)', 'tokenUri(uint256)', 'uri(uint256)'])
}

async function getOwned1155Tokens(web3Data, toExclude) {
    const { web3, account, owner, context, chainId } = web3Data
    const address = web3Utils.toChecksumAddress(owner || account)
    var args = {
        topics : [
            [
                web3Utils.sha3('TransferSingle(address,address,address,uint256,uint256)'),
                web3Utils.sha3('TransferBatch(address,address,address,uint256[],uint256[])')
            ],
            [],
            [],
            abi.encode(["address"], [address])
        ],
        fromBlock: web3Utils.toHex(getNetworkElement({ context, chainId }, 'deploySearchStart')) || "0x0",
        toBlock : 'latest'
    }
    var logs = await getLogs(web3.currentProvider, 'eth_getLogs', args)
    var tokens = {}
    await Promise.all(logs.map(async it => {
        var addr = web3Utils.toChecksumAddress(it.address)
        if(toExclude.indexOf(addr) !== -1 || tokens[addr] === null) {
            return
        }
        var ids = []
        try {
            ids = [abi.decode(["uint256","uint256"], it.data)[0]]
        } catch(e) {
            ids = abi.decode(["uint256[]","uint256[]"], it.data)[0]
        }
        ids = ids.map(it => it.toString()).filter((it, i, arr) => arr.indexOf(it) === i)
        for(var id of ids) {
            if((tokens[addr] = tokens[addr] || []).filter(it => it.id === id).length !== 0) {
                continue
            }
            var index = tokens[addr].length
            tokens[addr].push({
                id
            })
            tokens[addr][index].owned = '0' !== abi.decode(["uint256"], await getRawField({ provider : web3.currentProvider}, addr, 'balanceOf(address,uint256)', address, id))[0].toString()
        }
    }))
    return await cleanTokens(web3Data, tokens, 'ERC1155', ['uri(uint256)', 'uri', 'tokenURI(uint256)', 'tokenUri(uint256)'])
}

async function cleanTokens(web3Data, tokens, type, uriLabels) {

    const { web3, context, seaport } = web3Data

    uriLabels = uriLabels instanceof Array ? uriLabels : [uriLabels]

    var assets = Object.entries(tokens).filter(it => it[1]).map(entry => entry[1].filter(it => it.owned).map(it => ({
        tokenAddress : entry[0],
        tokenId : it.id,
        assetContract : {
            schemaName : type
        }
    }))).reduce((acc, it) => [...acc, ...it], [])
    assets = await Promise.all(assets.map(async item => {
        var uri
        var metadata
        for(var uriLabel of uriLabels) {
            try {
                uri = await getRawField({ provider : web3.currentProvider }, item.tokenAddress, uriLabel, item.tokenId)
                uri = abi.decode(["string"], uri)[0]
                uri = decodeURI(uri)
                uri = uri.split('0x{id}').join(web3Utils.numberToHex(item.tokenId))
                uri = uri.split('{id}').join(item.tokenId)
                if(uri.indexOf('data') === 0) {
                    metadata = await (await fetch(uri)).json()
                } else {
                    uri = formatLink({ context }, uri)
                    metadata = await memoryFetch(uri)
                }
                if(metadata.image) {
                    var image = metadata.image
                    image = decodeURI(image)
                    image = image.split('0x{id}').join(web3Utils.numberToHex(item.tokenId))
                    image = image.split('{id}').join(item.tokenId)
                    image = formatLink({ context }, image)
                    metadata.image = image
                }
                break
            } catch(e) {
            }
        }
        if(!metadata) {
            try {
                metadata = await getAsset(seaport, item.tokenAddress, item.tokenId);
            } catch(e) {
                console.error(e);
            }
            console.log(metadata);
        }
        return {
            ...item,
            uri,
            metadata,
            ...metadata
        }
    }))
    return assets
}

async function toItem({context, newContract, account}, element) {
    var result = {
        ...element,
        mainInterface : newContract(context[`I${element?.assetContract?.schemaName || 'ERC1155'}ABI`], element.tokenAddress),
        contract : newContract(context[`I${element?.assetContract?.schemaName || 'ERC1155'}ABI`], element.tokenAddress),
        id : element.tokenId,
        mainInterfaceAddress : element.tokenAddress,
        address : element.tokenAddress,
        decimals : '0'
    }
    var cont = newContract(context.ItemMainInterfaceABI, element.tokenAddress)
    try {
        result.decimals = await blockchainCall(cont.methods["decimals(uint256)"], result.id)
        try {
            result.address = abi.decode(["address"], abi.encode(["uint256"], [element.tokenId]))[0]
        } catch(e) {}
    } catch(e) {
        try {
            result.decimals = await blockchainCall(cont.methods["decimals()"])
        } catch(e) {}
        try {
            result.address = abi.decode(["address"], abi.encode(["uint256"], [element.tokenId]))[0]
        } catch(e) {}
    }
    try {
        if(result.assetContract.schemaName === 'ERC721') {
            result.balance = (await blockchainCall(result.contract.methods.ownerOf, result.id)) === account ? '1' : '0'
        } else {
            result.balance = await blockchainCall(result.contract.methods.balanceOf, account, result.id)
        }
    } catch(e) {}
    result.collection = result.collection || {
        imageUrl : result.image
    }
    return result
}

export function getPaymentTokens({ context, chainId, account, web3, newContract }, addressesOnly) {
    const tokens = [
        VOID_ETHEREUM_ADDRESS,
        getNetworkElement({ chainId, context}, 'wethTokenAddress'),
        getNetworkElement({ chainId, context}, 'usdcTokenAddress')
    ].filter(it => it !== undefined && it !== null && it).map(web3Utils.toChecksumAddress)
    return addressesOnly ? tokens : Promise.all(tokens.map(tokenAddress => loadTokenFromAddress({context, account, web3, newContract}, tokenAddress)))
}

export async function getItemOrders({chainId, context, seaport, account, web3, newContract, getGlobalContract}, item, buyOrSell) {
    var ordersInput = []
    var tries = 3
    while(tries-- > 0) {
        try {
            //var { orders } = await (await fetch(`https://63cdijedqk.execute-api.eu-central-1.amazonaws.com/opensea?chainId=${chainId}&buyOrSell=${buyOrSell}&asset_contract_address=${item.mainInterface.options.address}&token_id=${item.id}`)).json()
            var { orders } = await seaport.api.getOrders({
                asset_contract_address : item.mainInterface.options.address,
                token_id : item.id,
                side : buyOrSell ? OrderSide.Buy : OrderSide.Sell
            })
            ordersInput = orders
            break
        } catch(e) {
            const message = (e.message || e).toLowerCase()
            if(message.indexOf('for chain ethereum not found') !== -1) {
                return []
            }
            if(message.indexOf('429') !== -1) {
                tries++
            } else {
                console.log(e)
            }
            await new Promise(ok => setTimeout(ok, 3000))
        }
    }

    var orders = ordersInput
    var tokens = await getPaymentTokens({ context, chainId, account, web3, newContract })
    var tokenAddresses = tokens.map(it => it.address)
    orders = orders.filter(it => tokenAddresses.indexOf(web3Utils.toChecksumAddress(it.paymentToken)) !== -1).map(it => ({...it, key: it.hash}))
    orders = (await Promise.all(orders.map(async order => {
        var desired = parseInt(order[buyOrSell ? 'currentPrice' : 'quantity'].toString())
        var actual = parseInt(buyOrSell
            ? await blockchainCall(tokens[tokenAddresses.indexOf(web3Utils.toChecksumAddress(order.paymentToken))].contract.methods.balanceOf, order.maker)
            : await blockchainCall(item.mainInterface.methods.balanceOf, order.maker, item.id))
        return actual >= desired ? order : null
    }))).filter(it => it !== undefined && it !== null)
    return orders
}