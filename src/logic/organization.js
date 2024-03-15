import {
  getLogs,
  abi,
  VOID_ETHEREUM_ADDRESS,
  uploadMetadata,
  formatLink,
  fromDecimals,
  getNetworkElement,
  blockchainCall,
  web3Utils,
  sendAsync,
  tryRetrieveMetadata,
  VOID_BYTES32,
  numberToString,
} from 'interfaces-core'

import { encodeHeader, loadItem } from './itemsV2'

import {
  decodeProposal,
  decodeProposalVotingToken,
  extractProposalVotingTokens,
  generateItemKey,
} from './ballot'
import { retrieveDelegationProposals } from './delegation'
import { getData, getRawField } from './generalReader'
import { getTokenBasicInfo, loadTokenFromAddress } from './erc20'
import { cache } from 'interfaces-core'

export async function create(
  { context, ipfsHttpClient, newContract, chainId, factoryOfFactories },
  metadata,
  organization
) {
  var uri = await uploadMetadata({ context, ipfsHttpClient }, metadata)
  var header = {
    host: VOID_ETHEREUM_ADDRESS,
    name: metadata.name,
    symbol: metadata.symbol,
    uri,
  }
  var headerBytecode = encodeHeader(header)
  var mandatoryComponentsDeployData = ['0x', '0x', headerBytecode]

  var deployOrganizationDataType = [
    'string',
    'bytes',
    'bytes[]',
    'uint256[]',
    'bytes[]',
    'bytes',
  ]

  var deployOrganizationDataValue = [
    uri,
    '0x',
    mandatoryComponentsDeployData,
    [],
    [],
    organization ? abi.encode(['address'], [organization]) : '0x',
  ]

  var deployOrganizationData = abi.encode(
    [`tuple(${deployOrganizationDataType.join(',')})`],
    [deployOrganizationDataValue]
  )

  var factoryData = await blockchainCall(
    factoryOfFactories.methods.get,
    getNetworkElement({ context, chainId }, 'organizationsFactoryPosition')
  )

  var factoryAddress =
    factoryData.factoryList[factoryData.factoryList.length - 1]
  var factory = newContract(context.IFactoryABI, factoryAddress)

  await blockchainCall(factory.methods.deploy, deployOrganizationData)
}

export async function all({
  context,
  newContract,
  chainId,
  factoryOfFactories,
}) {
  var factoryIndices = getNetworkElement({ context, chainId }, 'factoryIndices')
  factoryIndices = [factoryIndices?.subdao, factoryIndices?.organization]
  factoryIndices = factoryIndices.filter((it) => it)
  if (factoryIndices.length === 0) {
    return []
  }
  var address = (
    await Promise.all(
      factoryIndices.map(
        async (factoryIndex) =>
          (
            await blockchainCall(factoryOfFactories.methods.get, factoryIndex)
          ).factoryList
      )
    )
  ).reduce((acc, it) => [...acc, ...it], [])
  var args = {
    address,
    topics: [web3Utils.sha3('Deployed(address,address,address,bytes)')],
    fromBlock:
      web3Utils.toHex(
        chainId === 10
          ? '109904523'
          : getNetworkElement({ context, chainId }, 'deploySearchStart')
      ) || '0x0',
    toBlock: 'latest',
  }
  var logs = await getLogs(factoryOfFactories.currentProvider, args)
  var organizations = logs.map((it) =>
    web3Utils.toChecksumAddress(abi.decode(['address'], it.topics[2])[0])
  )
  try {
    var excluded = context.organizationsToExclucde.map(
      web3Utils.toChecksumAddress
    )
    organizations = organizations.filter((it) => excluded.indexOf(it) === -1)
  } catch (e) {}
  organizations = (
    await Promise.all(
      organizations.map((it) => hasNoHost({ context, newContract }, it))
    )
  ).filter((it) => it)

  try {
    args.address = (
      await blockchainCall(
        factoryOfFactories.methods.get,
        getNetworkElement({ context, chainId }, 'factoryIndices').dfo
      )
    ).factoryList
    logs = await getLogs(factoryOfFactories.currentProvider, args)
    organizations = [
      ...organizations,
      ...logs.map((it) => abi.decode(['address'], it.topics[2])[0]),
    ]
  } catch (e) {}

  return organizations //await Promise.all(organizations.map(it => (getOrganizationMetadata({ context }, { contract: newContract(context.SubDAOABI, it), address: it, type: 'organizations' }, true))))
}

export async function hasNoHost({ context, newContract }, organizationAddress) {
  var contract = newContract(context.SubDAOABI, organizationAddress)
  var hostAddress = await blockchainCall(contract.methods.host)
  if (hostAddress && hostAddress !== VOID_ETHEREUM_ADDRESS) {
    try {
      if (
        await blockchainCall(
          newContract(context.SubDAOsManagerABI, hostAddress).methods.exists,
          organizationAddress
        )
      ) {
        return
      }
    } catch (e) {}
  }
  return organizationAddress
}

export async function tryExtractHost(
  { chainId, context, web3, account, getGlobalContract, newContract },
  contract
) {
  var hostAddress = await blockchainCall(contract.methods.host)
  var host
  if (hostAddress && hostAddress !== VOID_ETHEREUM_ADDRESS) {
    try {
      var subDAOsManager = newContract(context.SubDAOsManagerABI, hostAddress)
      hostAddress = await blockchainCall(subDAOsManager.methods.host)
      host = await getOrganization(
        { chainId, context, web3, account, getGlobalContract, newContract },
        hostAddress
      )
    } catch (e) {}
  }
  return {
    address: host ? host.address : hostAddress,
    ...host,
  }
}

export async function getOrganizationMetadata(
  { context },
  organization,
  merge
) {
  if (organization.uri) {
    return {}
  }
  try {
    organization.uri = await getManipulatedUri(organization)
    organization.formattedUri = formatLink({ context }, organization.uri)
    var metadataCached = JSON.parse(
      await cache.getItem(organization.formattedUri)
    )
    var metadata =
      metadataCached || (await (await fetch(organization.formattedUri)).json())
    if (
      web3Utils.toChecksumAddress(organization.address) ===
      web3Utils.toChecksumAddress('0xc28FfD843DCA86565597A1b82265df29A1642262')
    ) {
      metadata.image =
        'ipfs://ipfs/QmVBvcb4W5AMFHAu2GNsa4uAn6VhV9NGNV3PLLyJbwNmn7'
    }
    if (!metadataCached) {
      await cache.setItem(organization.formattedUri, JSON.stringify(metadata))
    }
    return merge ? { ...organization, ...metadata } : metadata
  } catch (e) {}
  return merge ? organization : {}
}

async function getManipulatedUri(organization) {
  if (
    web3Utils.toChecksumAddress(organization.address) ===
    web3Utils.toChecksumAddress('0xc28FfD843DCA86565597A1b82265df29A1642262')
  ) {
    //return 'ipfs://ipfs/QmZjF5qbS4RCMDpioC3nSQtJm4fEiKqLz4MZGrTZF9BGCQ'
  }
  return await blockchainCall(organization.contract.methods.uri)
}

export async function getInitializationData(
  { newContract, context, chainId },
  contract
) {
  var initializerAddress = await blockchainCall(contract.methods.initializer)

  var factory = newContract(context.SubDAOFactoryABI, initializerAddress)

  var args = {
    address: initializerAddress,
    fromBlock:
      web3Utils.toHex(
        getNetworkElement({ context, chainId }, 'deploySearchStart')
      ) || '0x0',
    toBlock: 'latest',
    topics: [
      web3Utils.sha3('Deployed(address,address,address,bytes)'),
      [],
      [abi.encode(['address'], [contract.options.address])],
    ],
  }

  var logs = await getLogs(contract.currentProvider, args)

  var creationBlock = logs[0]?.blockNumber || '0'
  var version = '0'

  /*    var fofAddress = await blockchainCall(factory.methods.initializer)
    var fof = newContract(context.FactoryOfFactoriesABI, fofAddress)

    var partialList = await blockchainCall(fof.methods.partialList, 0, 15)

    partialList = partialList[1]

    for(var list of partialList) {
        for(var i in list) {
            if(list[i] === initializerAddress) {
                version = i;
                break;
            }
            if(version != undefined && version != null) {
                break;
            }
        }
    }*/

  return {
    creationBlock,
    version,
    initializerAddress,
  }
}

export async function getOrganization(web3Data, organizationAddress, host) {
  var { chainId, context, web3, account, getGlobalContract, newContract } =
    web3Data
  var contract = newContract(context.SubDAOABI, organizationAddress)
  var organization = {
    address: organizationAddress,
    contract,
    ...(await getInitializationData(
      { chainId, newContract, context },
      contract
    )),
  }

  var hostData = host
    ? host
    : await tryExtractHost(
        { chainId, context, web3, account, getGlobalContract, newContract },
        contract
      )

  if (!host && hostData.contract) {
    return hostData
  }

  organization = {
    ...organization,
    old:
      [
        '0xc28FfD843DCA86565597A1b82265df29A1642262',
        '0x0227aD4E1D28fcae2d91397896Ed0eF26fcEc4c0',
      ]
        .map(web3Utils.toChecksumAddress)
        .indexOf(web3Utils.toChecksumAddress(organization.address)) !== -1,
    host,
    //...(await getOrganizationMetadata(web3Data, organization)),
    components: await getOrganizationComponents(
      { chainId, newContract, context },
      contract
    ),
  }
  //organization.stateVars = await getStateVars({ context }, organization)
  organization.proposalModels = await getProposalModels({ context }, contract)
  organization.type =
    organization.proposalModels.length === 0 ? 'root' : 'organization'
  organization.proposalsConfiguration = await getProposalsConfiguration(
    { chainId, context, web3, account, getGlobalContract, newContract },
    organization.components.proposalsManager
  )

  try {
    organization.votingToken = await loadTokenFromAddress(
      web3Data,
      abi.decode(
        ['address'],
        abi.encode(
          ['uint256'],
          [organization.proposalsConfiguration.objectIds[0]]
        )
      )[0]
    )
  } catch (e) {}

  organization.organizations = await getAllOrganizations(
    { chainId, context, web3, account, getGlobalContract, newContract },
    organization
  )

  //organization.proposals = await getProposals({ account, web3, context, newContract }, organization)

  organization.allProposals = organization.proposals || []
  try {
    organization.organizations.forEach((it) =>
      organization.allProposals.push(...it.allProposals)
    )
  } catch (e) {}

  console.log(
    'Delegations Managers',
    organization.address,
    organization.host?.address,
    organization.components.delegationsManager?.address
  )

  return organization
}

export async function retrieveAllProposals(web3Data, organization) {
  const { context, web3, account, chainId, getGlobalContract, newContract } =
    web3Data
  if (organization.type === 'delegation') {
    return await retrieveDelegationProposals(
      { context, web3, account, chainId, getGlobalContract, newContract },
      organization
    )
  }
  if (!organization.proposalModels) {
    organization = await getOrganization(
      { account, web3, context, newContract },
      organization.address,
      organization
    )
  }
  var proposals = await getProposals(
    { web3, account, context, newContract },
    organization
  )
  await Promise.all(
    (organization.organizations || []).map(async (org) =>
      proposals.push(...(await getProposals({ context, newContract }, org)))
    )
  )
  proposals = organization.old
    ? proposals
    : await Promise.all(
        proposals.map(async (it) => {
          var elem = { ...it }
          if (elem.label === 'TOKEN_SELL_V1') {
            elem.name = 'Investment Fund Routine Sell'
          }
          if (elem.label === 'TOKEN_BUY_V1') {
            elem.name = 'Investment Fund Routine Buy'
          }
          if (elem.label === 'TRANSFER_MANAGER_V1') {
            elem.name = 'Transfer assets within the Treasury Manager'
          }
          if (proposalResolvers[elem.modelIndex]) {
            elem.subProposals &&
              (elem.subProposals = await Promise.all(
                elem.subProposals.map(async (it) => ({
                  ...it,
                  ...(await proposalResolvers[elem.modelIndex](web3Data, it)),
                }))
              ))
            !elem.subProposals &&
              (elem = {
                ...elem,
                ...(await proposalResolvers[elem.modelIndex](web3Data, elem)),
              })
          }
          return elem
        })
      )
  return proposals
}

const proposalResolvers = {
  0: async function (web3Data, proposalData) {
    const {
      web3,
      context,
      chainId,
      provider,
      newContract,
      account,
      getGlobalContract,
    } = web3Data
    var entries = await getRawField(
      { provider: provider || web3.currentProvider },
      proposalData.codeSequence[0],
      'allEntries'
    )

    if (entries === '0x') {
      entries = await getRawField(
        { provider: provider || web3.currentProvider },
        proposalData.codeSequence[0],
        'entries'
      )
    }

    var types = [
      'address',
      'uint256[]',
      'uint256[]',
      'address',
      'bool',
      'bool',
      'bool',
      'bytes',
    ]
    entries = abi.decode([`tuple(${types.join(',')})[]`], entries)[0]

    entries = await Promise.all(
      entries.map(async (it) => ({
        ...it,
        token:
          it[1].length === 0
            ? await loadTokenFromAddress(
                { context, account, web3, newContract },
                it[0]
              )
            : await loadItem(
                { context, chainId, account, newContract, getGlobalContract },
                it[1][0].toString()
              ),
      }))
    )

    return {
      name: 'Transfer assets within the Treasury Manager',
      context: entries
        .map(
          (it) =>
            `- ${fromDecimals(it[2][0], it.token.decimals, true)} ${
              it.token.symbol
            } to [${it[3]}](${getNetworkElement(
              { context, chainId },
              'etherscanURL'
            )}tokenholdings?a=${it[3]})`
        )
        .join('\n'),
    }
  },
}

export async function getOrganizationComponents(
  { newContract, context },
  contract
) {
  var componentsKey = {
    [context.grimoire.COMPONENT_KEY_TREASURY_MANAGER]: 'TreasuryManager',
    [context.grimoire.COMPONENT_KEY_MICROSERVICES_MANAGER]:
      'MicroservicesManager',
    [context.grimoire.COMPONENT_KEY_PROPOSALS_MANAGER]: 'ProposalsManager',
    [context.grimoire.COMPONENT_KEY_STATE_MANAGER]: 'StateManager',
    [context.grimoire.COMPONENT_KEY_INVESTMENTS_MANAGER]: 'InvestmentsManager',
    [context.grimoire.COMPONENT_KEY_TREASURY_SPLITTER_MANAGER]:
      'TreasurySplitterManager',
    [context.grimoire.COMPONENT_KEY_SUBDAOS_MANAGER]: 'SubDAOsManager',
    [context.grimoire.COMPONENT_KEY_DELEGATIONS_MANAGER]: 'DelegationsManager',
    [context.grimoire.COMPONENT_KEY_TOKENS_MANAGER]: 'DelegationTokensManager',
    [context.grimoire.COMPONENT_KEY_OS_FARMING]: 'OSFarming',
    [context.grimoire.COMPONENT_KEY_DIVIDENDS_FARMING]: 'DividendsFarming',
    [context.grimoire.COMPONENT_KEY_TOKEN_MINTER_AUTH]:
      'OSFixedInflationManager',
    [context.grimoire.COMPONENT_KEY_TOKEN_MINTER]: 'OSMinter',
    [context.grimoire.COMPONENT_KEY_FIXED_INFLATION_MANAGER]:
      'IFixedInflationManager',
  }

  var componentsAddress = await blockchainCall(
    contract.methods.list,
    Object.keys(componentsKey)
  )

  var number = 0

  return Object.keys(componentsKey).reduce((acc, key, i) => {
    var item
    var addr = componentsAddress[i]
    var componentName = componentsKey[key]
    if (addr != VOID_ETHEREUM_ADDRESS) {
      console.log(contract.options.address, componentName, addr, number++)
      item = {
        address: addr,
        key,
        name:
          Object.values(context.componentNames).filter((it) => it === key)[0] ||
          'unknown (' + key + ')',
        contract: newContract(context[componentName + 'ABI'], addr),
      }
    }
    var newObject = { ...acc }
    var label = componentName
      .split('IFixedInflationManager')
      .join('FixedInflationManager')
    item && (newObject[label[0].toLowerCase() + label.substring(1)] = item)
    return newObject
  }, {})
}

async function retrieveProposalModels(contract) {
  contract = contract.contract || contract
  var result = []
  try {
    var SubDAOProposalModel = {
      source: 'address',
      uri: 'string',
      isPreset: 'bool',
      presetValues: 'bytes[]',
      presetProposals: 'bytes32[]',
      creationRules: 'address',
      triggeringRules: 'address',
      votingRulesIndex: 'uint256',
      canTerminateAddresses: 'address[][]',
      validatorsAddresses: 'address[][]',
      creationData: 'bytes',
      triggeringData: 'bytes',
      canTerminateData: 'bytes[][]',
      validatorsData: 'bytes[][]',
    }
    result = await getRawField(
      { provider: contract.currentProvider },
      contract.options.address,
      'proposalModels'
    )
    result = abi.decode(
      [`tuple(${Object.values(SubDAOProposalModel)})[]`],
      result
    )[0]
    result = result.map((it) =>
      Object.keys(SubDAOProposalModel).reduce(
        (acc, key, i) => ({
          ...acc,
          [key]:
            SubDAOProposalModel[key] === 'uint256'
              ? it[i].toString()
              : SubDAOProposalModel[key] === 'uint256[]'
              ? [...it[i]].map((elem) => elem.toString())
              : it[i],
        }),
        {}
      )
    )
  } catch (e) {
    result = [...(await blockchainCall(contract.methods.proposalModels))]
  }
  result = await Promise.all(
    result.map(async (it) => ({
      ...it,
      ...(await getData({ provider: contract.currentProvider }, it.source)),
    }))
  )
  result = result.map((it) => ({ ...it, uri: it.uri || it[1] || it.uri }))
  return result
}

export async function retrieveProposals(proposalsManager, proposalIds) {
  proposalsManager = proposalsManager.contract || proposalsManager
  proposalIds = Array.isArray(proposalIds) ? proposalIds : [proposalIds]
  var result = []
  try {
    var Proposal = {
      proposer: 'address',
      codeSequence: 'address[]',
      creationBlock: 'uint256',
      creationTime: 'uint256',
      accept: 'uint256',
      refuse: 'uint256',
      triggeringRules: 'address',
      canTerminateAddresses: 'address[]',
      validatorsAddresses: 'address[]',
      validationPassed: 'bool',
      terminationBlock: 'uint256',
      votingTokens: 'bytes',
      triggeringData: 'bytes',
      canTerminateData: 'bytes[]',
      validatorsData: 'bytes[]',
    }
    result = await getRawField(
      { provider: proposalsManager.currentProvider },
      proposalsManager.options.address,
      'list(bytes32[])',
      proposalIds
    )
    result = abi.decode([`tuple(${Object.values(Proposal)})[]`], result)[0]
    result = result.map((it) =>
      Object.keys(Proposal).reduce(
        (acc, key, i) => ({
          ...acc,
          [key]:
            Proposal[key] === 'uint256'
              ? it[i].toString()
              : Proposal[key] === 'uint256[]'
              ? [...it[i]].map((elem) => elem.toString())
              : it[i],
        }),
        {}
      )
    )
  } catch (e) {
    result = [
      ...(await blockchainCall(proposalsManager.methods.list, proposalIds)),
    ]
  }
  result = result.map((it, i) => ({
    ...it,
    id: proposalIds[i],
    proposalId: proposalIds[i],
  }))
  return result
}

async function retrieveProposalConfiguration(proposalsManager) {
  proposalsManager = proposalsManager.contract || proposalsManager
  var result = []
  try {
    var ProposalConfiguration = {
      collections: 'address[]',
      objectIds: 'uint256[]',
      weights: 'uint256[]',
      creationRules: 'address',
      triggeringRules: 'address',
      canTerminateAddresses: 'address[]',
      validatorsAddresses: 'address[]',
      creationData: 'bytes',
      triggeringData: 'bytes',
      canTerminateData: 'bytes[]',
      validatorsData: 'bytes[]',
    }
    result = await getRawField(
      { provider: proposalsManager.currentProvider },
      proposalsManager.options.address,
      'configuration'
    )
    result = abi.decode(
      [`tuple(${Object.values(ProposalConfiguration)})`],
      result
    )[0]
    result = Object.keys(ProposalConfiguration).reduce(
      (acc, key, i) => ({
        ...acc,
        [key]:
          ProposalConfiguration[key] === 'uint256'
            ? result[i].toString()
            : ProposalConfiguration[key] === 'uint256[]'
            ? [...result[i]].map((elem) => elem.toString())
            : result[i],
      }),
      {}
    )
  } catch (e) {
    result = await blockchainCall(proposalsManager.methods.configuration)
  }
  return result
}

export async function getProposalModels({ context }, contract) {
  try {
    var proposalModels = await retrieveProposalModels(contract)
    proposalModels = proposalModels.map((it) => ({
      ...it,
      proposalType: it.preset ? 'surveyless' : 'normal',
    }))
    proposalModels = await Promise.all(
      proposalModels.map(async (it) => {
        var link = formatLink({ context }, it.uri)
        var metadata = {}
        try {
          //metadata = await (await fetch(link)).json()
        } catch (e) {}
        return { ...it, ...metadata }
      })
    )
    return proposalModels
  } catch (e) {}
  return []
}

async function getStateVars({ context }, organization) {
  try {
    var names = await blockchainCall(
      organization.components.stateManager.methods.all
    )
    var vars = names.map((it) => {
      var entryType = toEntryType({ context }, it.entryType)
      return {
        key: it.key,
        name: context.componentNames[it.key] || it.key,
        entryType,
        value: convertValue(entryType, it.value),
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
  var name = Object.entries(context.componentNames).filter(
    (it) => it[1] === key
  )[0]
  if (name) {
    name = name[0]
    name = name.split('ENTRY_TYPE_')
    name = name[name.length - 1]
    var dictionary = {
      ADDRESS: {
        name: 'address',
        type: 'address',
      },
      ADDRESS_LIST: {
        name: 'array of address',
        type: 'address[]',
      },
      UINT256: {
        name: 'number',
        type: 'uint256',
      },
      UINT256_ARRAY: {
        name: 'array of numbers',
        type: 'uint256[]',
      },
    }
    var val = dictionary[name]
    if (val) {
      return { ...val, key }
    }
  }

  return {
    key,
    name: 'unknown',
    type: 'unknown',
  }
}

export async function allProposals(
  { account, web3, context, newContract, chainId },
  proposalsManager
) {
  var topics = [web3Utils.sha3('ProposalCreated(address,address,bytes32)')]

  var logs = await getLogs(proposalsManager.currentProvider, {
    address: proposalsManager.options.address,
    topics,
    fromBlock:
      web3Utils.toHex(
        getNetworkElement({ context, chainId }, 'deploySearchStart')
      ) || '0x0',
    toBlock: 'latest',
  })

  var proposalIds = {}
  logs.forEach((it) => {
    var proposalId = it.topics[3]
    proposalIds[proposalId] = true
  })
  proposalIds = Object.values(proposalIds)
  var proposals = await retrieveProposals(proposalsManager, proposalIds)
  var currentBlock = await sendAsync(
    proposalsManager.currentProvider,
    'eth_getBlockByNumber',
    'latest',
    false
  )
  proposals = await Promise.all(
    proposals.map((prop, i) =>
      decodeProposal({ account, web3, context, newContract }, prop)
    )
  )
  return proposals
}

async function getProposalsConfiguration(
  { account, web3, context, newContract },
  proposalsManager
) {
  var configuration = await retrieveProposalConfiguration(proposalsManager)
  var collectionAddresses = configuration.collections
  var objectIds = configuration.objectIds
  var weights = configuration.weights
  var votingTokens = await Promise.all(
    objectIds.map((_, i) =>
      decodeProposalVotingToken(
        { account, web3, context, newContract },
        '0',
        collectionAddresses[i],
        objectIds[i],
        weights[i]
      )
    )
  )
  return { ...configuration, votingTokens }
}

async function getAllOrganizations(
  { account, web3, context, newContract, chainId },
  organization
) {
  try {
    var args = {
      address: organization.components.subDAOsManager.address,
      topics: [web3Utils.sha3('SubDAOSet(bytes32,address,address)')],
      fromBlock:
        web3Utils.toHex(
          getNetworkElement({ context, chainId }, 'deploySearchStart')
        ) || '0x0',
      toBlock: 'latest',
    }

    var keys = {}
    var logs = await getLogs(organization.contract.currentProvider, args)
    logs.forEach((it) => (keys[it.topics[1]] = true))
    var organizations = await blockchainCall(
      organization.components.subDAOsManager.contract.methods.list,
      Object.keys(keys)
    )
    organizations = Object.keys(keys).reduce((acc, it, i) => {
      var x = { ...acc }
      organizations[i] !== VOID_ETHEREUM_ADDRESS && (x[it] = organizations[i])
      return x
    }, {})
    return await Promise.all(
      Object.entries(organizations).map(async (it) => ({
        key: it[0],
        ...(await getOrganization(
          { account, web3, context, newContract },
          it[1],
          organization
        )),
      }))
    )
  } catch (e) {}
  return []
}

async function getSurveylessProposals({ context }, organization) {
  if (!organization || organization.proposalModels.length === 0) {
    return []
  }
  organization.proposalModels = await retrieveProposalModels(
    organization.contract
  )
  organization.proposalModels.forEach((it, i) => (it.modelIndex = i))
  var surveyless = organization.proposalModels.filter((it) => it.isPreset)
  var metadatas = await Promise.all(
    surveyless.map(async (it) => {
      var metadata = {}
      try {
        metadata =
          it.uri.toLowerCase().indexOf('ipfs') === -1
            ? {}
            : {
                ...(await (
                  await fetch(formatLink({ context }, it.uri))
                ).json()),
                uri: it.uri,
              }
      } catch (e) {}
      try {
        metadata = {
          ...metadata,
          ...wellknownPresets[metadata.uri.split('ipfs://ipfs/').join('')],
        }
      } catch (e) {}
      try {
        if (!metadata.presetValues) {
          var decimals =
            it.label.indexOf('FIXED') === 0
              ? 16
              : organization.votingToken.decimals
          var postfix =
            it.label.indexOf('FIXED') === 0
              ? '%'
              : organization.votingToken.symbol
          metadata.presetValues = it.presetValues.map((val) =>
            abi.decode(['uint256'], val)[0].toString()
          )
          metadata.presetValues = metadata.presetValues.map(
            (val) => `${fromDecimals(val, decimals)} ${postfix}`
          )
        }
      } catch (e) {}
      return metadata
    })
  )

  var surveylessProposals = surveyless.map((it, i) => {
    var initialized =
      it.presetProposals.filter((it) => it === VOID_BYTES32).length === 0
    var subProposals = it.presetValues.map((_, index) => ({
      key: 'prop_' + it.modelIndex + '_' + organization.address + '_' + index,
      ...it,
      organization,
      proposalsManager: organization.components.proposalsManager.contract,
      initialized,
      isSurveyless: true,
      ...metadatas[i],
      proposalId: it.presetProposals[index],
      label: metadatas[i].presetValues && metadatas[i].presetValues[index],
      proposalsConfiguration: organization.proposalsConfiguration,
    }))
    return {
      key: 'prop_' + it.modelIndex + '_' + organization.address,
      ...it,
      ...metadatas[i],
      organization,
      proposalsManager: organization.components.proposalsManager.contract,
      initialized,
      isSurveyless: true,
      subProposals,
      proposalsConfiguration: organization.proposalsConfiguration,
    }
  })

  return surveylessProposals
}

var percentages = {
  presetValues: ['0.03 %', '0.08 %', '0.3 %', '0.8 %', '1 %', '3 %'],
}

export var wellknownPresets = {
  QmPkZjrGUpNSP19oWhdRfoy9YdP7fL9AJtzmgiFR2sekyT: {
    presetValues: ['0.5 %', '1 %', '3 %', '5 %', '8 %', '15 %'],
  },
  QmSBSi8STApCH3LtRALMQSA6v7iMka9UYFewY8N4jB9dSN: percentages,
  Qmee1ibJCtnhu7ChpcsKyXum9KikptJtQrAxeCLer55Aj5: percentages,
  QmR3S8cPGb4Tm9dr7sVx5meUPMsptV6vBbCCP96e2cZeAL: percentages,
  QmesA2MjYEjdsC2wFRSfqDmThDASftNZThwWMuhZ7vKQaV: {
    presetValues: ['0.05 OS', '0.1 OS', '1 OS', '5 OS', '10 OS', '100 OS'],
  },
  QmVGor81bynT1GLQoWURiTSdPmPEDbe8eC5znNDHfTfkfT: percentages,
  QmUMFxQjd3zj7oVGpDPGDom6ogYu1b9o6CnKAYFSaCsmuU: {
    presetValues: ['0.05 OS', '0.1 OS', '1 OS', '5 OS', '10 OS', '100 OS'],
  },
}

async function getSurveysByModels({ context, chainId }, organization) {
  if (!organization || organization.proposalModels.length === 0) {
    return []
  }
  organization.proposalModels.forEach((it, i) => (it.modelIndex = i))
  var surveys = organization.proposalModels.filter((it) => !it.isPreset)
  var metadatas = await Promise.all(
    surveys.map(async (it) => {
      var metadata = {}
      try {
        metadata =
          it.uri.toLowerCase().indexOf('ipfs') === -1
            ? {}
            : {
                ...(await (
                  await fetch(formatLink({ context }, it.uri))
                ).json()),
                uri: it.uri,
              }
      } catch (e) {}
      try {
        metadata = {
          ...metadata,
          ...wellknownPresets[metadata.uri.split('ipfs://ipfs/').join('')],
        }
      } catch (e) {}
      return metadata
    })
  )

  var logArray = await Promise.all(
    surveys.map((it) =>
      getLogs(organization.contract.currentProvider, {
        address: organization.address,
        fromBlock:
          web3Utils.toHex(
            getNetworkElement({ context, chainId }, 'deploySearchStart')
          ) || '0x0',
        toBlock: 'latest',
        topics: [
          web3Utils.sha3('Proposed(uint256,uint256,bytes32)'),
          abi.encode(['uint256'], [it.modelIndex]),
        ],
      })
    )
  )

  var allProposalIds = logArray
    .reduce((acc, it) => [...acc, ...it], [])
    .map((it) => it.topics[3])
    .filter((it, i, arr) => arr.indexOf(it) === i)

  var data = await Promise.all(
    allProposalIds.map((it) =>
      blockchainCall(organization.contract.methods.isPersistent, it)
    )
  )

  allProposalIds = allProposalIds.filter((_, i) => !data[i][0] && !data[i][1])

  for (var logs of logArray) {
    for (var log of logs) {
      var proposalId = log.topics[3]
      if (allProposalIds.indexOf(proposalId) === -1) {
        continue
      }
      var modelIndex = parseInt(
        abi.decode(['uint256'], log.topics[1])[0].toString()
      )
      var survey = surveys.filter((it) => it.modelIndex === modelIndex)[0]
      !survey.proposalIds && (survey.proposalIds = [])
      survey.proposalIds.push(proposalId)
    }
  }

  var surveysProposals = await Promise.all(
    surveys.map(async (it, i) => {
      var subProposals = await Promise.all(
        (it.proposalIds = it.proposalIds || []).map(async (sp, index) => ({
          key:
            'prop_' +
            it.modelIndex +
            '_' +
            organization.address +
            '_' +
            sp +
            '_' +
            index,
          ...sp,
          ...metadatas[i],
          ...(
            await retrieveProposals(organization.components.proposalsManager, [
              sp,
            ])
          )[0],
          proposalId: sp,
          organization,
          proposalsManager: organization.components.proposalsManager.contract,
          isSurveyless: false,
          subProposals,
          proposalsConfiguration: organization.proposalsConfiguration,
        }))
      )
      return {
        key: 'prop_' + it.modelIndex + '_' + organization.address,
        ...it,
        ...metadatas[i],
        organization,
        proposalsManager: organization.components.proposalsManager.contract,
        isSurveyless: false,
        subProposals,
        proposalsConfiguration: organization.proposalsConfiguration,
      }
    })
  )

  return surveysProposals
}

async function getProposals(
  { account, web3, newContract, context, chainId },
  organization
) {
  var proposals = [
    ...(await getSurveylessProposals({ context }, organization)),
    ...(await getSurveysByModels({ context }, organization)),
  ]
  if (proposals.length > 0) {
    return proposals
  }

  const provider =
    organization.components.proposalsManager.contract.currentProvider

  const args = {
    address: organization.components.proposalsManager.address,
    topics: [web3Utils.sha3('ProposalCreated(address,address,bytes32)')],
    fromBlock:
      web3Utils.toHex(
        getNetworkElement({ context, chainId }, 'deploySearchStart')
      ) || '0x0',
    toBlock: 'latest',
  }
  var logs = await getLogs(provider, args)
  var proposalIds = logs
    .map((it) => it.topics[3])
    .filter((it, i, arr) => arr.indexOf(it) === i)

  proposals = await retrieveProposals(
    organization.components.proposalsManager,
    proposalIds
  )
  var proposalsConfiguration = await retrieveProposalConfiguration(
    organization.components.proposalsManager
  )

  var votingTokens = await Promise.all(
    proposalsConfiguration.objectIds.map((_, i) =>
      decodeProposalVotingToken(
        { account, web3, context, newContract },
        VOID_BYTES32,
        proposalsConfiguration.collections[i],
        proposalsConfiguration.objectIds[i],
        proposalsConfiguration.weights[i]
      )
    )
  )

  proposals = proposals.map((it, i) => ({
    key: `prop_${i}_${proposalIds[i]}`,
    proposalsConfiguration,
    proposalIds: [proposalIds[i]],
    proposalsManager: organization.components.proposalsManager.contract,
    isPreset: false,
    isSurveyless: false,
    organization,
    id: proposalIds[i],
    proposalId: proposalIds[i],
    proposalType: 'normal',
    type: 'survey',
    ...it,
  }))

  proposals = await Promise.all(
    proposals.map(async (it) => {
      try {
        var data = await getData({ context, provider }, it.codeSequence[0])

        var uri = formatLink({ context }, data.uri)

        var metadata = await (await fetch(uri)).json()

        it = { ...it, uri, ...data, ...metadata }
      } catch (e) {}
      try {
        var data = await getData({ context, provider }, it.codeSequence[0])

        var additionalUri = formatLink({ context }, data.additionalUri)

        var metadata = await (await fetch(additionalUri)).json()

        it = { ...it, additionalUri, ...metadata }
      } catch (e) {}
      return {
        ...it,
        proposalsConfiguration: {
          ...proposalsConfiguration,
          votingTokens,
        },
      }
    })
  )

  proposals = [
    {
      name: 'OS-UP',
      proposalType: 'normal',
      type: 'survey',
      subProposals: proposals,
      organization,
      proposalsConfiguration: {
        ...proposalsConfiguration,
        votingTokens,
      },
      proposalsManager: organization.components.proposalsManager.contract,
      isPreset: false,
      proposalIds,
      votingTokens,
      isSurveyless: false,
      key: 'prop_0_0',
    },
  ]

  return proposals
}

export async function createPresetProposals({}, proposal) {
  var create = proposal.presetProposals.map((_, i) => ({
    codes: [
      {
        location: abi.decode(
          ['address'],
          abi.encode(['uint256'], [proposal.modelIndex])
        )[0],
        bytecode: abi.encode(['uint256'], [i]),
      },
    ],
    alsoTerminate: false,
  }))
  await blockchainCall(proposal.proposalsManager.methods.batchCreate, create)
}

export async function vote(
  { account },
  proposal,
  token,
  accept,
  refuse,
  proposalId,
  permitSignature,
  voter
) {
  var collectionAddress
  var tokenAddress
  if (proposal.votingTokens) {
    var tokens = abi.decode(
      ['address[]', 'uint256[]', 'uint256[]'],
      proposal.votingTokens
    )
    collectionAddress = tokens[0][0]
    tokenAddress = tokens[1][0]
  } else {
    collectionAddress = proposal.proposalsConfiguration.collections[0]
    tokenAddress = proposal.proposalsConfiguration.objectIds[0]
  }
  if (collectionAddress !== VOID_ETHEREUM_ADDRESS) {
    var data = abi.encode(
      ['bytes32', 'uint256', 'uint256', 'address', 'bool'],
      [proposalId, accept, refuse, voter || account, false]
    )
    await blockchainCall(
      token.mainInterface.methods.safeTransferFrom,
      account,
      proposal.proposalsManager.options.address,
      token.id,
      accept.ethereansosAdd(refuse),
      data
    )
  } else {
    tokenAddress = abi.decode(
      ['address'],
      abi.encode(['uint256'], [tokenAddress])
    )[0]
    await blockchainCall(
      proposal.proposalsManager.methods.vote,
      tokenAddress,
      permitSignature || '0x',
      proposalId,
      accept,
      refuse,
      voter || account,
      false
    )
  }
}

export async function terminateProposal({}, proposal, proposalId) {
  await blockchainCall(proposal.proposalsManager.methods.terminate, [
    proposalId,
  ])
}

export async function withdrawProposal(
  { account },
  proposal,
  proposalId,
  address,
  voteOrWithdraw
) {
  await blockchainCall(
    proposal.proposalsManager.methods.withdrawAll,
    [proposalId],
    address || account,
    voteOrWithdraw || false
  )
}

export async function checkSurveyStatus(
  inputData,
  proposal,
  proposalId,
  addressesKey
) {
  var { account, newContract, context, chainId } = inputData
  if (
    chainId === 10 ||
    (proposal.organization &&
      !proposal.organization.old &&
      proposal.organization.type !== 'delegation')
  ) {
    return await checkSurveyStatusNew(
      inputData,
      proposal,
      proposalId,
      addressesKey
    )
  }
  var proposalData = (
    await retrieveProposals(proposal.proposalsManager, [proposalId])
  )[0]
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
    proposalData.votingTokens,
  ]

  var types = [
    'address',
    'address[]',
    'uint256',
    'uint256',
    'uint256',
    'address',
    'address[]',
    'address[]',
    'bool',
    'uint256',
    'bytes',
  ]

  var data = abi.encode([`tuple(${types.join(',')})`], [values])

  var results = await Promise.all(
    proposalData[`${addressesKey || 'canTerminate'}Addresses`].map(
      async (validator) => {
        var checker = newContract(context.IProposalCheckerABI, validator)
        var result = await blockchainCall(
          checker.methods.check,
          proposal.proposalsManager.options.address,
          proposalId,
          data,
          account,
          account,
          { from: proposal.proposalsManager.address }
        )
        return result
      }
    )
  )

  return addressesKey === 'validators'
    ? results.filter((it) => !it).length === 0
    : results.filter((it) => it).length > 0
}

export async function checkSurveyStatusNew(
  inputData,
  proposal,
  proposalId,
  addressesKey
) {
  var { account } = inputData

  var proposalData = (
    await retrieveProposals(proposal.proposalsManager, [proposalId])
  )[0]

  var Proposal = {
    proposer: 'address',
    codeSequence: 'address[]',
    creationBlock: 'uint256',
    creationTime: 'uint256',
    accept: 'uint256',
    refuse: 'uint256',
    triggeringRules: 'address',
    canTerminateAddresses: 'address[]',
    validatorsAddresses: 'address[]',
    validationPassed: 'bool',
    terminationBlock: 'uint256',
    votingTokens: 'bytes',
    triggeringData: 'bytes',
    canTerminateData: 'bytes[]',
    validatorsData: 'bytes[]',
  }

  var proposalDataValues = Object.keys(Proposal).reduce(
    (acc, it) => [...acc, proposalData[it]],
    []
  )

  var data = abi.encode(
    [`tuple(${Object.values(Proposal).join(',')})`],
    [proposalDataValues]
  )

  var method = web3Utils
    .sha3('check(address,bytes,bytes32,bytes,address,address)')
    .substring(0, 10)

  var results = await Promise.all(
    proposalData[`${addressesKey || 'canTerminate'}Addresses`].map(
      async (validator, i) => {
        var args = abi
          .encode(
            ['address', 'bytes', 'bytes32', 'bytes', 'address', 'address'],
            [
              proposal.proposalsManager.options.address,
              proposalData[`${addressesKey || 'canTerminate'}Data`][i],
              proposalId,
              data,
              account,
              account,
            ]
          )
          .substring(2)
        var result = await sendAsync(
          proposal.proposalsManager.currentProvider,
          'eth_call',
          {
            to: validator,
            data: method + args,
            from: proposal.proposalsManager.address,
          }
        )
        result = abi.decode(['bool'], result)[0]
        return result
      }
    )
  )

  return addressesKey === 'validators'
    ? results.filter((it) => !it).length === 0
    : results.filter((it) => it).length > 0
}

export function surveylessIsTerminable(web3Data, proposal, proposalId) {
  return checkSurveyStatus(web3Data, proposal, proposalId, 'validators')
}

export function surveyIsTerminable(web3Data, proposal, proposalId) {
  return checkSurveyStatus(web3Data, proposal, proposalId)
}

export async function retrieveProposalModelMetadata({ context }, proposal) {
  var metadata = { ...proposal }

  try {
    metadata = await (
      await fetch(
        (proposal.formattedLink = formatLink({ context }, proposal.uri))
      )
    ).json()
  } catch (e) {}

  try {
    var rawTypes = metadata.decodePreset.types.map((it) => it.rawType)

    var values = proposal.presetValues.map((it) => abi.decode(rawTypes, it))

    values = values.map((decodedValues) =>
      decodedValues.map((decodedValue) => {
        var toString = decodedValue.toString()
        if (toString === '[Object object]') {
          toString = decodedValue
        }
        return toString
      })
    )

    values = values.map((valuesArray) =>
      valuesArray.map((value, i) =>
        prettifyValue(value, metadata.decodePreset.types[i])
      )
    )

    if (metadata.decodePreset.toDisplay) {
      values = values.map((valuesToDisplay) => {
        var display = metadata.decodePreset.toDisplay
          .map((it) => valuesToDisplay[it])
          .join(' ')
          .trim()
        return display
      })
    }

    if (metadata.decodePreset.suffix) {
      values = values.map((prettifiedValue) => {
        if (prettifiedValue instanceof Array) {
          return prettifiedValue.map(
            (val) => val + metadata.decodePreset.suffix
          )
        }
        return prettifiedValue + metadata.decodePreset.suffix
      })
    }

    metadata.prettifiedValues = values
  } catch (e) {
    console.log(e)
  }

  return metadata
}

function prettifyValue(value, type) {
  if (type.rawType === 'string') {
    return value
  }
  if (type.additionalData?.decimals) {
    value = fromDecimals(value, type.additionalData.decimals, true)
  }
  if (type.name === 'percentage') {
    value += ' %'
  }
  return value
}

var uint256EntryTypePercentage = {
  decodePreset: {
    toDisplay: [1],
    types: [
      {
        rawType: 'string',
        name: 'entryName',
        label: 'State Variable Name',
      },
      {
        rawType: 'uint256',
        name: 'percentage',
        label: 'Percentage',
        additionalData: {
          decimals: 16,
        },
      },
    ],
  },
}

var uint256EntryType = {
  decodePreset: {
    toDisplay: [1],
    suffix: ' OS',
    types: [
      {
        rawType: 'string',
        name: 'entryName',
        label: 'State Variable Name',
      },
      {
        rawType: 'uint256',
        name: 'number',
        label: 'Amount',
        additionalData: {
          decimals: 18,
        },
      },
    ],
  },
}

var wellKnownLinks = {
  QmPkZjrGUpNSP19oWhdRfoy9YdP7fL9AJtzmgiFR2sekyT: {
    decodePreset: {
      types: [
        {
          rawType: 'uint256',
          name: 'percentage',
          label: 'Percentage',
          additionalData: {
            decimals: 16,
          },
        },
      ],
    },
  },
  QmSBSi8STApCH3LtRALMQSA6v7iMka9UYFewY8N4jB9dSN: uint256EntryTypePercentage,
  Qmee1ibJCtnhu7ChpcsKyXum9KikptJtQrAxeCLer55Aj5: uint256EntryTypePercentage,
  QmR3S8cPGb4Tm9dr7sVx5meUPMsptV6vBbCCP96e2cZeAL: uint256EntryTypePercentage,
  QmesA2MjYEjdsC2wFRSfqDmThDASftNZThwWMuhZ7vKQaV: uint256EntryType,
  QmVGor81bynT1GLQoWURiTSdPmPEDbe8eC5znNDHfTfkfT: uint256EntryTypePercentage,
}

async function getAMMDataUniV3(web3Data, amm, inputTokenAddress) {
  const { web3 } = web3Data

  var ammPlugin = amm.address
  var liquidityPoolAddress

  var factoryAddress = await blockchainCall(amm.contract.methods.factory)

  var liquidityPoolAddress = await getRawField(
    { provider: web3.currentProvider },
    factoryAddress,
    'getPool(address,address,uint24)',
    inputTokenAddress,
    amm.ethereumAddress,
    amm.uniswapV3PoolValue.value
  )
  liquidityPoolAddress = abi.decode(['address'], liquidityPoolAddress)[0]

  if (liquidityPoolAddress === VOID_ETHEREUM_ADDRESS) {
    var tokenBasicInfo = await getTokenBasicInfo(web3Data, inputTokenAddress)
    throw `No liquidity pool address found for token ${tokenBasicInfo.name} (${tokenBasicInfo.symbol}) and fee ${amm.uniswapV3PoolValue.label} on ${amm.name}`
  }

  return {
    ammPlugin,
    liquidityPoolAddress,
  }
}

async function getAMMData(web3Data, amm, inputTokenAddress) {
  if (!amm) {
    throw 'AMM is Mandatory'
  }

  if (amm.name === 'UniswapV3') {
    return await getAMMDataUniV3(web3Data, amm, inputTokenAddress)
  }

  var ammPlugin = amm.address
  var liquidityPoolAddress = await blockchainCall(
    amm.contract.methods.byTokens,
    [amm.ethereumAddress, inputTokenAddress]
  )
  liquidityPoolAddress = liquidityPoolAddress[2]

  if (liquidityPoolAddress === VOID_ETHEREUM_ADDRESS) {
    var tokenBasicInfo = await getTokenBasicInfo(web3Data, inputTokenAddress)
    throw `No liquidity pool address found for token ${tokenBasicInfo.name} (${tokenBasicInfo.symbol}) on ${amm.name}`
  }

  return {
    ammPlugin,
    liquidityPoolAddress,
  }
}

async function getPrestoOperationSkeleton(
  web3Data,
  amm,
  inputTokenAddress,
  enterInETH
) {
  const { ammPlugin, liquidityPoolAddress } = await getAMMData(
    web3Data,
    amm,
    inputTokenAddress
  )
  return {
    inputTokenAddress: enterInETH ? VOID_ETHEREUM_ADDRESS : inputTokenAddress,
    inputTokenAmount: '0',
    ammPlugin,
    liquidityPoolAddresses: [liquidityPoolAddress],
    swapPath: [enterInETH ? inputTokenAddress : VOID_ETHEREUM_ADDRESS],
    enterInETH: enterInETH === true,
    exitInETH: enterInETH !== true,
    tokenMins: [],
    receivers: [],
    receiversPercentages: [],
  }
}

function encodePrestoOperations(additionalMetadataUri, prestoOperations) {
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
    'uint256[]',
  ]
  return abi.encode(
    ['string', `tuple(${prestoOperationTypes.join(',')})[]`],
    [additionalMetadataUri, prestoOperations.map(Object.values)]
  )
}

export async function proposeBuy(
  web3Data,
  proposal,
  additionalMetadata,
  ammList,
  tokens
) {
  const { context, ipfsHttpClient } = web3Data

  var addresses = []
  try {
    addresses = tokens
      .map((it) => it && it.address)
      .filter((it) => it !== undefined && it !== null)
      .filter((it, i, array) => array.indexOf(it) === i)
  } catch (e) {}

  if (
    addresses.length !== 4 ||
    addresses.filter((it) => it === VOID_ETHEREUM_ADDRESS).length > 0
  ) {
    throw 'You must choose 4 different ERC20 tokens'
  }

  const prestoOperations = await Promise.all(
    addresses.map((it, i) =>
      getPrestoOperationSkeleton(web3Data, ammList[i], it, true)
    )
  )
  prestoOperations.forEach((it) => (it.receivers = [VOID_ETHEREUM_ADDRESS]))

  var additionalMetadataUri = await uploadMetadata(
    { context, ipfsHttpClient },
    additionalMetadata
  )

  var create = [
    {
      codes: [
        {
          location: abi.decode(
            ['address'],
            abi.encode(['uint256'], [proposal.modelIndex])
          )[0],
          bytecode: encodePrestoOperations(
            additionalMetadataUri,
            prestoOperations
          ),
        },
      ],
      alsoTerminate: false,
    },
  ]

  await blockchainCall(proposal.proposalsManager.methods.batchCreate, create)
}

export async function proposeSell(
  web3Data,
  proposal,
  additionalMetadata,
  ammList,
  tokens,
  percentages
) {
  const { chainId, context, ipfsHttpClient, newContract } = web3Data

  var addresses = []
  try {
    addresses = tokens
      .map((it) => it && it.address)
      .filter((it) => it !== undefined && it !== null)
      .filter((it, i, array) => array.indexOf(it) === i)
  } catch (e) {}

  if (
    (chainId !== 4 && addresses.length !== 5) ||
    addresses.filter((it) => it === VOID_ETHEREUM_ADDRESS).length > 0
  ) {
    throw 'You must choose 5 different ERC20 tokens'
  }

  var balances = await Promise.all(
    addresses.map((it) =>
      blockchainCall(
        newContract(context.IERC20ABI, it).methods.balanceOf,
        proposal.organization.components.investmentsManager.address
      )
    )
  )

  if (chainId !== 4 && balances.filter((it) => it === '0').length > 0) {
    throw 'Please select only tokens where Investments Manager balance is greater than 0'
  }

  var realPercentages = percentages
    .filter((it) => it > 0 && it <= 5)
    .map((it) => numberToString(it * 1e16))
  if (realPercentages.length !== 5) {
    throw 'Percentages must be 5 numbers greater than zero and less than or equal to 5%'
  }

  if (chainId === 4) {
    while (addresses.length < 5) {
      addresses.push(addresses[0])
    }
  }

  const prestoOperations = await Promise.all(
    addresses.map((it, i) =>
      getPrestoOperationSkeleton(web3Data, ammList[i], it)
    )
  )
  prestoOperations.forEach(
    (it, i) => (it.inputTokenAmount = realPercentages[i])
  )

  var additionalMetadataUri = await uploadMetadata(
    { context, ipfsHttpClient },
    additionalMetadata
  )

  var create = [
    {
      codes: [
        {
          location: abi.decode(
            ['address'],
            abi.encode(['uint256'], [proposal.modelIndex])
          )[0],
          bytecode: encodePrestoOperations(
            additionalMetadataUri,
            prestoOperations
          ),
        },
      ],
      alsoTerminate: false,
    },
  ]

  await blockchainCall(proposal.proposalsManager.methods.batchCreate, create)
}

export async function retrieveSurveyByModel({ context, chainId }, proposal) {
  var index = proposal.modelIndex

  var args = {
    address: proposal.organization.address,
    fromBlock:
      web3Utils.toHex(
        getNetworkElement({ context, chainId }, 'deploySearchStart')
      ) || '0x0',
    toBlock: 'latest',
    topics: [
      web3Utils.sha3('Proposed(uint256,uint256,bytes32)'),
      abi.encode(['uint256'], [index]),
    ],
  }

  var logs = await getLogs(proposal.proposalsManager.currentProvider, args)
  var proposalIds = logs.map((it) => it.topics[3])

  var proposals = await retrieveProposals(
    proposal.proposalsManager,
    proposalIds
  )
  proposals = proposals.map((it, i) => ({
    ...it,
    id: proposalIds[i],
    proposalsManager: proposal.proposalsManager,
    proposalsConfiguration: proposal.organization.proposalsConfiguration,
  }))

  return proposals
}

export async function tokensToWithdraw(
  { account, web3, context, newContract },
  proposal,
  proposalIds
) {
  var proposalIds = proposalIds instanceof Array ? proposalIds : [proposalIds]
  var proposalDatas = await retrieveProposals(
    proposal.proposalsManager,
    proposalIds
  )
  var tokens = await Promise.all(
    proposalIds.map((proposalId, i) =>
      extractProposalVotingTokens(
        { account, web3, context, newContract },
        proposalDatas[i],
        proposalId
      )
    )
  )
  var itemKeys = proposalIds.map((proposalId, i) =>
    tokens[i].map((it) => generateItemKey(it, proposalId))
  )
  var accounts = proposalIds.map(() => account)
  var x = await blockchainCall(
    proposal.proposalsManager.methods.votes,
    proposalIds,
    accounts,
    itemKeys
  )
  var tw = []
  var accs = proposalDatas.map((it) => fromDecimals(it.accept, 18, true))
  var refs = proposalDatas.map((it) => fromDecimals(it.refuse, 18, true))
  x[0].forEach((it, i) => {
    var values = x[2][i]
    var accepts = x[0][i]
    var refuses = x[1][i]
    var id = proposalIds[i]
    var prettifiedValue = 'Staked'
    var tokensArray = tokens[i]

    for (var z in tokensArray) {
      var token = tokensArray[z]
      var value = fromDecimals(values[z], token.decimals, true)
      if (value == 0) {
        return
      }
      tw.push({
        proposalId: id,
        prettifiedValue,
        accept: fromDecimals(accepts, token.decimals, true),
        refuse: fromDecimals(refuses, token.decimals, true),
        value,
        address: token.address,
        symbol: token.symbol,
      })
    }
  })
  return { tw, accs, refs }
}

export async function readGovernanceRules(web3Data, proposal, proposalId) {
  var proposalData = (
    await retrieveProposals(proposal.proposalsManager, [proposalId])
  )[0]
  var validators = await extractRules(
    { ...web3Data, provider: proposal.proposalsManager.currentProvider },
    proposalData.validators,
    proposalData
  )
  var terminates = await extractRules(
    { ...web3Data, provider: proposal.proposalsManager.currentProvider },
    proposalData.canTerminates,
    proposalData
  )

  return { validators, terminates }
}

export async function extractRules(web3Data, rules, proposalData) {
  if (!rules || rules.length === 0) {
    return []
  }
  var convertedRules = []
  convertedRules = await Promise.all(
    rules
      .filter((it) => it !== VOID_ETHEREUM_ADDRESS)
      .map((it) => getData(web3Data, it))
  )
  return await cleanRules(web3Data, convertedRules, proposalData)
}

async function cleanRules(web3Data, rules, type, proposalData) {
  if (!rules || rules.length === 0) {
    return []
  }
  return Promise.all(
    rules.map((it) => cleanRule(web3Data, it, type, proposalData))
  )
}

async function cleanRule(web3Data, rule, type, proposalData) {
  var clean = cleaners[rule.label](web3Data, rule, type, proposalData)
  clean = clean.then ? await clean : clean
  return { label: rule.label, ...clean }
}

var cleaners = {
  hardCap(_, rule) {
    var val = fromDecimals(rule.valueUint256, rule.discriminant ? 16 : 18)
    var text = 'Max Cap'
    var value = val + (rule.discriminant ? '%' : ' votes')
    return { text, value }
  },
  quorum(_, rule) {
    var val = fromDecimals(rule.valueUint256, rule.discriminant ? 16 : 18)
    var text = 'Quorum'
    var value = val + (rule.discriminant ? '%' : ' votes')
    return { text, value }
  },
  host(_, rule) {
    var text = 'Host'
    var value = rule.valueAddress
    return { text, value }
  },
  async blockLength(_, rule) {
    var text = 'Length'
    var value = rule.valueUint256 + ' blocks'
    return { text, value }
  },
  async validationBomb(_, rule) {
    var text = 'Validation bomb'
    var value = rule.valueUint256 + ' blocks'
    return { text, value }
  },
  async BY_TIME(web3Data, rule, proposalData) {
    var checkerData = getCheckerData(rule.address, proposalData)
    rule.valueUint256 = abi.decode(['uint256'], checkerData)[0].toString()
    var text = 'Votable Until'
    var value = new Date().toISOString()
    try {
      value = new Date(parseInt(rule.valueUint256) * 1000).toISOString()
    } catch (e) {}
    text = 'Voting Period'
    value =
      convertSecondsToLabel(web3Data, rule.valueUint256) +
      ' after proposal creation'
    return { text, value }
  },
  async UNTIL(web3Data, rule, proposalData) {
    var checkerData = getCheckerData(rule.address, proposalData)
    rule.valueUint256 = abi.decode(['uint256'], checkerData)[0].toString()
    var text = 'Executable Until'
    var value = new Date().toISOString()
    try {
      value = new Date(parseInt(rule.valueUint256) * 1000).toISOString()
    } catch (e) {}
    text = 'Validation Bomb'
    value =
      convertSecondsToLabel(web3Data, rule.valueUint256) +
      ' after proposal creation'
    return { text, value }
  },
  BY_HARD_CAP(_, rule, proposalData) {
    var checkerData = getCheckerData(rule.address, proposalData)
    checkerData = abi.decode(['uint256', 'bool'], checkerData)
    rule.valueUint256 = checkerData[0].toString()
    rule.discriminant = checkerData[1]
    var val = fromDecimals(rule.valueUint256, rule.discriminant ? 16 : 18)
    var text = 'Max Cap'
    var value = val + (rule.discriminant ? '%' : ' votes')
    return { text, value }
  },
  BY_QUORUM(_, rule, proposalData) {
    var checkerData = getCheckerData(rule.address, proposalData)
    checkerData = abi.decode(['uint256', 'bool'], checkerData)
    rule.valueUint256 = checkerData[0].toString()
    rule.discriminant = checkerData[1]
    var val = fromDecimals(rule.valueUint256, rule.discriminant ? 16 : 18)
    var text = 'Quorum'
    var value = val + (rule.discriminant ? '%' : ' votes')
    return { text, value }
  },
}
cleaners.BY_HOST = cleaners.host

function convertSecondsToLabel(web3Data, seconds) {
  const { context } = web3Data

  seconds = parseInt(seconds)

  var timeInterval = Object.entries(context.timeIntervals).filter(
    (it) => it[1] === seconds
  )[0]

  return (timeInterval && timeInterval[0]) || `${seconds} seconds`
}

export function getCheckerData(address, proposalData) {
  var isArray = Array.isArray(
    (proposalData.validatorsData || proposalData.terminatorsData)[0]
  )
  var addr = web3Utils.toChecksumAddress(address)
  if (isArray) {
    if (proposalData.validatorsData) {
      for (var i in proposalData.validatorsAddresses) {
        var val = proposalData.validatorsAddresses[i]
        for (var j in val) {
          if (web3Utils.toChecksumAddress(val[j]) === addr) {
            return proposalData.validatorsData[i][j]
          }
        }
      }
    }
    if (proposalData.canTerminateData) {
      for (var i in proposalData.canTerminateAddresses) {
        var val = proposalData.canTerminateAddresses[i]
        for (var j in val) {
          if (web3Utils.toChecksumAddress(val[j]) === addr) {
            return proposalData.canTerminateData[i][j]
          }
        }
      }
    }
  } else {
    if (proposalData.validatorsData) {
      for (var i in proposalData.validatorsAddresses) {
        if (web3Utils.toChecksumAddress(val[i]) === addr) {
          return proposalData.validatorsData[i]
        }
      }
    }
    if (proposalData.canTerminateData) {
      for (var i in proposalData.canTerminateAddresses) {
        if (web3Utils.toChecksumAddress(val[i]) === addr) {
          return proposalData.canTerminateData[i]
        }
      }
    }
  }
}

export function checkOrganizationMetadata(metadata, throwOnError) {
  var errors = []

  console.log('checkOrganizationMetadata', metadata)

  if (!metadata) {
    errors.push('Metadata')
  }

  if (metadata && !metadata.description) {
    errors.push('Name is mandatory')
  }

  if (metadata && !metadata.description) {
    errors.push('Description is mandatory')
  }

  if (
    metadata &&
    (!metadata?.image ||
      ((typeof metadata.image).toLowerCase() === 'filelist' &&
        metadata.image.length === 0)) &&
    !metadata?.file
  ) {
    errors.push('Cover image is mandatory')
  }

  if (errors.length > 0 && throwOnError) {
    throw `Errors:\n${errors.join('\n')}`
  }

  return errors.length === 0
}

export function checkGovernance(metadata, throwOnError) {
  var errors = []

  console.log('checkGovernance', metadata)

  if (!metadata) {
    errors.push('Metadata')
  }

  if (metadata && !metadata.token) {
    errors.push('Token is mandatory')
  }

  if (metadata && !metadata.proposalRulesHost) {
    errors.push('Host is mandatory')
  }

  if (errors.length > 0 && throwOnError) {
    throw `Errors:\n${errors.join('\n')}`
  }

  return errors.length === 0
}
