import { abi, VOID_ETHEREUM_ADDRESS, getNetworkElement, blockchainCall, web3Utils, sendAsync } from "@ethereansos/interfaces-core"

import { encodeHeader } from "./itemsV2";

export async function create({context, newContract, chainId, factoryOfFactories}, metadata, organization) {
    var uri = "";
    var header = {
        host :VOID_ETHEREUM_ADDRESS,
        name : metadata.name,
        symbol : metadata.symbol,
        uri : uri || "myUri"
    }
    var headerBytecode = encodeHeader(header)
    var mandatoryComponentsDeployData = [
        "0x",
        "0x",
        headerBytecode
    ]

    var deployOrganizationDataType = [
        "string",
        "bytes",
        "bytes[]",
        "uint256[]",
        "bytes[]",
        "bytes"
    ]

    var deployOrganizationDataValue = [
        uri,
        "0x",
        mandatoryComponentsDeployData,
        [],
        [],
        organization ? abi.encode(["address"], [organization]) : "0x"
    ]

    var deployOrganizationData = abi.encode([`tuple(${deployOrganizationDataType.join(',')})`], [deployOrganizationDataValue])

    var factoryData = await blockchainCall(factoryOfFactories.methods.get, getNetworkElement({context, chainId}, "delegationFactoryPosition"))

    var factoryAddress = factoryData.factoryList[factoryData.factoryList.length - 1]
    var factory = newContract(context.IFactoryABI, factoryAddress)

    await blockchainCall(factory.methods.deploy, deployOrganizationData)
}

export async function allDelegations({context, newContract, chainId, factoryOfFactories}, metadata, organization) {
    var factoryData = await blockchainCall(factoryOfFactories.methods.get, getNetworkElement({context, chainId}, "delegationFactoryPosition"))

    var args = {
        address : factoryData.factoryList,
        topics : [
            web3Utils.sha3('Deployed(address,address,address,bytes)')
        ],
        fromBlock : '0x0',
        toBlock : 'latest'
    }

    var logs = await sendAsync(factoryOfFactories.currentProvider, "eth_getLogs", args)

    var delegations = logs.map(it => newContract(context.IFactoryABI, abi.decode(["address"], it.topics[2])[0]))

    return delegations
}