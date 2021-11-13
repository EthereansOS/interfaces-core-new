import { blockchainCall, web3Utils, sendAsync, getNetworkElement, numberToString, VOID_ETHEREUM_ADDRESS, formatLink } from "@ethereansos/interfaces-core"
import peach from 'parallel-each'

export async function loadTokens({ context, chainId, web3, account, newContract, alsoETH }) {
    var all = (await (await fetch(getNetworkElement({ context, chainId }, "erc20TokensListURL"))).json()).tokens

    var tokens = []

    alsoETH && tokens.push({
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
    })

    var chunkSize = 750
    await peach(all, async it => {
        if(it.chainId !== chainId) {
            return
        }
        var contract = newContract(context.ItemInteroperableInterfaceABI, it.address)
        tokens.push({
            name : it.name,
            symbol : it.symbol,
            decimals : it.decimals + "",
            address : it.address,
            image : formatLink({ context }, it.logoURI),
            contract,
            balance : '0'
        })
    }, chunkSize)
    /*var length = all.length
    var start = 0
    while(start < length) {
        var end = start + trancheSize
        end = end > length ? length : end
        var tranche = all.slice(start, end).filter(it => it.chainId === chainId)
        start = end
        var address = tranche.map(it => it.address)
        var balances = {}
        var logs = await sendAsync(web3.currentProvider, 'eth_getLogs', {
            address,
            topics : [
                web3Utils.sha3('Transfer(address,address,uint256)'),
                [],
                web3.eth.abi.encodeParameter("address", account)
            ],
            fromBlock : '0x0',
            toBlock : 'latest'
        })
        logs.forEach(it => balances[it.address] = true)
        tokens.push(...(await Promise.all(tranche.map(async it => {
            var contract = newContract(context.ItemInteroperableInterfaceABI, it.address)
            return {
                name : it.name,
                symbol : it.symbol,
                decimals : it.decimals + "",
                address : it.address,
                image : formatLink({ context }, it.logoURI),
                contract,
                balance : balances[it.address] ? await blockchainCall(contract.methods.balanceOf, account) : '0'
            }
        }))))
    }*/

    return await Promise.all(tokens.map(async token => ({...token, balance : await token.contract.methods.balanceOf(account)})))
}