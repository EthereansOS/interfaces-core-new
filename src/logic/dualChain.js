import { VOID_ETHEREUM_ADDRESS, abi, web3Utils } from "@ethereansos/interfaces-core"
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