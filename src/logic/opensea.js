import { getNetworkElement, VOID_ETHEREUM_ADDRESS, blockchainCall, abi, web3Utils } from '@ethereansos/interfaces-core'
import { loadTokenFromAddress } from './erc20'
import { OrderSide } from 'opensea-js/lib/types'

export function loadAsset(tokenAddressOrKey, tokenId) {
    const key = tokenId ? `${web3Utils.toChecksumAddress(tokenAddressOrKey)}-${tokenId}` : tokenAddressOrKey

    try {
        var asset = window.localStorage.getItem(key)
        if(asset) {
            asset = JSON.parse(asset)
        }
        if(asset) {
            return asset
        }
    } catch(e) {}
}

export async function getAsset(seaport, tokenAddress, tokenId) {
    const key = `${web3Utils.toChecksumAddress(tokenAddress)}-${tokenId}`

    var asset = loadAsset(key)

    if(asset) {
        return asset
    }

    var times = 12
    while(times-- > 0) {
        try {
            asset = await seaport.api.getAsset({tokenAddress, tokenId})
        } catch(e) {
            await new Promise(ok => setTimeout(ok, 6000))
        }
    }

    try {
        window.localStorage.setItem(key, JSON.stringify(asset))
    } catch(e) {
    }

    return asset
}

export async function retrieveAsset({ context, seaport, newContract, account }, tokenAddress, tokenId) {
    return await toItem({context, newContract, account}, await getAsset(seaport, tokenAddress, tokenId))
}

export async function getOwnedTokens({ context, seaport, account, owner, newContract, getGlobalContract }, type, asset_contract_address) {
    const toExclude = [
        await blockchainCall(getGlobalContract("itemProjectionFactory").methods.mainInterface),
        getGlobalContract('eRC20Wrapper'),
        getGlobalContract('eRC721Wrapper'),
        getGlobalContract('eRC1155Wrapper'),
        getGlobalContract('eRC721WrapperDeck'),
        getGlobalContract('eRC1155WrapperDeck')
    ].map(it => it.options ? it.options.address : it)
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
    return await Promise.all(assets.map(it => toItem({context, newContract, account}, it)))
}

async function toItem({context, newContract, account}, element) {
    var result = {
        ...element,
        mainInterface : newContract(context[`I${element.assetContract.schemaName}ABI`], element.tokenAddress),
        contract : newContract(context[`I${element.assetContract.schemaName}ABI`], element.tokenAddress),
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