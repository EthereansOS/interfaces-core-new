import { abi, VOID_ETHEREUM_ADDRESS, uploadMetadata, formatLink, fromDecimals, getNetworkElement, blockchainCall, web3Utils, sendAsync, tryRetrieveMetadata, VOID_BYTES32, numberToString } from "@ethereansos/interfaces-core"

import { encodeHeader } from "./itemsV2";

import { decodeProposal, decodeProposalVotingToken, extractProposalVotingTokens, generateItemKey } from "./ballot";
import { retrieveDelegationProposals } from "./delegation";
import { getData } from "./generalReader"

export async function create({ context, ipfsHttpClient, newContract, chainId, factoryOfFactories }, metadata, organization) {
    var uri = await uploadMetadata({ context, ipfsHttpClient }, metadata)
    var header = {
        host: VOID_ETHEREUM_ADDRESS,
        name: metadata.name,
        symbol: metadata.symbol,
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
        mandatoryComponentsDeployData, [],
        [],
        organization ? abi.encode(["address"], [organization]) : "0x"
    ]

    var deployOrganizationData = abi.encode([`tuple(${deployOrganizationDataType.join(',')})`], [deployOrganizationDataValue])

    var factoryData = await blockchainCall(factoryOfFactories.methods.get, getNetworkElement({ context, chainId }, "organizationsFactoryPosition"))

    var factoryAddress = factoryData.factoryList[factoryData.factoryList.length - 1]
    var factory = newContract(context.IFactoryABI, factoryAddress)

    await blockchainCall(factory.methods.deploy, deployOrganizationData)
}

export async function all({ context, newContract, chainId, factoryOfFactories }) {
    var args = {
        address: (await blockchainCall(factoryOfFactories.methods.get, getNetworkElement({ context, chainId }, "factoryIndices").subdao)).factoryList,
        topics: [
            web3Utils.sha3('Deployed(address,address,address,bytes)')
        ],
        fromBlock: '0x0',
        toBlock: 'latest'
    }
    var logs = await sendAsync(factoryOfFactories.currentProvider, "eth_getLogs", args)
    var organizations = logs.map(it => abi.decode(["address"], it.topics[2])[0])
    organizations = (await Promise.all(organizations.map(it => hasNoHost({ context, newContract }, it)))).filter(it => it)

    args.address = (await blockchainCall(factoryOfFactories.methods.get, getNetworkElement({ context, chainId }, "factoryIndices").dfo)).factoryList
    logs = await sendAsync(factoryOfFactories.currentProvider, "eth_getLogs", args)
    organizations = [...organizations, ...logs.map(it => abi.decode(["address"], it.topics[2])[0])]

    return await Promise.all(organizations.map(it => (tryRetrieveMetadata({ context }, { contract: newContract(context.SubDAOABI, it), address: it, type: 'organizations' }))))
}

export async function hasNoHost({ context, newContract }, organizationAddress) {
    var contract = newContract(context.SubDAOABI, organizationAddress)
    var hostAddress = await blockchainCall(contract.methods.host)
    if (hostAddress && hostAddress !== VOID_ETHEREUM_ADDRESS) {
        try {
            if (await blockchainCall(newContract(context.SubDAOsManagerABI, hostAddress).methods.exists, organizationAddress)) {
                return
            }
        } catch (e) {}
    }
    return organizationAddress
}

export async function tryExtractHost({ context, web3, account, getGlobalContract, newContract }, contract) {
    var hostAddress = await blockchainCall(contract.methods.host)
    var host;
    if (hostAddress && hostAddress !== VOID_ETHEREUM_ADDRESS) {
        try {
            var subDAOsManager = newContract(context.SubDAOsManagerABI, hostAddress)
            hostAddress = await blockchainCall(subDAOsManager.methods.host)
            host = await getOrganization({ context, web3, account, getGlobalContract, newContract }, hostAddress)
        } catch (e) {}
    }
    return {
        address: host ? host.address : hostAddress,
        ...host
    }
}

export async function getOrganizationMetadata({ context }, organization) {
    if (organization.uri) {
        return {}
    }
    try {
        organization.uri = await blockchainCall(organization.contract.methods.uri)
        organization.formattedUri = formatLink({ context }, organization.uri)
        var metadata = await (await fetch(organization.formattedUri)).json()
        return metadata
    } catch (e) {}
    return {}
}

export async function getOrganization({ context, web3, account, getGlobalContract, newContract }, organizationAddress, host) {
    var contract = newContract(context.SubDAOABI, organizationAddress)
    var organization = {
        address: organizationAddress,
        contract
    }

    var hostData = host ? host : await tryExtractHost({ context, web3, account, getGlobalContract, newContract }, contract)

    if (!host && hostData.contract) {
        return hostData
    }

    organization = {
        ...organization,
        host,
        ...(await getOrganizationMetadata({ context }, organization)),
        components: await getOrganizationComponents({ newContract, context }, contract)
    }
    //organization.stateVars = await getStateVars({ context }, organization)
    organization.proposalModels = await getProposalModels({ context }, contract)
    organization.type = organization.proposalModels.length === 0 ? 'root' : 'organization'
    organization.proposalsConfiguration = await getProposalsConfiguration({ context, web3, account, getGlobalContract, newContract }, organization.components.proposalsManager)

    organization.organizations = await getAllOrganizations({ context, web3, account, getGlobalContract, newContract }, organization)

    //organization.proposals = await getProposals({ context, newContract }, organization)

    organization.allProposals = organization.proposals || []
    try {
        organization.organizations.forEach(it => organization.allProposals.push(...it.allProposals))
    } catch(e) {}

    console.log("Delegations Managers", organization.address, organization.host?.address, organization.components.delegationsManager?.address)

    return organization
}

export async function retrieveAllProposals({ context, newContract }, organization) {
    if(organization.type === 'delegation') {
        return retrieveDelegationProposals({context, newContract}, organization)
    }
    var proposals = await getProposals({ context, newContract }, organization)
    await Promise.all((organization.organizations || []).map(async org => proposals.push(...(await getProposals({context, newContract}, org)))))
    return proposals
}

export async function getOrganizationComponents({ newContract, context }, contract) {

    var componentsKey = [
        context.grimoire.COMPONENT_KEY_TREASURY_MANAGER,
        context.grimoire.COMPONENT_KEY_MICROSERVICES_MANAGER,
        context.grimoire.COMPONENT_KEY_PROPOSALS_MANAGER,
        context.grimoire.COMPONENT_KEY_STATE_MANAGER,
        context.grimoire.COMPONENT_KEY_INVESTMENTS_MANAGER,
        context.grimoire.COMPONENT_KEY_TREASURY_SPLITTER_MANAGER,
        context.grimoire.COMPONENT_KEY_DELEGATIONS_MANAGER,
        context.grimoire.COMPONENT_KEY_SUBDAOS_MANAGER,
        context.grimoire.COMPONENT_KEY_DELEGATIONS_MANAGER,
        context.grimoire.COMPONENT_KEY_TOKENS_MANAGER,
        context.grimoire.COMPONENT_KEY_OS_FARMING,
        context.grimoire.COMPONENT_KEY_DIVIDENDS_FARMING,
        context.grimoire.COMPONENT_KEY_TOKEN_MINTER_AUTH,
        context.grimoire.COMPONENT_KEY_TOKEN_MINTER
    ]

    var componentNames = [
        "TreasuryManager",
        "MicroservicesManager",
        "ProposalsManager",
        "StateManager",
        "InvestmentsManager",
        "TreasurySplitterManager",
        "DelegationsManager",
        "SubDAOsManager",
        "DelegationsManager",
        "DelegationTokensManager",
        "OSFarming",
        "DividendsFarming",
        "OSFixedInflationManager",
        "OSMinter"
    ]

    var componentsAddress = await blockchainCall(contract.methods.list, componentsKey)

    return componentsKey.reduce((acc, key, i) => {
        var item
        var addr = componentsAddress[i]
        var componentName = componentNames[i]
        if (addr != VOID_ETHEREUM_ADDRESS) {
            console.log(componentName)
            item = {
                address: addr,
                key,
                name: Object.values(context.componentNames).filter(it => it === key)[0] || ("unknown (" + key + ")"),
                contract: newContract(context[componentName + "ABI"], addr)
            }
        }
        var newObject = {...acc}
        item && (newObject[(componentName[0].toLowerCase() + componentName.substring(1))] = item)
        return newObject
    }, {})
}

export async function getProposalModels({ context }, contract) {
    try {
        var proposalModels = [...(await blockchainCall(contract.methods.proposalModels))]
        proposalModels = proposalModels.map(it => ({...it, proposalType: it.preset ? 'surveyless' : 'normal' }))
        proposalModels = await Promise.all(proposalModels.map(async it => {
            var link = formatLink({ context }, it.uri)
            var metadata = {}
            try {
                metadata = await (await fetch(link)).json()
            } catch(e) {
            }
            return {...it, ...metadata }
        }))
        return proposalModels
    } catch (e) {}
    return []
}

async function getStateVars({ context }, organization) {
    try {
        var names = await blockchainCall(organization.components.stateManager.methods.all)
        var vars = names.map(it => {
            var entryType = toEntryType({ context }, it.entryType)
            return {
                key: it.key,
                name: context.componentNames[it.key] || it.key,
                entryType,
                value: convertValue(entryType, it.value)
            }
        })
        return vars
    } catch (e) {}
    return []
}

function convertValue(entryType, value) {
    try {
        var decoded = abi.decode([entryType.type], value)[0]
        var toString = decoded.toString()
        if (toString === '[object Object]') {
            return decoded
        }
        return toString
    } catch (e) {}
    return value
}

function toEntryType({ context }, key) {
    var name = Object.entries(context.componentNames).filter(it => it[1] === key)[0]
    if (name) {
        name = name[0]
        name = name.split('ENTRY_TYPE_')
        name = name[name.length - 1]
        var dictionary = {
            ADDRESS: {
                name: "address",
                type: "address"
            },
            ADDRESS_LIST: {
                name: "array of address",
                type: "address[]"
            },
            UINT256: {
                name: "number",
                type: "uint256"
            },
            UINT256_ARRAY: {
                name: "array of numbers",
                type: "uint256[]"
            }
        }
        var val = dictionary[name]
        if (val) {
            return {...val, key }
        }
    }

    return {
        key,
        name: 'unknown',
        type: 'unknown'
    }
}

export async function allProposals({ account, web3, context, newContract }, proposalsManager) {

    var topics = [
        web3Utils.sha3('ProposalCreated(address,address,bytes32)')
    ]

    var logs = await sendAsync(proposalsManager.currentProvider, 'eth_getLogs', {
        address: proposalsManager.options.address,
        topics,
        fromBlock: '0x0',
        toBlock: 'latest'
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

async function getProposalsConfiguration({ account, web3, context, newContract }, proposalsManager) {
    var configuration = await blockchainCall(proposalsManager.contract.methods.configuration)
    var collectionAddresses = configuration.collections;
    var objectIds = configuration.objectIds;
    var weights = configuration.weights;
    var votingTokens = await Promise.all(objectIds.map((_, i) => decodeProposalVotingToken({ account, web3, context, newContract }, "0", collectionAddresses[i], objectIds[i], weights[i])))
    return {...configuration, votingTokens };
}

async function getAllOrganizations({ account, web3, context, newContract }, organization) {
    try {
        var args = {
            address: organization.components.subDAOsManager.address,
            topics: [
                web3Utils.sha3('SubDAOSet(bytes32,address,address)')
            ],
            fromBlock: '0x0',
            toBlock: 'latest'
        }

        var keys = {}
        var logs = await sendAsync(organization.contract.currentProvider, 'eth_getLogs', args)
        logs.forEach(it => keys[it.topics[1]] = true)
        var organizations = await blockchainCall(organization.components.subDAOsManager.contract.methods.list, Object.keys(keys))
        organizations = Object.keys(keys).reduce((acc, it, i) => {
            var x = {...acc }
            organizations[i] !== VOID_ETHEREUM_ADDRESS && (x[it] = organizations[i])
            return x
        }, {})
        return await Promise.all(Object.entries(organizations).map(async it => ({ key: it[0], ...(await getOrganization({ account, web3, context, newContract }, it[1], organization)) })))
    } catch (e) {}
    return []
}

async function getSurveylessProposals({context}, organization) {
    if(!organization || organization.proposalModels.length === 0) {
        return []
    }
    organization.proposalModels.forEach((it, i) => it.modelIndex = i)
    var surveyless = organization.proposalModels.filter(it => it.isPreset)
    var proposalIds = surveyless.reduce((acc, it) => [...acc, ...it.presetProposals.filter(it => it !== VOID_BYTES32)], [])
    var metadatas = await Promise.all(surveyless.map(async it => {
        var metadata = {}
        try {
            metadata = {...(await(await fetch(formatLink({context}, it.uri))).json()), uri : it.uri}
        } catch(e) {
        }
        try {
            metadata = {...metadata, ...wellknownPresets[metadata.uri.split('ipfs://ipfs/').join('')]}
        } catch(e) {}
        return metadata
    }))

    var surveylessProposals = surveyless.map((it, i) => {
        var initialized = it.presetProposals.filter(it => it === VOID_BYTES32).length === 0
        var subProposals = it.presetValues.map((_, index) => ({
            ...it,
            organization,
            proposalsManager : organization.components.proposalsManager.contract,
            initialized,
            isSurveyless : true,
            ...metadatas[i],
            proposalId : it.presetProposals[index],
            label : metadatas[i].presetValues && metadatas[i].presetValues[index],
            proposalsConfiguration : organization.proposalsConfiguration
        }))
        return {
            ...it,
            ...metadatas[i],
            organization,
            proposalsManager : organization.components.proposalsManager.contract,
            initialized,
            isSurveyless : true,
            subProposals,
            proposalsConfiguration : organization.proposalsConfiguration
        }
    })

    return surveylessProposals
}

var percentages = {
    presetValues : [
        "0.03 %",
        "0.08 %",
        "0.3 %",
        "0.8 %",
        "1 %",
        "3 %"
    ]
}

var wellknownPresets = {
    'QmPkZjrGUpNSP19oWhdRfoy9YdP7fL9AJtzmgiFR2sekyT' : {
        presetValues : [
            "0.5 %",
            "1 %",
            "3 %",
            "5 %",
            "8 %",
            "15 %"
        ]
    },
    'QmSBSi8STApCH3LtRALMQSA6v7iMka9UYFewY8N4jB9dSN' : percentages,
    'Qmee1ibJCtnhu7ChpcsKyXum9KikptJtQrAxeCLer55Aj5' : percentages,
    'QmR3S8cPGb4Tm9dr7sVx5meUPMsptV6vBbCCP96e2cZeAL' : percentages,
    'QmesA2MjYEjdsC2wFRSfqDmThDASftNZThwWMuhZ7vKQaV' : {
        presetValues : [
            "0.05 OS",
            "0.1 OS",
            "1 OS",
            "5 OS",
            "10 OS",
            "100 OS"
        ]
    },
    'QmVGor81bynT1GLQoWURiTSdPmPEDbe8eC5znNDHfTfkfT' : percentages,
}

async function getSurveysByModels({context}, organization) {
    if(!organization || organization.proposalModels.length === 0) {
        return []
    }
    organization.proposalModels.forEach((it, i) => it.modelIndex = i)
    var surveys = organization.proposalModels.filter(it => !it.isPreset)
    var metadatas = await Promise.all(surveys.map(async it => {
        var metadata = {}
        try {
            metadata = {...(await(await fetch(formatLink({context}, it.uri))).json()), uri : it.uri}
        } catch(e) {
        }
        try {
            metadata = {...metadata, ...wellknownPresets[metadata.uri.split('ipfs://ipfs/').join('')]}
        } catch(e) {}
        return metadata
    }))

    var logArray = await Promise.all(surveys.map(it => sendAsync(organization.contract.currentProvider, 'eth_getLogs', {
        address : organization.address,
        fromBlock : '0x0',
        toBlock : 'latest',
        topics : [
            web3Utils.sha3('Proposed(uint256,uint256,bytes32)'),
            abi.encode(["uint256"], [it.modelIndex])
        ]
    })))

    for(var logs of logArray) {
        for(var log of logs) {
            var proposalId = log.topics[3]
            var modelIndex = parseInt(abi.decode(["uint256"], log.topics[1])[0].toString())
            var survey = surveys.filter(it => it.modelIndex === modelIndex)[0]
            !survey.proposalIds && (survey.proposalIds = [])
            survey.proposalIds.push(proposalId)
        }
    }

    var surveysProposals = await Promise.all(surveys.map(async (it, i) => {
        var subProposals = await Promise.all((it.proposalIds = (it.proposalIds || [])).map(async it => ({
            ...it,
            ...metadatas[i],
            ...((await blockchainCall(organization.components.proposalsManager.contract.methods.list, [it]))[0]),
            proposalId : it,
            organization,
            proposalsManager : organization.components.proposalsManager.contract,
            isSurveyless : false,
            subProposals,
            proposalsConfiguration : organization.proposalsConfiguration
        })))
        return {
            ...it,
            ...metadatas[i],
            organization,
            proposalsManager : organization.components.proposalsManager.contract,
            isSurveyless : false,
            subProposals,
            proposalsConfiguration : organization.proposalsConfiguration
        }
    }))

    return surveysProposals
}

async function getProposals({context}, organization) {
    var proposals = [
        ...(await getSurveylessProposals({context}, organization)),
        ...(await getSurveysByModels({context}, organization))
    ]
    if(proposals.length > 0) {
        return proposals
    }
    try {
        if (organization.proposalModels && organization.proposalModels.length > 0) {
            proposals = await Promise.all(organization.proposalModels.map(async (it, i) => ({...it, index: i, proposalsManager : organization.components.proposalsManager, organization })))
            var toDiscard = {}
            proposals.forEach(it => it.proposals = it.presetProposals.filter(it => it !== VOID_BYTES32))
            proposals.forEach(it => it.proposals.forEach(proposalId => toDiscard[proposalId] = true))
            var args = {
                address: organization.address,
                fromBlock: '0x0',
                toBlock: 'latest',
                topics: [
                    web3Utils.sha3('Proposed(uint256,uint256,bytes32)')
                ]
            }

            var logs = await sendAsync(organization.contract.currentProvider, 'eth_getLogs', args)
            logs = logs.map(it => ({
                modelIndex: abi.decode(["uint256"], it.topics[1])[0],
                proposalId: it.topics[3]
            }))
            .filter(it => !toDiscard[it.proposalId])
            logs.forEach(({ modelIndex, proposalId }) => proposals[modelIndex].proposals.push(proposalId))
            await Promise.all(proposals.filter(it => it.isPreset).map(async proposal => {
                var args = {
                    address: organization.address,
                    fromBlock: '0x0',
                    toBlock: 'latest',
                    topics: [
                        web3Utils.sha3('ProposalTerminated(bytes32,bool,bytes)'),
                        proposal.proposals.filter(it => it.proposalId)
                    ]
                }
                var logs = await sendAsync(organization.contract.currentProvider, 'eth_getLogs', args)
                logs = logs.filter(it => abi.decode(["bool", "bytes"], it.data)[0][0]).reverse()[0]
                var proposalId = logs?.topics[1]
                proposalId && (proposal.lastChosenValue = proposal.presetValues[proposal.presetProposals.indexOf(proposalId)])
            }))
        }
    } catch(e) {
        console.log(e)
    }
    return proposals
}

export async function createPresetProposals({}, proposal) {
    var create = proposal.presetProposals.map((_, i) => ({
        codes : [{
            location : abi.decode(["address"], abi.encode(["uint256"], [proposal.modelIndex]))[0],
            bytecode : abi.encode(["uint256"], [i])
        }],
        alsoTerminate : false
    }))
    await blockchainCall(proposal.proposalsManager.methods.batchCreate, create)
}

export async function vote({account}, proposal, token, accept, refuse, proposalId, permitSignature, voter) {
    if(token.mainInterface) {
        var data = abi.encode(["bytes32", "uint256", "uint256", "address", "bool"], [proposalId, accept, refuse, voter || account, false])
        await blockchainCall(token.mainInterface.methods.safeTransferFrom, account, proposal.proposalsManager.options.address, token.id, accept.ethereansosAdd(refuse), data)
    } else {
        await blockchainCall(proposal.proposalsManager.methods.vote, token.address, proposalId, permitSignature || '0x', accept, refuse, voter || account)
    }
}

export async function terminateProposal({}, proposal, proposalId) {
    await blockchainCall(proposal.proposalsManager.methods.terminate, [proposalId])
}

export async function withdrawProposal({account}, proposal, proposalId, address, voteOrWithdraw) {
    await blockchainCall(proposal.proposalsManager.methods.withdrawAll, [proposalId], address || account, voteOrWithdraw || false)
}

export async function surveylessIsTerminable({ account, newContract, context}, proposal, proposalId) {
    var proposalData = (await blockchainCall(proposal.proposalsManager.methods.list, [proposalId]))[0]

    var values = [
        proposalData.proposer,
        proposalData.codeSequence,
        proposalData.creationBlock,
        proposalData.accept,
        proposalData.refuse,
        proposalData.triggeringRules,
        proposalData.canTerminateAddresses,
        proposalData.validatorsAddresses,
        proposalData.validationPassed,
        proposalData.terminationBlock,
        proposalData.votingTokens
    ]

    var types = [
        "address",
        "address[]",
        "uint256",
        "uint256",
        "uint256",
        "address",
        "address[]",
        "address[]",
        "bool",
        "uint256",
        "bytes"
    ]

    var data = abi.encode([`tuple(${types.join(',')})`], [values])

    var results = await Promise.all(proposalData.validatorsAddresses.map(async validator => {
        var checker = newContract(context.IProposalCheckerABI, validator)
        var result = await blockchainCall(checker.methods.check, proposal.proposalsManager.options.address, proposalId, data, account, account, {from : proposal.proposalsManager.address})
        return result
    }))

    return results.filter(it => !it).length === 0
}

export async function surveyIsTerminable({ account, newContract, context}, proposal, proposalId) {
    var proposalData = (await blockchainCall(proposal.proposalsManager.methods.list, [proposalId]))[0]

    var values = [
        proposalData.proposer,
        proposalData.codeSequence,
        proposalData.creationBlock,
        proposalData.accept,
        proposalData.refuse,
        proposalData.triggeringRules,
        proposalData.canTerminateAddresses,
        proposalData.validatorsAddresses,
        proposalData.validationPassed,
        proposalData.terminationBlock,
        proposalData.votingTokens
    ]

    if(proposalData.terminationBlock !== '0') {
        return false
    }

    var types = [
        "address",
        "address[]",
        "uint256",
        "uint256",
        "uint256",
        "address",
        "address[]",
        "address[]",
        "bool",
        "uint256",
        "bytes"
    ]

    var data = abi.encode([`tuple(${types.join(',')})`], [values])

    var results = await Promise.all(proposalData.canTerminateAddresses.map(async validator => {
        var checker = newContract(context.IProposalCheckerABI, validator)
        var result = await blockchainCall(checker.methods.check, proposal.proposalsManager.options.address, proposalId, data, account, account, {from : proposal.proposalsManager.address})
        return result
    }))

    return results.filter(it => it).length > 0
}

export async function retrieveProposalModelMetadata({context}, proposal) {

    var metadata = {...proposal};

    try {
        metadata = await (await fetch(proposal.formattedLink = formatLink({context}, proposal.uri))).json()
    } catch(e) {
    }

    try {
        var rawTypes = metadata.decodePreset.types.map(it => it.rawType)

        var values = proposal.presetValues.map(it => abi.decode(rawTypes, it))

        values = values.map(decodedValues => decodedValues.map(decodedValue => {
            var toString = decodedValue.toString()
            if(toString === '[Object object]') {
                toString = decodedValue
            }
            return toString
        }))

        values = values.map(valuesArray => valuesArray.map((value, i) => prettifyValue(value, metadata.decodePreset.types[i])))

        if(metadata.decodePreset.toDisplay) {
            values = values.map(valuesToDisplay => {
                var display = metadata.decodePreset.toDisplay.map(it => valuesToDisplay[it]).join(' ').trim()
                return display
            })
        }

        if(metadata.decodePreset.suffix) {
            values = values.map(prettifiedValue => {
                if(prettifiedValue instanceof Array) {
                    return prettifiedValue.map(val => val + metadata.decodePreset.suffix)
                }
                return prettifiedValue + metadata.decodePreset.suffix
            })
        }

        metadata.prettifiedValues = values
    } catch(e) {
        console.log(e)
    }

    return metadata
}

function prettifyValue(value, type) {
    if(type.rawType === 'string') {
        return value
    }
    if(type.additionalData?.decimals) {
        value = fromDecimals(value, type.additionalData.decimals, true)
    }
    if(type.name === 'percentage') {
        value += ' %'
    }
    return value
}

var uint256EntryTypePercentage = {
    decodePreset : {
        toDisplay : [1],
        types : [{
            rawType : 'string',
            name : 'entryName',
            label : 'State Variable Name'
        }, {
            rawType : 'uint256',
            name : 'percentage',
            label : 'Percentage',
            additionalData : {
                'decimals' : 16
            }
        }]
    }
}

var uint256EntryType = {
    decodePreset : {
        toDisplay : [1],
        suffix : ' OS',
        types : [{
            rawType : 'string',
            name : 'entryName',
            label : 'State Variable Name'
        }, {
            rawType : 'uint256',
            name : 'number',
            label : 'Amount',
            additionalData : {
                'decimals' : 18
            }
        }]
    }
}

var wellKnownLinks = {
    'QmPkZjrGUpNSP19oWhdRfoy9YdP7fL9AJtzmgiFR2sekyT' : {
        decodePreset : {
            types : [{
                rawType : 'uint256',
                name : 'percentage',
                label : 'Percentage',
                additionalData : {
                    'decimals' : 16
                }
            }]
        }
    },
    'QmSBSi8STApCH3LtRALMQSA6v7iMka9UYFewY8N4jB9dSN' : uint256EntryTypePercentage,
    'Qmee1ibJCtnhu7ChpcsKyXum9KikptJtQrAxeCLer55Aj5' : uint256EntryTypePercentage,
    'QmR3S8cPGb4Tm9dr7sVx5meUPMsptV6vBbCCP96e2cZeAL' : uint256EntryTypePercentage,
    'QmesA2MjYEjdsC2wFRSfqDmThDASftNZThwWMuhZ7vKQaV' : uint256EntryType,
    'QmVGor81bynT1GLQoWURiTSdPmPEDbe8eC5znNDHfTfkfT' : uint256EntryTypePercentage,
}

export async function proposeBuy({}, proposal, tokens) {

    var addresses = []
    try {
        addresses = tokens.map(it => it && it.address).filter(it => it !== undefined && it !== null).filter((it, i, array) => array.indexOf(it) === i)
    } catch(e) {
    }

    if(addresses.length !== 4 || addresses.filter(it => it === VOID_ETHEREUM_ADDRESS).length > 0) {
        throw "You must choose 4 different ERC20 tokens"
    }

    var create = [{
        codes : [{
            location : abi.decode(["address"], abi.encode(["uint256"], [proposal.modelIndex]))[0],
            bytecode : abi.encode(["address[]"], [addresses])
        }],
        alsoTerminate : false
    }]

    await blockchainCall(proposal.proposalsManager.methods.batchCreate, create)
}

export async function proposeSell({}, proposal, tokens, percentages) {
    var addresses = []
    try {
        addresses = tokens.map(it => it && it.address).filter(it => it !== undefined && it !== null).filter((it, i, array) => array.indexOf(it) === i)
    } catch(e) {
    }

    if(addresses.length !== 5 || addresses.filter(it => it === VOID_ETHEREUM_ADDRESS).length > 0) {
        throw "You must choose 5 different ERC20 tokens"
    }

    var realPercentages = percentages.filter(it => it > 0 && it <= 5).map(it => numberToString(it * 1e16))
    if(realPercentages.length !== 5) {
        throw "Percentages must be 5 numbers greater than zero and less than or equal to 5%"
    }

    var create = [{
        codes : [{
            location : abi.decode(["address"], abi.encode(["uint256"], [proposal.modelIndex]))[0],
            bytecode : abi.encode(["address[]", "uint256[]"], [addresses, percentages])
        }],
        alsoTerminate : false
    }]

    await blockchainCall(proposal.proposalsManager.methods.batchCreate, create)
}

export async function retrieveSurveyByModel({}, proposal) {
    var index = proposal.modelIndex

    var args = {
        address: proposal.organization.address,
        fromBlock : '0x0',
        toBlock : 'latest',
        topics : [
            web3Utils.sha3('Proposed(uint256,uint256,bytes32)'),
            abi.encode(["uint256"], [index])
        ]
    }

    var logs = await sendAsync(proposal.proposalsManager.currentProvider, 'eth_getLogs', args)
    var proposalIds = logs.map(it => it.topics[3])

    var proposals = await blockchainCall(proposal.proposalsManager.methods.list, proposalIds)

    proposals = proposals.map((it, i) => ({...it, id : proposalIds[i], proposalsManager : proposal.proposalsManager, proposalsConfiguration : proposal.organization.proposalsConfiguration}))

    return proposals
}

export async function tokensToWithdraw({account, web3, context, newContract}, proposal, proposalIds) {
    var proposalIds = proposalIds instanceof Array ? proposalIds : [proposalIds]
    var proposalDatas = await blockchainCall(proposal.proposalsManager.methods.list, proposalIds)
    var tokens = await Promise.all(proposalIds.map((proposalId, i) => extractProposalVotingTokens({account, web3, context, newContract}, proposalDatas[i], proposalId)))
    var itemKeys = proposalIds.map((proposalId, i) => tokens[i].map(it => generateItemKey(it, proposalId)))
    var accounts = proposalIds.map(() => account)
    var x = await blockchainCall(proposal.proposalsManager.methods.votes, proposalIds, accounts, itemKeys)
    var tw = []
    var accs = proposalDatas.map(it => fromDecimals(it.accept, 18, true))
    var refs = proposalDatas.map(it => fromDecimals(it.refuse, 18, true))
    x[0].forEach((it, i) => {
        var values = x[2][i]
        var accepts = x[0][i]
        var refuses = x[1][i]
        var id = proposalIds[i]
        var prettifiedValue = "Staked"
        var tokensArray = tokens[i]

        for(var z in tokensArray) {
            var token = tokensArray[z]
            var value = fromDecimals(values[z], token.decimals, true)
            if(value == 0) {
                return
            }
            tw.push({
                proposalId : id,
                prettifiedValue,
                accept : fromDecimals(accepts, token.decimals, true),
                refuse : fromDecimals(refuses, token.decimals, true),
                value,
                address : token.address,
                symbol : token.symbol
            })
        }
    })
    return {tw, accs, refs}
}

export async function readGovernanceRules({}, proposal, proposalId) {
    var proposalData = (await blockchainCall(proposal.proposalsManager.methods.list, [proposalId]))[0]

    var validators = await extractRules({provider : proposal.proposalsManager.currentProvider}, proposalData.validators, "validation", proposalData)
    var terminates = await extractRules({provider : proposal.proposalsManager.currentProvider}, proposalData.canTerminates, "termination", proposalData)

    return {validators, terminates}
}

export async function extractRules({provider}, rules, type, proposalData) {
    if(!rules || rules.length === 0) {
        return []
    }
    var convertedRules = [];
    convertedRules = await Promise.all(rules.filter(it => it !== VOID_ETHEREUM_ADDRESS).map(it => getData({provider}, it)))
    return await cleanRules(convertedRules, type, proposalData);
}

async function cleanRules(rules, type, proposalData) {
    if(!rules || rules.length === 0) {
        return []
    }
    return Promise.all(rules.map(it => cleanRule(it, type, proposalData)))
}

async function cleanRule(rule, type, proposalData) {
    var clean = cleaners[rule.label](rule, type, proposalData)
    clean = clean.then ? await clean : clean
    return clean
}

var cleaners = {
    hardCap(rule, type) {
        var val = fromDecimals(rule.valueUint256, rule.discriminant ? 16 : 18)
        var text = "Threshold is "
        var value = val + (rule.discriminant ? " % of supply" : " votes")
        return {text, value}
    },
    quorum(rule, type) {
        var val = fromDecimals(rule.valueUint256, rule.discriminant ? 16 : 18)
        var text = "Quorum is "
        var value = val + (rule.discriminant ? " % of supply" : " votes")
        return {text, value}
    },
    host(rule, type) {
        var text = "Host is "
        var value = rule.valueAddress
        return {text, value}
    },
    async blockLength(rule, _, proposalData) {
        if(proposalData) {
            var text = "Block number is #"
            var value = rule.valueUint256.ethereansosAdd(proposalData.creationBlock)
            return {text, value}
        } else {
            var text = rule.valueUint256 + " blocks after creation"
            var value = ""
            return {text, value}
        }
    },
    async validationBomb(rule, _, proposalData) {
        if(proposalData) {
            var text = "Block number is before #"
            var value = rule.valueUint256.ethereansosAdd(proposalData.creationBlock)
            return {text, value}
        } else {
            var text = rule.valueUint256 + " blocks after creation"
            var value = ""
            return {text, value}
        }
    }
}