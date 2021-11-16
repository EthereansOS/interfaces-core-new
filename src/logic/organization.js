import { abi, VOID_ETHEREUM_ADDRESS, uploadMetadata, getNetworkElement, blockchainCall, web3Utils, sendAsync, tryRetrieveMetadata } from "@ethereansos/interfaces-core"

import { encodeHeader } from "./itemsV2";

export async function create({context, ipfsHttpClient, newContract, chainId, factoryOfFactories}, metadata, organization) {
    var uri = await uploadMetadata({context, ipfsHttpClient}, metadata)
    var header = {
        host :VOID_ETHEREUM_ADDRESS,
        name : metadata.name,
        symbol : metadata.symbol,
        uri
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

    var factoryData = await blockchainCall(factoryOfFactories.methods.get, getNetworkElement({context, chainId}, "organizationFactoryPosition"))

    var factoryAddress = factoryData.factoryList[factoryData.factoryList.length - 1]
    var factory = newContract(context.IFactoryABI, factoryAddress)

    await blockchainCall(factory.methods.deploy, deployOrganizationData)
}

export async function all({context, newContract, chainId, factoryOfFactories}, metadata, organization) {
    var factoryData = await blockchainCall(factoryOfFactories.methods.get, getNetworkElement({context, chainId}, "organizationFactoryPosition"))

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

    delegations = await Promise.all(delegations.map(contract => (tryRetrieveMetadata({context}, {contract, address : contract.options.address, type: 'organizations'}))))

    return delegations
}