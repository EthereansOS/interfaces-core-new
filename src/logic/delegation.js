import { abi, VOID_ETHEREUM_ADDRESS, uploadMetadata, getNetworkElement, blockchainCall, web3Utils, sendAsync, tryRetrieveMetadata } from "@ethereansos/interfaces-core"

export async function createDelegation({context, ipfsHttpClient, newContract, chainId, factoryOfFactories}, metadata) {
    var uri = await uploadMetadata({context, ipfsHttpClient}, metadata)

    var mandatoryComponentsDeployData = [
        "0x",
        "0x",
        abi.encode(["string"], [metadata.symbol])
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
        VOID_ETHEREUM_ADDRESS
    ]

    var deployOrganizationData = abi.encode([`tuple(${deployOrganizationDataType.join(',')})`], [deployOrganizationDataValue])

    var factoryData = await blockchainCall(factoryOfFactories.methods.get, getNetworkElement({context, chainId}, "factoryIndices").delegation)

    var factoryAddress = factoryData.factoryList[factoryData.factoryList.length - 1]
    var factory = newContract(context.IFactoryABI, factoryAddress)

    var transaction = await blockchainCall(factory.methods.deploy, deployOrganizationData)
    var transactionReceipt = await sendAsync(factory.currentProvider, "eth_getTransactionReceipt", transaction.transactionHash)
    var logs = transactionReceipt.logs
    logs = logs.filter(it => it.topics[0] === web3Utils.sha3("Deployed(address,address,address,bytes)"))[0]
    var address = logs.topics[2]
    address = abi.decode(["address"], address)
    return address
}

export async function finalizeDelegation({context, chainId, newContract, factoryOfFactories},
        delegationAddress,
        host,
        quorum,
        validationBomb,
        blockLength,
        hardCap
    ) {

    var factoryData = await blockchainCall(factoryOfFactories.methods.get, getNetworkElement({context, chainId}, "factoryIndices").delegation)
    var factoryAddress = factoryData.factoryList[factoryData.factoryList.length - 1]
    var factory = newContract(context.DelegationFactoryABI, factoryAddress)

    await blockchainCall(factory.methods.initializeProposalModels,
        delegationAddress,
        host,
        quorum,
        validationBomb,
        blockLength,
        hardCap
    )
}

export async function all({context, newContract, chainId, factoryOfFactories}, metadata, organization) {
    var factoryData = await blockchainCall(factoryOfFactories.methods.get, getNetworkElement({context, chainId}, "factoryIndices").delegation)

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

    delegations = await Promise.all(delegations.map(contract => (tryRetrieveMetadata({context}, {contract, address : contract.options.address, type: 'delegations'}))))

    return delegations
}