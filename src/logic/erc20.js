import { blockchainCall, web3Utils, sendAsync, getNetworkElement, numberToString, VOID_ETHEREUM_ADDRESS, formatLink } from "@ethereansos/interfaces-core"
import { loadItem } from "./itemsV2"

export async function getEthereum({account, web3}) {
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
                            return web3.eth.getBalance(subject, blockNumber || null)
                        },
                        _parent : {
                            options : {
                                address : VOID_ETHEREUM_ADDRESS
                            },
                            currentProvider : web3.currentProvider
                        },
                        _method : {
                            stateMutability : 'view'
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
                            stateMutability : 'view'
                        },
                        encodeABI() {
                            return web3Utils.sha3('allowance(address,address)').substring(0, 10) + (web3.eth.abi.encodeParameters(['address', 'address'], [owner, spender || VOID_ETHEREUM_ADDRESS]).substring(2))
                        }
                    }
                }
            }
        },
        balance : await web3.eth.getBalance(account)
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

export async function loadTokenFromAddress({ context, chainId, account, web3, newContract, getGlobalContract, forceItem }, tokenAddress) {
    if(!tokenAddress || tokenAddress === VOID_ETHEREUM_ADDRESS) {
        return await getEthereum({account, web3})
    }
    try {
        return await loadItem({ context, chainId, account, web3, newContract, getGlobalContract }, tokenAddress)
    } catch(e) {
        if(forceItem) {
            return
        }
    }
    try {
        var contract = newContract(context.ItemInteroperableInterfaceABI, tokenAddress)
        return {
            name : await blockchainCall(contract.methods.name),
            symbol : await blockchainCall(contract.methods.symbol),
            decimals : await blockchainCall(contract.methods.decimals),
            address : tokenAddress,
            contract,
            balance : await blockchainCall(contract.methods.balanceOf, account)
        }
    } catch(e) {
    }
}