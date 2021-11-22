import { abi, VOID_ETHEREUM_ADDRESS, uploadMetadata, formatLink, getNetworkElement, blockchainCall, web3Utils, sendAsync, tryRetrieveMetadata } from "@ethereansos/interfaces-core"

import { encodeHeader } from "./itemsV2";

import { decodeProposal, decodeProposalVotingToken } from "./ballot";

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

    var factoryData = await blockchainCall(factoryOfFactories.methods.get, getNetworkElement({context, chainId}, "organizationsFactoryPosition"))

    var factoryAddress = factoryData.factoryList[factoryData.factoryList.length - 1]
    var factory = newContract(context.IFactoryABI, factoryAddress)

    await blockchainCall(factory.methods.deploy, deployOrganizationData)
}

export async function all({context, newContract, chainId, factoryOfFactories}, metadata, organization) {
    var factoryData = await blockchainCall(factoryOfFactories.methods.get, getNetworkElement({context, chainId}, "factoryIndices").subdao)

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

export async function tryExtractHost({context, web3, account, getGlobalContract, newContract}, contract) {
    var hostAddress = await blockchainCall(contract.methods.host)
    var host;
    if(hostAddress && hostAddress !== VOID_ETHEREUM_ADDRESS) {
        try {
            var subDAOsManager = newContract(context.SubDAOsManagerABI, hostAddress)
            hostAddress = await blockchainCall(subDAOsManager.methods.host)
            host = await getOrganization({context, web3, account, getGlobalContract, newContract}, hostAddress)
        } catch(e) {}
    }
    return {hostAddress, host};
}

export async function getOrganizationMetadata({context}, contract) {
    try {
        var uri = await blockchainCall(contract.methods.uri)
        var link = formatLink({ context }, uri)
        var metadata = await (await fetch(link)).json()
        return metadata
    } catch(e) {
    }
    return {}
}

export async function getOrganization({context, web3, account, getGlobalContract, newContract}, organizationAddress) {
    var contract = newContract(context.SubDAOABI, organizationAddress)
    var {hostAddress, host} = await tryExtractHost({context, web3, account, getGlobalContract, newContract}, contract)
    var organization = {
        contract,
        hostAddress,
        host,
        ...(await getOrganizationMetadata({context}, contract)),
        components : await getOrganizationComponents({newContract, context}, contract)
    }
    organization.stateVars = await getStateVars({context}, organization.components.stateManager.contract)

    organization.proposalModels = await getProposalModels({context}, contract)
    organization.type = organization.proposalModels.length === 0 ? 'root' : 'organization'

    organization.host && (organization.proposalModels = [...organization.proposalModels, ...host.proposalModels])

    organization.proposalConfiguration = await getProposalConfiguration({context, web3, account, getGlobalContract, newContract}, organization.components.proposalsManager)

    return organization
}

export async function getOrganizationComponents({newContract, context}, contract) {

    var components = {}
    components.treasuryManager = await retrieveComponent({newContract,context}, contract, context.grimoire.COMPONENT_KEY_TREASURY_MANAGER, "TreasuryManager")
    components.microservicesManager = await retrieveComponent({newContract, context}, contract, context.grimoire.COMPONENT_KEY_MICROSERVICES_MANAGER, "MicroservicesManager")
    components.proposalsManager = await retrieveComponent({newContract, context}, contract, context.grimoire.COMPONENT_KEY_PROPOSALS_MANAGER, "ProposalsManager")
    components.stateManager = await retrieveComponent({newContract, context}, contract, context.grimoire.COMPONENT_KEY_STATE_MANAGER, "StateManager")
    components.investmentsManager = await retrieveComponent({newContract, context}, contract, context.grimoire.COMPONENT_KEY_INVESTMENTS_MANAGER, "InvestmentsManager")
    components.treasurySplitterManager = await retrieveComponent({newContract, context}, contract, context.grimoire.COMPONENT_KEY_TREASURY_SPLITTER_MANAGER, "TreasurySplitterManager")
    components.delegationsManager = await retrieveComponent({newContract, context}, contract, context.grimoire.COMPONENT_KEY_DELEGATIONS_MANAGER, "DelegationsManager")
    components.subDAOsManager = await retrieveComponent({newContract, context}, contract, context.grimoire.COMPONENT_KEY_SUBDAOS_MANAGER, "SubDAOsManager")
    components.delegationsManager = await retrieveComponent({newContract, context}, contract, context.grimoire.COMPONENT_KEY_DELEGATIONS_MANAGER, "DelegationsManager")
    components.tokensManager = await retrieveComponent({newContract, context}, contract, context.grimoire.COMPONENT_KEY_TOKENS_MANAGER, "TokensManager")
    components.osFarming = await retrieveComponent({newContract, context}, contract, context.grimoire.COMPONENT_KEY_OS_FARMING, "TokensManager")
    components.dividendsFarming = await retrieveComponent({newContract, context}, contract, context.grimoire.COMPONENT_KEY_DIVIDENDS_FARMING, "TokensManager")
    components.tokenMinterAuth = await retrieveComponent({newContract, context}, contract, context.grimoire.COMPONENT_KEY_TOKEN_MINTER_AUTH, "OSFixedInflationManager")
    components.tokenMinter = await retrieveComponent({newContract, context}, contract, context.grimoire.COMPONENT_KEY_TOKEN_MINTER, "OSMinter")
    return components
}

async function getProposalModels({context}, contract) {
    try {
        var proposalModels = [...(await blockchainCall(contract.methods.proposalModels))]
        proposalModels = proposalModels.map(it => ({...it, proposalType : it.preset ? 'surveyless' : 'normal'}))
        proposalModels = await Promise.all(proposalModels.map(async it => {
            var link = formatLink({ context }, it.uri)
            var metadata = await (await fetch(link)).json()
            return {...it, ...metadata }
        }))
        return proposalModels
    } catch(e) {
        console.log(e)
    }
    return []
}

async function getStateVars({context}, stateManager) {
    if(!stateManager) {
        return []
    }
    var names = await blockchainCall(stateManager.methods.all)
    var vars = names.map(it => {
        var entryType = toEntryType({context}, it.entryType)
        return {
            key : it.key,
            name : context.componentNames[it.key] || it.key,
            entryType,
            value : convertValue(entryType, it.value)
        }
    })
    return vars
}

function convertValue(entryType, value) {
    try {
        var decoded = abi.decode([entryType.type], value)[0]
        var toString = decoded.toString()
        if(toString === '[object Object]') {
            return decoded
        }
        return toString
    } catch(e) {
    }
    return value
}

function toEntryType({context}, key) {
    var name = Object.entries(context.componentNames).filter(it => it[1] === key)[0]
    if(name) {
        name = name[0]
        name = name.split('ENTRY_TYPE_')
        name = name[name.length - 1]
        var dictionary = {
            ADDRESS : {
                name : "address",
                type : "address"
            },
            ADDRESS_LIST : {
                name : "array of address",
                type : "address[]"
            },
            UINT256 : {
                name : "number",
                type : "uint256"
            },
            UINT256_ARRAY : {
                name : "array of numbers",
                type : "uint256[]"
            }
        }
        var val = dictionary[name]
        if(val) {
            return {...val, key}
        }
    }

    return {
        key,
        name : 'unknown',
        type : 'unknown'
    }
}

async function retrieveComponent({newContract, context}, contract, key, componentName) {
    try {
        var addr = await blockchainCall(contract.methods.get, key)
        if(addr != VOID_ETHEREUM_ADDRESS) {
            return {
                key,
                name : Object.values(context.componentNames).filter(it => it === key)[0] || ("unknown (" + key + ")"),
                contract: newContract(context[componentName + "ABI"], addr)
            }
        }
    } catch(e) {
    }
}

export async function allProposals({ account, web3, context, newContract }, proposalsManager) {

    var topics = [
        web3Utils.sha3('ProposalCreated(address,address,bytes32)')
    ]

    var logs = await sendAsync(proposalsManager.currentProvider, 'eth_getLogs', {
        address : proposalsManager.options.address,
        topics,
        fromBlock : '0x0',
        toBlock : 'latest'
    })

    var proposalIds = {}
    logs.forEach(it => {
        var proposalId = it.topics[3]
        proposalIds[proposalId] = true
    })
    proposalIds = Object.values(proposalIds)
    var proposals = await blockchainCall(proposalsManager.methods.list, proposalIds)
    var currentBlock = await sendAsync(proposalsManager.currentProvider, 'eth_getBlockByNumber', 'latest', false)
    proposals = await Promise.all(proposals.map((prop, i) => decodeProposal({ account, web3, context, newContract }, prop)))
    return proposals
}

async function getProposalConfiguration({ account, web3, context, newContract }, proposalsManager) {
    var configuration = await blockchainCall(proposalsManager.contract.methods.configuration)
    console.log(configuration);
    var collectionAddresses = configuration.collections;
    var objectIds = configuration.objectIds;
    var weights = configuration.weights;
    var votingTokens = await Promise.all(objectIds.map((_, i) => decodeProposalVotingToken({ account, web3, context, newContract }, "0", collectionAddresses[i], objectIds[i], weights[i])))
    return votingTokens;
}