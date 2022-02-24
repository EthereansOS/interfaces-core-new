import { abi, VOID_ETHEREUM_ADDRESS, uploadMetadata, formatLink, getNetworkElement, blockchainCall, web3Utils, sendAsync, tryRetrieveMetadata, toDecimals, fromDecimals, numberToString } from "@ethereansos/interfaces-core"

import { getOrganization, extractRules, wellknownPresets } from "./organization"

import { decodeProposalVotingToken } from './ballot'

import { getData, getRawField } from "./generalReader"

import { loadItem, loadToken } from "./itemsV2"
import { loadTokenFromAddress } from "./erc20"

export async function getDelegationsOfOrganization({ context, chainId, web3, account, getGlobalContract, newContract }, organization) {
    var delegationsManager = organization.components.delegationsManager.contract
    var situation = await blockchainCall(delegationsManager.methods.getSituation)

    var list = [...situation[0]].map((_, i) => ({
        treasuryManagerAddress : situation[0][i],
        percentage : situation[1][i]
    })).sort((a, b) => {
        if (parseInt(a.percentage) > parseInt(b.percentage)) return -1
        if (parseInt(a.percentage) < parseInt(b.percentage)) return 1
        return 0;
    })

    var delegationAddresses = await Promise.all(list.map(it => getRawField({provider : delegationsManager.currentProvider}, it.treasuryManagerAddress, 'host')))

    for(var i in delegationAddresses) {
        var delegationAddress = abi.decode(["address"], delegationAddresses[i])[0]
        list[i].delegation = newContract(context.SubDAOABI, list[i].delegationAddress = list[i].key = delegationAddress)
    }

    list = await Promise.all(list.map(async it => {
        try {
            var uri = await blockchainCall(it.delegation.methods.uri)
            uri = formatLink({ context }, uri)
            var metadata = await (await fetch(uri)).json()
            it = {...it, ...metadata}
        } catch(e) {}
        return it
    }))

    return list;
}

export async function getAvailableDelegationsManagers({ context, chainId, web3, account, getGlobalContract, newContract, lightweight }, delegation) {
    var exceptFor = delegation && await getDelegationsManagers({ context, chainId, getGlobalContract, newContract, web3, account, lightweight : true }, delegation)
    exceptFor = (exceptFor || []).map(it => it.delegationsManagerAddress)
    var delegationsManagers = await getDelegationsManagers({ context, chainId, web3, account, getGlobalContract, newContract, lightweight : true})
    delegationsManagers = delegationsManagers.filter(it => exceptFor.indexOf(it.delegationsManagerAddress) === -1)
    delegationsManagers = lightweight ? delegationsManagers : await Promise.all(delegationsManagers.map(async it => ({...it, organization : await tryRetrieveMetadata({context}, {contract : newContract(context.ISubDAOABI, it.hostAddress), address : it.hostAddress, type: 'organization'})})))
    return delegationsManagers
}

export async function getDelegationsManagers({ context, chainId, getGlobalContract, web3, account, newContract, lightweight }, delegation) {
    const factoryOfFactories = getGlobalContract("factoryOfFactories");

    const factoryIndices = getNetworkElement({context, chainId}, "factoryIndices")

    var address = []
    await Promise.all(([factoryIndices.dfo, factoryIndices.subdao]).map(async it => address.push(...(await blockchainCall(factoryOfFactories.methods.get, it))[1])))

    var args = {
        address,
        topics : [
            web3Utils.sha3('Deployed(address,address,address,bytes)')
        ],
        fromBlock : '0x0',
        toBlock : 'latest'
    }

    var logs = await sendAsync(web3.currentProvider, 'eth_getLogs', args)

    address = logs.map(it => abi.decode(["address"], it.topics[2])[0])

    const COMPONENT_KEY_DELEGATIONS_MANAGER = "0x49b87f4ee20613c184485be8eadb46851dd4294a8359f902606085b8be6e7ae6"

    args = {
        address,
        topics : [
            web3Utils.sha3('ComponentSet(bytes32,address,address,bool)'),
            COMPONENT_KEY_DELEGATIONS_MANAGER
        ],
        fromBlock : '0x0',
        toBlock : 'latest'
    }
    var logs = await sendAsync(web3.currentProvider, 'eth_getLogs', args)
    address = logs.map(it => it.address)
    address = address.filter((it, i, array) => array.indexOf(it) === i)

    address = await Promise.all(address.map(it => blockchainCall(newContract(context.SubDAOABI, it).methods.get, COMPONENT_KEY_DELEGATIONS_MANAGER)))
    address = address.filter((it, i, array) => array.indexOf(it) === i)
    address = address.filter(it => it !== VOID_ETHEREUM_ADDRESS)

    var contracts = address.map(it => newContract(context.DelegationsManagerABI, it))

    var hosts = await Promise.all(contracts.map(it => blockchainCall(it.methods.host)))
    hosts = hosts.map((host, i) => ({
        hostAddress : host,
        delegationsManagerAddress : address[i],
        delegationsManager : contracts[i]
    }));

    var uniqueHosts = {}
    hosts.forEach(it => uniqueHosts[it.hostAddress] = it)
    hosts = Object.values(uniqueHosts)

    if(delegation) {
        hosts = await Promise.all(hosts.map(async it => {
            var data = await blockchainCall(it.delegationsManager.methods.exists, delegation)
            if(data[0]) {
                return {
                    ...it,
                    delegationAddress : delegation,
                    treasuryManagerAddress : data[2]
                }
            }
        }))
        hosts = hosts.filter(it => it)
    }

    hosts = lightweight ? hosts : await Promise.all(hosts.map(async it => ({...it, organization : await tryRetrieveMetadata({context}, {contract : newContract(context.ISubDAOABI, it.hostAddress), address : it.hostAddress, type: 'organization'})})))

    return hosts
}

export async function createDelegation({context, ipfsHttpClient, newContract, chainId, factoryOfFactories}, metadata) {
    var uri = await uploadMetadata({context, ipfsHttpClient}, metadata)

    var mandatoryComponentsDeployData = [
        "0x",
        "0x",
        abi.encode(["string"], [metadata.ticker])
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

export async function all({context, newContract, chainId, factoryOfFactories, account, mine}, metadata, organization) {
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

    var delegations = logs.map(it => newContract(context.ISubDAOABI, abi.decode(["address"], it.topics[2])[0]))

    delegations = await Promise.all(delegations.map(contract => (tryRetrieveMetadata({context}, {contract, address : contract.options.address, type: 'delegations'}))))

    if(mine) {
        delegations = await Promise.all(delegations.map(async it => {
            try {
                var proposalModels = await blockchainCall(it.contract.methods.proposalModels)
                var host = abi.decode(["address"], await getRawField({provider: it.contract.currentProvider}, proposalModels[0].creationRules, 'value'))[0].toString()
                if(host === account) {
                    return it
                }
            } catch(e) {
                var initializer = await blockchainCall(it.contract.methods.initializer)
                initializer = await getRawField({ provider : it.contract.currentProvider }, initializer, 'deployer(address)', it.address)
                initializer = abi.decode(["address"], initializer)[0]
                if(initializer === account) {
                    return it
                }
            }
        }))
        delegations = delegations.filter(it => it)
    }

    return delegations
}

export async function getDelegation({context, web3, account, getGlobalContract, newContract}, delegationAddress) {

    var delegation = await getOrganization({context, web3, account, getGlobalContract, newContract}, delegationAddress)
    delegation.type = 'delegation'

    var initializer = await blockchainCall(delegation.contract.methods.initializer)
    initializer = await getRawField({ provider : delegation.contract.currentProvider }, initializer, 'deployer(address)', delegation.address)
    initializer = abi.decode(["address"], initializer)[0]

    delegation.deployer = initializer

    try {
        delegation.host = abi.decode(["address"], await getRawField({provider: delegation.contract.currentProvider}, delegation.proposalModels[0].creationRules, 'value'))[0].toString()
    } catch(e) {
    }

    return delegation
}

export async function attachToOrganization({ context, chainId, web3, account, newContract, getGlobalContract, ipfsHttpClient }, element, additionalMetadata, selected) {

    var attachInsurance = await blockchainCall(selected.delegationsManager.methods.attachInsurance)

    var token = await blockchainCall(selected.delegationsManager.methods.supportedToken)
    token = await loadToken({context, chainId, web3, account, newContract, getGlobalContract}, token[0], token[1])

    var paidFor = await blockchainCall(selected.delegationsManager.methods.paidFor, element.address, account)
    paidFor = paidFor[0]

    if(parseInt(paidFor) < parseInt(attachInsurance)) {
        paidFor = attachInsurance.ethereansosSub(paidFor)
        paidFor = fromDecimals(paidFor, token.decimals)
        throw `An assurance of ${paidFor} ${token.name} (${token.symbol}) is needed to attach to this Organization`
    }

    var delegationsManagerAddress = selected.delegationsManagerAddress

    var additionalUri = await uploadMetadata({context, ipfsHttpClient}, additionalMetadata)
    await propose({}, element, 0, abi.encode(["string", "address"], [additionalUri, delegationsManagerAddress]), true)
}

export async function setDelegationMetadata({ context, ipfsHttpClient }, element, additionalMetadata, metadata) {
    var uri = await uploadMetadata({context, ipfsHttpClient}, metadata)
    var additionalUri = await uploadMetadata({context, ipfsHttpClient}, additionalMetadata)
    await propose({}, element, 1, abi.encode(["string", "string"], [additionalUri, uri]), true)
}

export async function changeVotingRules({ context, ipfsHttpClient }, element,
    additionalMetadata,
    quorumPercentage,
    validationBomb,
    blockLength,
    hardCapPercentage) {

    var additionalUri = await uploadMetadata({context, ipfsHttpClient}, additionalMetadata)

    quorumPercentage = toDecimals(quorumPercentage, 16)
    hardCapPercentage = toDecimals(hardCapPercentage, 16)

    await propose({},
        element,
        2,
        abi.encode(["string", "uint256","uint256","uint256","uint256"], [
            additionalUri,
            quorumPercentage,
            validationBomb,
            blockLength,
            hardCapPercentage
        ]),
        true)
}

export async function proposeTransfer({ context, ipfsHttpClient }, element, additionalMetadata, list) {
    var additionalUri = await uploadMetadata({context, ipfsHttpClient}, additionalMetadata)

    var types = [
        "address",
        "uint256[]",
        "uint256[]",
        "address",
        "bool",
        "bool",
        "bool",
        "bytes"
    ];

    var values = list.map(it => {
        var val = [
            (it.token.mainInterface && it.token.mainInterface.options.address) || it.token.address,
            [],
            [it.value],
            it.address,
            false,
            false,
            false,
            "0x"
        ]

        if(it.token.mainInterface) {
            val[1].push(it.token.id)
        }

        return val
    })

    await propose({}, element.organization, 3, abi.encode(["string", "address", `tuple(${types.join(',')})[]`], [additionalUri, element.delegationsManager.treasuryManagerAddress, values]))
}

export async function proposeVote({ context, ipfsHttpClient }, element, additionalMetadata, data) {
    var additionalUri = await uploadMetadata({context, ipfsHttpClient}, additionalMetadata)

    var payload = abi.encode(["uint256", "uint256", "uint256", "bool", "bool", "string"], [data.objectId, data.accept ? data.value : '0', data.accept ? '0' : data.value, data.vote, data.afterTermination, additionalUri])
    payload = abi.encode(["address", "bytes32", "address", "bytes"], [data.proposalsManagerAddress, data.proposalId, data.collectionAddress, payload])

    await propose({}, element.organization, 4, payload)
}

async function propose({ }, element, modelIndex, bytecode, alsoTerminate) {
    var codes = [{
        codes : [{
            location : abi.decode(["address"], abi.encode(["uint256"], [modelIndex]))[0],
            bytecode,
        }],
        alsoTerminate : alsoTerminate === true
    }]
    var args = [
        element.components.proposalsManager.contract.methods.batchCreate,
        codes
    ]
    alsoTerminate === true && args.push({
        gasLimit: "6000000"
    })
    await blockchainCall.apply(window, args)
}

export async function retrieveDelegationProposals({ context, web3, account, chainId, getGlobalContract, newContract }, organization) {
    var delegationManagers = await getDelegationsManagers({ context, web3, account, chainId, getGlobalContract, newContract }, organization.address)

    var proposals = await Promise.all(delegationManagers.map(async it => {
        var supportedTokenData = await blockchainCall(it.delegationsManager.methods.supportedToken)
        var proposal = {
            ...it.organization,
            ...organization.proposalModels[organization.proposalModels.length - 1],
            delegationsManager : {
                ...it,
                supportedTokenData,
                supportedToken : await loadToken({context, chainId, web3, account, newContract, getGlobalContract}, supportedTokenData[0], supportedTokenData[1])
            },
            key : 'prop_' + it.delegationsManagerAddress,
            type : 'survey',
            organization,
            proposalsManager: organization.components.proposalsManager.contract,
            isPreset : false,
            proposalIds : [],
            isSurveyless : false,
            subProposals : []
        }
        return proposal
    }))

    proposals.push({
        name : 'Host Updates',
        key : 'prop_HOST',
        type : 'survey',
        organization,
        proposalsManager: organization.components.proposalsManager.contract,
        isPreset : false,
        proposalIds : [],
        isSurveyless : false,
        subProposals : [],
        unique : true,
        className : 'GovCardS'
    })

    return proposals
}

export async function refreshWrappedToken({ context, web3, account, chainId, getGlobalContract, newContract }, element) {
    if(!element.delegationsManager.wrappedTokenData) {
        var wrappedTokenData = await blockchainCall(element.organization.components.delegationTokensManager.contract.methods.wrapped, element.delegationsManager.supportedTokenData[0], element.delegationsManager.supportedTokenData[1], element.delegationsManager.delegationsManagerAddress)
        wrappedTokenData[1] !== '0' && (element.delegationsManager.wrappedTokenData = wrappedTokenData)
        wrappedTokenData[1] !== '0' && (element.delegationsManager.wrappedToken = await loadToken({context, chainId, web3, account, newContract, getGlobalContract}, wrappedTokenData[0], wrappedTokenData[1]))
    }
    return element
}

export async function refreshProposals({ context, web3, account, chainId, getGlobalContract, newContract }, element) {

    var args = {
        address : element.organization.address,
        fromBlock : '0x0',
        toBlock : 'latest',
        topics : [
            web3Utils.sha3('Proposed(uint256,uint256,bytes32)'),
            element.delegationsManager ? [
                abi.encode(["uint256"], [3]),
                abi.encode(["uint256"], [4])
            ] : [
                abi.encode(["uint256"], [0]),
                abi.encode(["uint256"], [1]),
                abi.encode(["uint256"], [2])
            ]
        ]
    }

    var logs = await sendAsync(web3.currentProvider, 'eth_getLogs', args)

    var proposalsInfo = logs.map(it => ({
        id : it.topics[3],
        model : abi.decode(["uint256"], it.topics[1])[0].toString()
    }))

    var proposals = await blockchainCall(element.organization.components.proposalsManager.contract.methods.list, proposalsInfo.map(it => it.id))

    proposals = await Promise.all(proposals.map(async (proposalData, i) => {
        var proposalInfo = proposalsInfo[i]
        var proposalId = proposalInfo.id
        var modelIndex = proposalInfo.model
        var isOfThisOrganization = await proposalResolvers[modelIndex]({ web3, context, chainId, newContract, provider : web3.currentProvider, element, account, getGlobalContract }, proposalId, proposalData, element.delegationsManager)
        if(!isOfThisOrganization) {
            return
        }

        var proposal = {
            ...proposalData,
            ...(await getMetadataByCodeSequence({ provider : web3.currentProvider, context}, proposalData.codeSequence)),
            ...isOfThisOrganization,
            id : proposalId,
            proposalId,
            modelIndex,
            proposalData,
            sourceElement : element,
            organization : element.organization,
            proposalsManager : element.proposalsManager,
            delegationsManager : element.delegationsManager
        }
        var votingTokens = abi.decode(["address[]","uint256[]", "uint256[]"], proposalData.votingTokens)
        votingTokens = await Promise.all(votingTokens[0].map((_, i) => decodeProposalVotingToken({ account, web3, context, newContract }, "0", votingTokens[0][i], votingTokens[1][i].toString(), votingTokens[2][i].toString())))
        proposal.proposalsConfiguration = {
            ...element.proposalsConfiguration,
            votingTokens
        }
        return proposal
    }))

    proposals = proposals.filter(it => it)

    element.subProposals = proposals
    element.proposalIds = proposals.map(it => it.proposalId)

    return element
}

async function getMetadataByCodeSequence({ provider, context }, codeSequence, labelName) {
    if(codeSequence instanceof Array) {
        return (await Promise.all(codeSequence.map(it => getMetadataByCodeSequence({ provider, context }, it)))).reduce((acc, it) => ({...acc, ...it}), {})
    }

    if(!labelName) {
        return (await Promise.all(["uri", "additionalUri"].map(it => getMetadataByCodeSequence({ provider, context }, codeSequence, it)))).reduce((acc, it) => ({...acc, ...it}), {})
    }

    try {
        var item = await getRawField({ provider }, codeSequence, labelName)
        item = abi.decode(["string"], item)[0]
        item = formatLink({ context }, item)
        item = await (await fetch(item)).json()
        return item
    } catch(e) {
        return {}
    }
}

const proposalResolvers = {
    "0" : async function({ context, chainId, provider, newContract }, proposalId, proposalData, delegationsManager) {

        var address = await getRawField({ provider }, proposalData.codeSequence[0], 'delegationsManagerAddress')
        address = abi.decode(["address"], address)[0].toString()

        var address = await getRawField({ provider }, address, 'host')
        address = abi.decode(["address"], address)[0].toString()

        var metadata = await getMetadataByCodeSequence({ provider, context }, address, "uri")

        var context = `Attached to: [${metadata.name}](${process.env.PUBLIC_URL}/#/guilds/dapp/organizations/${address})`

        //metadata.image && (description = `[![${metadata.name}](${formatLink({ context }, metadata.image)})](${metadata.external_url}) ${description}`)

        return {
            name : "Attached to Organization",
            context
        }
    },
    "1" : async function({ context, chainId, provider, newContract, element }, proposalId, proposalData, delegationsManager) {

        var uri = await getRawField({ provider }, proposalData.codeSequence[0], 'value')
        uri = abi.decode(["string"], uri)[0].toString()
        uri = formatLink({ context }, uri)

        var oldUri = await blockchainCall(element.organization.contract.methods.uri, { blockNumber : parseInt(proposalData.creationBlock) - 1 })
        oldUri = formatLink({ context }, oldUri)

        var context = `From: [${oldUri}](${oldUri}) To: [${uri}](${uri})`

        return {
            name : "Metadata Changed",
            context
        }
    },
    "2" : async function({ context, chainId, provider, newContract, element }, proposalId, proposalData, delegationsManager) {

        var newData = await Promise.all([
            getRawField({ provider }, proposalData.codeSequence[0], 'quorum'),
            getRawField({ provider }, proposalData.codeSequence[0], 'validationBomb'),
            getRawField({ provider }, proposalData.codeSequence[0], 'blockLength'),
            getRawField({ provider }, proposalData.codeSequence[0], 'hardCap')
        ])
        newData = {
            quorum : fromDecimals(abi.decode(["uint256"], newData[0])[0].toString(), 18, true),
            validationBomb : abi.decode(["uint256"], newData[1])[0].toString(),
            blockLength : abi.decode(["uint256"], newData[2])[0].toString(),
            hardCap : fromDecimals(abi.decode(["uint256"], newData[3])[0].toString(), 18, true)
        }

        var newDataDescription = "To:"
        newData.quorum > 0 && (newDataDescription += `\n- Quorum: ${newData.quorum}%`)
        newData.validationBomb > 0 && (newDataDescription += `\n- Validation Bomb: ${newData.validationBomb} blocks`)
        newData.blockLength > 0 && (newDataDescription += `\n- Length: ${newData.blockLength} blocks`)
        newData.hardCap > 0 && (newDataDescription += `\n- Max Cap: ${newData.hardCap}%`)

        var proposalModels = element.organization.proposalModels
        proposalModels = await blockchainCall(element.organization.contract.methods.proposalModels, {blockNumber : parseInt(proposalData.creationBlock) - 1})
        var model = proposalModels[proposalModels.length - 1]
        var fromData = "From:" + (await Promise.all([
            extractRules({context, provider : element.organization.components.proposalsManager.contract.currentProvider}, model.validatorsAddresses[0], "validation", proposalData),
            extractRules({context, provider : element.organization.components.proposalsManager.contract.currentProvider}, model.canTerminateAddresses[0], "termination", proposalData)
        ])).reduce((acc, it) => [...acc, ...it], []).map(it => `\n- ${it.text}: ${it.value}`).join('')

        return {
            name : "Governance Rules changed",
            context : fromData + '\n' + newDataDescription
        }
    },
    "3" : async function({ web3, context, chainId, provider, newContract, account, getGlobalContract }, proposalId, proposalData, delegationsManager) {
        var treasuryManagerAddress = await getRawField({ provider }, proposalData.codeSequence[0], 'treasuryManagerAddress')
        treasuryManagerAddress = abi.decode(["address"], treasuryManagerAddress)[0]
        if(delegationsManager.treasuryManagerAddress !== treasuryManagerAddress) {
            return
        }

        var entries = await getRawField({ provider }, proposalData.codeSequence[0], 'allEntries')

        var types = [
            "address",
            "uint256[]",
            "uint256[]",
            "address",
            "bool",
            "bool",
            "bool",
            "bytes"
        ]
        entries = abi.decode([`tuple(${types.join(',')})[]`], entries)[0]

        entries = await Promise.all(entries.map(async it => ({ ...it, token : it[1].length === 0 ? await loadTokenFromAddress({context, account, web3, newContract}, it[0]) : await loadItem({ context, chainId, account, newContract, getGlobalContract}, it[1][0].toString())})))

        return {
            name : `Transfer assets within the Grant Treasury Manager`,
            context : entries.map(it => `- ${fromDecimals(it[2][0], it.token.decimals, true)} ${it.token.symbol} to [${it[3]}](${getNetworkElement({context, chainId}, "etherscanURL")}tokenholdings?a=${it[3]})`).join('\n')
        }
    },
    "4" : async function({ context, newContract, provider, chainId }, proposalId, proposalData, delegationsManager) {
        var proposalsManagerAddress = await getRawField({ provider }, proposalData.codeSequence[0], 'proposalsManagerAddress')
        proposalsManagerAddress = abi.decode(["address"], proposalsManagerAddress)[0]
        var host = await getRawField({ provider }, proposalsManagerAddress, 'host')
        host = abi.decode(["address"], host)[0]
        var subDAO = newContract(context.ISubDAOABI, host)
        var delegationsManagerAddress = await blockchainCall(subDAO.methods.get, "0x49b87f4ee20613c184485be8eadb46851dd4294a8359f902606085b8be6e7ae6")
        if(delegationsManager.delegationsManagerAddress !== delegationsManagerAddress) {
            return
        }
        var originalProposalData = await Promise.all([
            getRawField({ provider }, proposalData.codeSequence[0], 'organizationProposalID'),
            getRawField({ provider }, proposalData.codeSequence[0], 'collectionAddress'),
            getRawField({ provider }, proposalData.codeSequence[0], 'objectId'),
            getRawField({ provider }, proposalData.codeSequence[0], 'accept'),
            getRawField({ provider }, proposalData.codeSequence[0], 'refuse'),
            getRawField({ provider }, proposalData.codeSequence[0], 'vote'),
            getRawField({ provider }, proposalData.codeSequence[0], 'afterTermination')
        ])
        originalProposalData = {
            proposalsManagerAddress,
            proposalsManager : newContract(context.ProposalsManagerABI, proposalsManagerAddress),
            organizationProposalID : abi.decode(["bytes32"], originalProposalData[0])[0].toString(),
            collectionAddress : abi.decode(["address"], originalProposalData[1])[0].toString(),
            objectId : abi.decode(["uint256"], originalProposalData[2])[0].toString(),
            accept : abi.decode(["uint256"], originalProposalData[3])[0].toString(),
            refuse : abi.decode(["uint256"], originalProposalData[4])[0].toString(),
            vote : abi.decode(["bool"], originalProposalData[5])[0],
            afterTermination : abi.decode(["bool"], originalProposalData[6])[0]
        }
        var proposalData = (await blockchainCall(originalProposalData.proposalsManager.methods.list, [originalProposalData.organizationProposalID]))[0]

        var metadata = await getMetadataByCodeSequence({ provider : originalProposalData.proposalsManager.currentProvider, context}, proposalData.codeSequence)
        var codeData = await getData({ provider : originalProposalData.proposalsManager.currentProvider}, proposalData.codeSequence[0])
        originalProposalData = {
            ...proposalData,
            ...metadata,
            ...originalProposalData,
            codeData
        }

        var votes = fromDecimals(originalProposalData.accept !== '0' ? originalProposalData.accept : originalProposalData.refuse, 18, true)
        var symbol = 'OS'

        var ctx = ''

        if(codeData.label === 'setUint256' || codeData.label === 'changeOSInflationRate') {
            if(!codeData.presetValue) {
                var presetValues = wellknownPresets[codeData.uri.split('ipfs://ipfs/').join('')].presetValues
                var cleanedValues = presetValues.map(it => toDecimals(it.split(' OS').join('').split('%').join(''), it.indexOf('OS') !== -1 ? 18 : 16))
                var presetValue = presetValues[cleanedValues.indexOf(codeData.valueUint256)]
                codeData.presetValue = presetValue
            }
            ctx = `${originalProposalData.vote ? "Stake" : "Unstake"} ${votes} ${symbol} in "[${metadata.name}](${getNetworkElement({ context, chainId }, "etherscanURL")}address/${proposalData.codeSequence[0]})" selecting ${codeData.presetValue}`
        } else {
            ctx = `${originalProposalData.vote ? "Stake" : "Unstake"} ${votes} ${symbol} ${originalProposalData.accept !== '0' ? "in favor of" : "against"} "[${metadata.name}](${getNetworkElement({ context, chainId }, "etherscanURL")}address/${proposalData.codeSequence[0]})"`
        }

        return {
            name : originalProposalData.vote ? "Vote Proposal" : "Retire Proposal",
            originalProposalData,
            context : ctx
        }
    }
}

export async function tryRetrieveDelegationAddressFromItem({ context, chainId }, item) {
    if(item.delegation) {
        return item.delegation
    }
    var args = {
        topics : [
            web3Utils.sha3('Wrapped(address,uint256,address,uint256)'),
            [],
            abi.encode(["uint256"], [item.id])
        ],
        fromBlock : '0x0',
        toBlock : 'latest'
    }
    var logs = await sendAsync(item.mainInterface.currentProvider, "eth_getLogs", args)
    if(logs.length !== 1) {
        return
    }
    var delegationTokensManagerAddress = logs[0].address
    var host = await getRawField({ provider : item.mainInterface.currentProvider}, delegationTokensManagerAddress, 'host')
    host = abi.decode(["address"], host)[0].toString()

    var initializer = await getRawField({ provider : item.mainInterface.currentProvider}, host, 'initializer')
    initializer = abi.decode(["address"], initializer)[0].toString()

    initializer = await getRawField({ provider : item.mainInterface.currentProvider}, initializer, 'initializer')
    initializer = abi.decode(["address"], initializer)[0].toString()

    if(web3Utils.toChecksumAddress(initializer) !== web3Utils.toChecksumAddress(getNetworkElement({ context, chainId }, "factoryOfFactoriesAddress"))) {
        return
    }

    try {
        var uri = await getRawField({ provider : item.mainInterface.currentProvider}, host, 'uri')
        uri = abi.decode(["string"], uri)[0].toString()
        uri = formatLink({ context }, uri)
        var metadata = await(await fetch(uri)).json()
        return { ...metadata, address : host }
    } catch(e) {
    }
}