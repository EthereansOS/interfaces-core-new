import { blockchainCall, web3Utils, sendAsync, getNetworkElement, numberToString, VOID_ETHEREUM_ADDRESS, formatLink } from "@ethereansos/interfaces-core"

export function allFactories({}, factoryOfFactories) {
    return blockchainCall(factoryOfFactories.methods.all)
}