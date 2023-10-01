import { abi, VOID_ETHEREUM_ADDRESS, uploadMetadata, formatLink, fromDecimals, getNetworkElement, blockchainCall, web3Utils, sendAsync, tryRetrieveMetadata, VOID_BYTES32, numberToString } from "interfaces-core"

const prestoOperationTypes = [
    'address',
    'uint256',
    'address',
    'address[]',
    'address[]',
    'bool',
    'bool',
    'uint256[]',
    'address[]',
    'uint256[]'
]

const prestoTypeLabel = `tuple(${prestoOperationTypes.join(',')})`

export function encodePrestoOperations(prestoOperations, single) {
    if(!prestoOperations) {
        prestoOperations = []
    }
    prestoOperations = prestoOperations instanceof Array ? prestoOperations : single ? prestoOperations : [prestoOperations]
    for(var i in prestoOperations) {
        var prestoOperation = prestoOperations[i]
        if(!prestoOperation.inputTokenAddress) {
            prestoOperations[i] = Object.values(prestoOperation)
        }
    }
    return abi.encode([prestoTypeLabel + (single ? '' : '[]')], [prestoOperations])
}

export function decodePrestoOperations(data, single) {

    var prestoOperations = abi.decode([prestoTypeLabel + (single ? '' : '[]')], data)[0]
    prestoOperations = single ? [prestoOperations] : [...prestoOperations]
    for(var i in prestoOperations) {
        var operation = prestoOperations[i]
        prestoOperations[i] = {
            inputTokenAddress : operation[0].toString(),
            inputTokenAmount : operation[1].toString(),
            ammPlugin : operation[2].toString(),
            liquidityPoolAddresses : operation[3].map(it => it.toString()),
            swapPath : operation[4].map(it => it.toString()),
            enterInETH : operation[5].toString() === 'true',
            exitInETH : operation[6].toString() === 'true',
            tokenMins : operation[7].map(it => it.toString()),
            receivers : operation[8].map(it => it.toString()),
            receiversPercentages : operation[9].map(it => it.toString())
        }
    }

    prestoOperations = single ? prestoOperations[0] : prestoOperations

    return prestoOperations
}