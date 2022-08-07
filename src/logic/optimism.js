import { web3Utils, abi, getNetworkElement, blockchainCall } from "@ethereansos/interfaces-core"
import { getRawField } from "./generalReader"

import { getLogs } from "./logger"

export async function tryRetrieveL1Address(data, tokenAddress) {

    const { web3 } = data

    try {
        var l1TokenAddress = await getRawField({ provider : web3.currentProvider }, tokenAddress, 'l1Token')
        l1TokenAddress = web3Utils.toChecksumAddress(abi.decode(["address"], l1TokenAddress)[0].toString())
        return l1TokenAddress
    } catch(e) {}


}

export async function tryRetrieveL2Address(data, tokenAddress) {
    const { web3, dualChainWeb3, dualChainId, chainId, context } = data

    var logs = await getLogs((dualChainWeb3 || web3).currentProvider, 'eth_getLogs', {
        address : getNetworkElement({ context, chainId : dualChainId || chainId }, 'L1StandardBridgeAddress'),
        topics : [
            web3Utils.sha3('ERC20DepositInitiated(address,address,address,address,uint256,bytes)'),
            abi.encode(["address"], [tokenAddress])
        ],
        fromBlock: web3Utils.toHex(getNetworkElement({ context, chainId : dualChainId || chainId }, 'deploySearchStart')) || "0x0",
        toBlock : 'latest'
    })

    if(logs.length > 0) {
        return web3Utils.toChecksumAddress(abi.decode(["address"], logs[0].topics[2])[0].toString())
    }

    if(dualChainWeb3) {
        var logs = await getLogs(web3.currentProvider, 'eth_getLogs', {
            address : getNetworkElement(data, 'L2StandardTokenFactoryAddress'),
            topics : [
                web3Utils.sha3('StandardL2TokenCreated(address,address)'),
                abi.encode(["address"], [tokenAddress])
            ],
            fromBlock: web3Utils.toHex(getNetworkElement({ context, chainId }, 'deploySearchStart')) || "0x0",
            toBlock : 'latest'
        })

        if(logs.length > 0) {
            return web3Utils.toChecksumAddress(abi.decode(["address"], logs[0].topics[2])[0].toString())
        }
    }
}

export async function createL2Token(data, element) {
    const { getGlobalContract } = data

    const tokenFactory = getGlobalContract('L2StandardTokenFactory')

    await blockchainCall(tokenFactory.methods.createStandardL2Token, element.address, element.name, element.symbol)
}