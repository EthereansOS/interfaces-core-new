import { VOID_ETHEREUM_ADDRESS, abi, web3Utils, getNetworkElement } from "@ethereansos/interfaces-core"
import { getRawField } from "./generalReader"

import { toChecksumAddress } from "./uiUtilities"

function setAddress(item, address) {
    if(!item || !address) {
        return item
    }
    if(item.address) {
        item.address = web3Utils.toChecksumAddress(address)
    }
    if(item.tokenAddress) {
        item.tokenAddress = web3Utils.toChecksumAddress(address)
    }
    if((typeof item).toLowerCase() === 'string') {
        item = web3Utils.toChecksumAddress(address)
    }
    return item
}

const chains = {
    10 : {
        async resolveToken(web3Data, it) {
            const { web3, context, chainId, dualChainId } = web3Data
            if((it.address || it) === VOID_ETHEREUM_ADDRESS) {
                return it
            }
            try {
                var addr = web3Utils.toChecksumAddress(it.address || it)
                var dualTokenAddress = context.dualChainTokens[addr] || context.dualChainTokens[chainId][addr]
                dualTokenAddress = dualTokenAddress && ((typeof dualTokenAddress).toLowerCase() === 'string' ? dualTokenAddress : dualTokenAddress[dualChainId])
                if(dualTokenAddress) {
                    return setAddress(it, dualTokenAddress)
                }
                dualTokenAddress = await getRawField({ provider : web3.currentProvider }, addr, "l1Token")
                dualTokenAddress = abi.decode(["address"], dualTokenAddress)[0]
                return setAddress(it, dualTokenAddress)
            } catch(e) {
                return it
            }
        }
    }
}

function getResolver(web3Data, resolverName) {
    const { chainId, dualChainId } = web3Data
    if(!dualChainId) {
        return
    }
    var resolver = chains[chainId]
    if(!resolver) {
        return
    }
    if(resolver[dualChainId] && resolver[dualChainId][resolverName]) {
        resolver = resolver[dualChainId]
    }
    return resolver[resolverName]
}

export async function resolveToken(web3Data, tokenAddress) {
    var resolver = getResolver(web3Data, 'resolveToken')
    if(!resolver) {
        return toChecksumAddress(tokenAddress)
    }
    return toChecksumAddress(await resolver(web3Data, tokenAddress))
}

export async function dualChainAsMainChain(data) {
    var { context, dualChainId, dualChainWeb3, web3, chainId } = data

    var contracts = {}

    var newContract = function newContract(ABI, address) {
        var key = web3Utils.sha3(JSON.stringify(ABI) + (address || ''))
        if(contracts[key]) {
            return contracts[key]
        }
        var contract
        if(!address) {
            contract = new dualChainWeb3.eth.Contract(ABI)
        } else {
            contract = new dualChainWeb3.eth.Contract(ABI, address)
        }
        return contracts[key] = contract
    }

    var getGlobalContract = function getGlobalContract(contractName) {
        return newContract(
            context[contractName[0].toUpperCase() + contractName.substring(1) + 'ABI'],
            getNetworkElement({ context, chainId: dualChainId },contractName + 'Address')
          )
    }

    return {
        ...data,
        dualMode : undefined,
        chainId : dualChainId,
        web3 : dualChainWeb3,
        originalChainId : chainId,
        originalWeb3 : web3,
        dualChainId : undefined,
        dualChainWeb3 : undefined,
        getGlobalContract,
        newContract
    }
}