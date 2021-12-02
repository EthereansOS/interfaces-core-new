import { abi, VOID_ETHEREUM_ADDRESS, uploadMetadata, getNetworkElement, blockchainCall, web3Utils, sendAsync, tryRetrieveMetadata, toDecimals } from "@ethereansos/interfaces-core"

import { getOrganizationComponents, retrieveAllProposals, getOrganization, getProposalModels } from "./organization"

import { getData } from "./generalReader"

export async function createDelegation({context, ipfsHttpClient, newContract, chainId, factoryOfFactories}, metadata) {
    var uri = await uploadMetadata({context, ipfsHttpClient}, metadata)

    var mandatoryComponentsDeployData = [
        "0x",
        "0x",
        abi.encode(["string"], [metadata.symbol])
    ]

    var deployOrganizationDataType = [
        "string",
        "bytes[]",
        "uint256[]",
        "bytes[]",
        "bytes[]",
        "bytes"
    ]

    var deployOrganizationDataValue = [
        uri,
        mandatoryComponentsDeployData,
        [],
        [],
        [],
        "0x"
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
    address = abi.decode(["address"], address)[0]
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

    var quorumPercentage = toDecimals(quorum, 16)
    var hardCapPercentage = toDecimals(hardCap, 16)

    await blockchainCall(factory.methods.initializeProposalModels,
        delegationAddress instanceof Array ? delegationAddress[0] : delegationAddress,
        host,
        quorumPercentage,
        validationBomb,
        blockLength,
        hardCapPercentage
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

    console.log({delegations})

    delegations = await Promise.all(delegations.map(contract => (tryRetrieveMetadata({context}, {contract, address : contract.options.address, type: 'delegations'}))))

    return delegations
}

export async function getDelegation({context, web3, account, getGlobalContract, newContract}, delegationAddress) {

    var delegation = await getOrganization({context, web3, account, getGlobalContract, newContract}, delegationAddress)
    delegation.type = 'delegation'
    delegation.proposalModels = instrumentProposalModels(delegation.proposalModels)

    var data = await getData({provider: delegation.contract.currentProvider}, delegation.proposalModels[0].creationRules)

    delegation.host = data.valueAddress

    return delegation
}

function instrumentProposalModels(proposalModels) {
    proposalModels[0].name = "Attach To Proposal";
    proposalModels[1].name = "Change URI";
    proposalModels[2].name = "Change Rules";
    proposalModels[3].name = "Transfer Funds";
    proposalModels[4].name = "Vote For a Proposal";
    return proposalModels
}

export async function setDelegationMetadata({ context, newContract, chainId, ipfsHttpClient }, element, metadata) {
    var uri = await uploadMetadata({context, ipfsHttpClient}, metadata)

}

export async function retrieveDelegationProposals({context, newContract}, organization) {
    console.log("sasda")
    return []
}