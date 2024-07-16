import { sendAsync, blockchainCall, web3Utils, abi, getNetworkElement, numberToString, VOID_ETHEREUM_ADDRESS, formatLink, cache } from "interfaces-core"
import { dualChainAsMainChain, resolveToken } from "./dualChain"
import { getRawField } from "./generalReader"
import { cleanUri, loadItem, loadItemDynamicInfo } from "./itemsV2"

export function sortByPriority(initialData, list) {
    const { context } = initialData
    const prioritySymbols = context.sortOrderTokenList?.symbols ?? []
    if(prioritySymbols.length === 0) {
        return list
    }
    var l = list.filter(it => prioritySymbols.indexOf(it.symbol) !== -1)
    l = l.sort((a, b) => prioritySymbols.indexOf(a.symbol) - prioritySymbols.indexOf(b.symbol))
    l.push(...list.filter(it => prioritySymbols.indexOf(it.symbol) === -1))
    return l
}

export async function getTokenBasicInfo(web3Data, tokenAddress) {

    if(tokenAddress === VOID_ETHEREUM_ADDRESS) {
        return {
            name : 'Ethereum',
            symbol : 'ETH',
            decimals : '18'
        }
    }

    const { web3 } = web3Data
    const provider = web3.currentProvider

    var name = await getRawField({ provider }, tokenAddress, 'name')
    name = name !== '0x' ? name : await getRawField({ provider }, tokenAddress, 'NAME')
    try {
        name = abi.decode(["string"], name)[0].toString()
    } catch(ex) {
        name = web3.utils.hexToString(name)
    }

    var symbol = await getRawField({ provider }, tokenAddress, 'symbol')
    symbol = symbol !== '0x' ? symbol : await getRawField({ provider }, tokenAddress, 'SYMBOL')
    try {
        symbol = abi.decode(["string"], symbol)[0].toString()
    } catch(ex) {
        symbol = web3.utils.hexToString(symbol)
    }

    var decimals = await getRawField({ provider }, tokenAddress, 'decimals')
    decimals = decimals !== '0x' ? decimals : await getRawField({ provider }, tokenAddress, 'DECIMALS')
    decimals = abi.decode(["uint256"], decimals)[0].toString()

    return {
        name, symbol, decimals
    }
}

export async function getEthereum(data) {
    const {account, web3} = data
    return {
        name: "Ethereum",
        symbol: "ETH",
        address: VOID_ETHEREUM_ADDRESS,
        decimals: "18",
        image: `${process.env.PUBLIC_URL}/img/eth_logo.png`,
        contract: {
            options : {
                address : VOID_ETHEREUM_ADDRESS
            },
            methods: {
                balanceOf(subject) {
                    return {
                        call(_, blockNumber) {
                            return sendAsync(web3, 'eth_getBalance', subject, blockNumber || 'latest')
                        },
                        _parent : {
                            options : {
                                address : VOID_ETHEREUM_ADDRESS
                            },
                            currentProvider : web3.currentProvider
                        },
                        _method : {
                            stateMutability : 'view',
                            outputs : [{
                                type : 'uint256'
                            }]
                        },
                        encodeABI() {
                            return web3Utils.sha3('balanceOf(address)').substring(0, 10) + (web3.eth.abi.encodeParameter('address', subject).substring(2))
                        }
                    }
                },
                allowance(owner, spender) {
                    return {
                        async call() {
                            return numberToString(parseInt('0xfffffffffffffffffffffffffffffffffffffffffffffff'))
                        },
                        _parent : {
                            options : {
                                address : VOID_ETHEREUM_ADDRESS
                            },
                            currentProvider : web3.currentProvider
                        },
                        _method : {
                            stateMutability : 'view',
                            outputs : [{
                                type : 'uint256'
                            }]
                        },
                        encodeABI() {
                            return web3Utils.sha3('allowance(address,address)').substring(0, 10) + (web3.eth.abi.encodeParameters(['address', 'address'], [owner, spender || VOID_ETHEREUM_ADDRESS]).substring(2))
                        }
                    }
                }
            }
        }
    }
}

export async function loadTokens({ context, chainId, web3, account, newContract, alsoETH, listName }) {

    try {
        var all = []

        try {
            all = JSON.parse(window.localStorage.getItem("erc20Tokens_" + chainId))
        } catch(e) {
        }

        if(!all || all.length === 0) {
            all = (await (await fetch(getNetworkElement({ context, chainId }, listName || "erc20TokensListURL"))).json()).tokens
            window.localStorage.setItem("erc20Tokens_" + chainId, JSON.stringify(all))
        }

        var tokens = all.filter(it => it.chainId === chainId)

        alsoETH && tokens.unshift(await getEthereum({account, web3}))

        /*var chunkSize = 750
        await peach(all, it => it.chainId === chainId && tokens.push({
            ...it,
            decimals : it.decimals + "",
            image : formatLink({ context }, it.logoURI),
            contract : newContract(context.ItemInteroperableInterfaceABI, it.address)
        }), chunkSize)*/

        //tokens = await Promise.all(tokens.map(async token => ({...token, balance : await blockchainCall(token.contract.methods.balanceOf, account)})))

        tokens = sortByPriority({context}, tokens)

        return tokens
    } catch(e) {
        const message = (e.message || e).toLowerCase()
        if(message.indexOf('header not found') !== -1) {
            await new Promise(ok => setTimeout(ok, 3000))
            return await loadTokens({ context, chainId, web3, account, newContract, alsoETH, listName })
        }
        throw e
    }
}

export async function loadTokenFromAddress(data, tokenAddress) {
    const { context, account, newContract, forceItem } = data
    if(!tokenAddress || tokenAddress === VOID_ETHEREUM_ADDRESS) {
        return await getEthereum(data)
    }
    try {
        var tkAddr = await resolveToken(data, tokenAddress = web3Utils.toChecksumAddress(tokenAddress))
        var item = await loadItem({...(tkAddr !== tokenAddress ? await dualChainAsMainChain(data) : data), lightweight : tkAddr !== tokenAddress }, tkAddr)
        item = tkAddr === tokenAddress ? item : await loadItemDynamicInfo(data, {...item, l2Address : tokenAddress})
        return item
    } catch(e) {
        if(forceItem) {
            return
        }
    }
    try {
        var tkAddr = await resolveToken(data, tokenAddress = web3Utils.toChecksumAddress(tokenAddress))
        var dataInput = tkAddr !== tokenAddress ? await dualChainAsMainChain(data) : data
        var contract = newContract(context.ItemInteroperableInterfaceABI, tokenAddress)
        var token = {
            ...(await getTokenBasicInfo(data, tokenAddress)),
            address : tokenAddress,
            contract,
            balance : await blockchainCall(contract.methods.balanceOf, account),
            image : await getTokenImage(dataInput, tkAddr)
        }
        if(tkAddr !== tokenAddress) {
            token = {
                ...token,
                l1Address : tkAddr,
                l1Contract : dataInput.newContract(context.ItemInteroperableInterfaceABI, tkAddr),
                l2Address : tokenAddress,
                l2Contract : contract
            }
        }
        return token
    } catch(e) {
    }
}

export async function getTokenImage(data, tokenAddress) {
    if(tokenAddress === VOID_ETHEREUM_ADDRESS) {
        return `${process.env.PUBLIC_URL}/img/eth_logo.png`
    }

    var tkAddr = await resolveToken(data, tokenAddress = web3Utils.toChecksumAddress(tokenAddress))
    var dataInput = tkAddr !== tokenAddress ? await dualChainAsMainChain(data) : data

    var tokens = await loadTokens(dataInput)

    var filter = tokens.filter(it => tkAddr === web3Utils.toChecksumAddress(it.address))[0]

    var image = await cleanUri(data, filter?.logoURI || filter?.image || data.context.trustwalletImgURLTemplate.split('{0}').join(tkAddr))

    var loaded = await cache.getItem(image)

    return loaded !== 'null' ? loaded : image
}