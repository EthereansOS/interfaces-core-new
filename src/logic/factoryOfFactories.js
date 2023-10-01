import { blockchainCall, web3Utils, sendAsync, getNetworkElement, numberToString, VOID_ETHEREUM_ADDRESS, formatLink } from "interfaces-core"

export function allFactories({}, factoryOfFactories) {
    return blockchainCall(factoryOfFactories.methods.all)
}