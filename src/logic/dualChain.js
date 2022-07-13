import { VOID_ETHEREUM_ADDRESS, abi, web3Utils } from "@ethereansos/interfaces-core"
import { getRawField } from "./generalReader"

import { toChecksumAddress } from "./uiUtilities"

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
                    return it.address ? {
                        ...it,
                        address : dualTokenAddress
                    } : dualTokenAddress
                }
                var result = await getRawField({ provider : web3.currentProvider }, addr, "l1Token")
                result = abi.decode(["address"], result)[0]
                return it.address ? {
                    ...it,
                    address : result
                } : result
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