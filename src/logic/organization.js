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

export async function getOrganization({context, web3, account, getGlobalContract, newContract}, organizationAddress) {
    var contract = newContract(context.SubDAOABI, organizationAddress)
    var organization = {
        contract,
        components : await getOrganizationComponents({newContract, context}, contract)
    }
    try {
        organization.stateVars = await getStateVars({}, organization.components.stateManager.contract)
    } catch (e) {
    }
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

async function getStateVars({}, stateManager) {
    var names = await blockchainCall(stateManager.methods.all)
    var vars = names.map(it => {
        var entryType = toEntryType(it.entryType)
        return {
            name : it.name,
            entryType,
            value : convertValue(entryType, it.value)
        }
    })
    return names
}

function convertValue(entryType, value) {
    try {
        return abi.decode([entryType.type], [value])[0]
    } catch(e) {
    }
    return value
}

function toEntryType({context}, key) {
    var name = context.grimoire.values.filter(it => it === key)[0]
    if(name) {
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