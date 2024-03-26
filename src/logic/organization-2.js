import {
  abi,
  VOID_ETHEREUM_ADDRESS,
  uploadMetadata,
  formatLink,
  fromDecimals,
  toDecimals,
  getNetworkElement,
  blockchainCall,
  web3Utils,
  sendAsync,
  tryRetrieveMetadata,
  VOID_BYTES32,
  numberToString,
} from 'interfaces-core'

export async function createOrganization(initialData, inputData) {
  var { context, chainId, web3 } = initialData

  var organizationDeployData
  try {
    organizationDeployData = await buildOrganizationDeployData(
      initialData,
      inputData
    )
    console.log(organizationDeployData)
  } catch (e) {
    console.log(e)
  }

  var deployData
  try {
    deployData = await createOrganizationDeployData(
      initialData,
      organizationDeployData
    )
    console.log(deployData)
  } catch (e) {
    console.log(e)
  }

  var factoryIndex = getNetworkElement(
    { context, chainId },
    'factoryIndices'
  ).organization
  var factoryOfFactories = new web3.eth.Contract(
    context.FactoryOfFactoriesABI,
    getNetworkElement({ context, chainId }, 'factoryOfFactoriesAddress')
  )
  var organizationFactoryAddress = await blockchainCall(
    factoryOfFactories.methods.get,
    factoryIndex
  )
  organizationFactoryAddress = organizationFactoryAddress.factoryList
  organizationFactoryAddress =
    organizationFactoryAddress[organizationFactoryAddress.length - 1]

  var organizationFactory = new web3.eth.Contract(
    context.IDFOFactoryABI,
    organizationFactoryAddress
  )

  var transaction = await blockchainCall(
    organizationFactory.methods.deploy,
    deployData
  )

  return transaction

  // var log = transaction.logs.filter(it => it.topics[0] === web3Utils.sha3('Deployed(address,address,address,bytes)'))
  // log = log[log.length - 1]
  // var address = log.topics[2]
  // address = abi.decode(["address"], address)[0].toString()

  // return address
}

async function buildOrganizationDeployData(initialData, inputData) {
  console.log(inputData)

  var { context } = initialData

  var tokenAddress = web3Utils.toChecksumAddress(
    inputData.governance.token.address
  )
  var decimals = await getTokenDecimals(initialData, tokenAddress)
  var organizationUri = await uploadOrganizationMetadata(
    initialData,
    inputData.metadata
  )
  var proposalsManagerLazyInitData = inputData.governance
  var fixedInflationManagerLazyInitData
  if (inputData.fixedInflation) {
    fixedInflationManagerLazyInitData = {
      tokenMinterOwner: inputData.fixedInflation.tokenMinterOwner,
      giveBackOwnershipSeconds:
        inputData.fixedInflation.giveBackOwnershipSeconds,
      _bootstrapFundWalletAddress:
        inputData.fixedInflation._bootstrapFundWalletAddress,
      _bootstrapFundIsRaw: inputData.fixedInflation._bootstrapFundIsRaw,
      _bootstrapFundWalletPercentage:
        inputData.fixedInflation._bootstrapFundWalletPercentage,
      firstExecution: stringToDate(inputData.fixedInflation.firstExecution),
      ammPlugin: inputData.fixedInflation.amm.address,
      inflationPercentage: inputData.fixedInflation.inflationPercentage0,
      swapPath: [inputData.fixedInflation.amm.ethereumAddress],
      liquidityPoolAddresses: [
        await retrieveLiquidityPoolAddress(
          initialData,
          [tokenAddress, inputData.fixedInflation.amm.ethereumAddress],
          inputData.fixedInflation.amm,
          inputData.fixedInflation.uniV3Pool
        ),
      ],
      inflationPercentages: [
        inputData.fixedInflation.inflationPercentage0,
        inputData.fixedInflation.inflationPercentage1,
        inputData.fixedInflation.inflationPercentage2,
        inputData.fixedInflation.inflationPercentage3,
        inputData.fixedInflation.inflationPercentage4,
        inputData.fixedInflation.inflationPercentage5,
      ],
    }
    fixedInflationManagerLazyInitData._rawTokenComponentKeys =
      inputData.fixedInflation._rawTokenComponents.map(
        (it) => context.grimoire[it.component]
      )
    fixedInflationManagerLazyInitData._rawTokenComponentsPercentages =
      inputData.fixedInflation._rawTokenComponents.map((it) => it.percentage)
    fixedInflationManagerLazyInitData._swappedTokenComponentKeys =
      inputData.fixedInflation._swappedTokenComponents.map(
        (it) => context.grimoire[it.component]
      )
    fixedInflationManagerLazyInitData._swappedTokenComponentsPercentages =
      inputData.fixedInflation._swappedTokenComponents.map(
        (it) => it.percentage
      )
    fixedInflationManagerLazyInitData._swappedTokenComponentsPercentages.pop()
  }
  var treasurySplitterManagerLazyInitData = {
    splitInterval: inputData.treasurySplitter.splitInterval,
    firstSplitEvent: stringToDate(inputData.treasurySplitter.firstSplitEvent),
    keys: inputData.treasurySplitter.components.map(
      (it) => context.grimoire[it.component]
    ),
    percentages: inputData.treasurySplitter.components.map(
      (it) => it.percentage
    ),
  }
  treasurySplitterManagerLazyInitData.percentages.pop()

  var delegationsManagerLazyInitData = {
    attachInsurance: inputData.delegationsManager.attachInsurance0,
  }

  var investmentsManagerLazyInitData = {
    swapToEtherInterval: inputData.investmentsManager.swapToEtherInterval,
    firstSwapToEtherEvent: stringToDate(
      inputData.investmentsManager.firstSwapToEtherEvent
    ),
    operations: [
      ...(await Promise.all(
        inputData.investmentsManager.fromETH.map(async (it) => ({
          ammPlugin: it.amm.address,
          liquidityPoolAddresses: [
            await retrieveLiquidityPoolAddress(
              initialData,
              [it.token.address, it.amm.ethereumAddress],
              it.amm,
              it.uniV3Pool
            ),
          ],
          swapPath: [it.token.address],
          receivers: it.burn ? [] : [VOID_ETHEREUM_ADDRESS],
        }))
      )),
      ...(await Promise.all(
        inputData.investmentsManager.toETH.map(async (it) => ({
          inputTokenAddress: it.token.address,
          inputTokenAmount: toDecimals(it.percentage / 100, 18),
          ammPlugin: it.amm.address,
          liquidityPoolAddresses: [
            await retrieveLiquidityPoolAddress(
              initialData,
              [it.token.address, it.amm.ethereumAddress],
              it.amm,
              it.uniV3Pool
            ),
          ],
          swapPath: [it.amm.ethereumAddress],
        }))
      )),
    ],
  }

  var proposalModelsData = {
    fixedInflation: fixedInflationManagerLazyInitData
      ? {
          ...inputData.fixedInflation.proposalRules,
          presetValues: fixedInflationManagerLazyInitData.inflationPercentages,
        }
      : undefined,
    treasuryManager: {
      ...inputData.treasuryManager.proposalRules,
      maxPercentagePerToken: inputData.treasuryManager.maxPercentagePerToken,
    },
    delegationsManagerBan: {
      ...inputData.delegationsManager.proposalRulesToBan,
    },
    delegationsManagerInsurance: {
      ...inputData.delegationsManager.proposalRulesForInsurance,
      presetValues: [
        inputData.delegationsManager.attachInsurance0,
        inputData.delegationsManager.attachInsurance1,
        inputData.delegationsManager.attachInsurance2,
        inputData.delegationsManager.attachInsurance3,
        inputData.delegationsManager.attachInsurance4,
        inputData.delegationsManager.attachInsurance5,
      ].map((it) => toDecimals(it, decimals)),
    },
    changeInvestmentsManagerTokensFromETHList: {
      ...inputData.investmentsManager.proposalRules,
    },
    changeInvestmentsManagerTokensToETHList: {
      ...inputData.investmentsManager.proposalRules,
      maxPercentagePerToken: inputData.investmentsManager.maxPercentagePerToken,
    },
  }

  return {
    tokenAddress,
    organizationUri,
    proposalsManagerLazyInitData,
    fixedInflationManagerLazyInitData,
    treasurySplitterManagerLazyInitData,
    delegationsManagerLazyInitData,
    investmentsManagerLazyInitData,
    proposalModelsData,
  }
}

async function uploadOrganizationMetadata(initialData, metadata) {
  var organizationUri

  organizationUri = await uploadMetadata(initialData, metadata)

  return organizationUri
}

export function stringToDate(str) {
  var date = new Date()

  date = date.getTime()
  date = date / 1000
  date = parseInt(date)

  return date
}

export function dateToString(date) {
  var str
  return str
}

async function retrieveLiquidityPoolAddress(
  initialData,
  tokens,
  amm,
  uniV3Pool
) {
  tokens = tokens.map((it) => web3Utils.toChecksumAddress(it.address || it))
  if (amm.name !== 'UniswapV3') {
    return (await blockchainCall(amm.contract.methods.byTokens, tokens))[2]
  }
  return await blockchainCall(
    amm.factory.methods.getPool,
    tokens[0],
    tokens[1],
    uniV3Pool
  )
}

async function createOrganizationDeployData(
  initialData,
  organizationDeployData
) {
  var {
    tokenAddress,
    organizationUri,
    proposalsManagerLazyInitData,
    fixedInflationManagerLazyInitData,
    treasurySplitterManagerLazyInitData,
    delegationsManagerLazyInitData,
    investmentsManagerLazyInitData,
  } = organizationDeployData

  proposalsManagerLazyInitData &&
    (proposalsManagerLazyInitData.tokenAddress = tokenAddress)
  delegationsManagerLazyInitData.tokenAddress = tokenAddress
  fixedInflationManagerLazyInitData &&
    (fixedInflationManagerLazyInitData.tokenAddress = tokenAddress)

  proposalsManagerLazyInitData = await createProposalsManagerLazyInitData(
    proposalsManagerLazyInitData
  )
  fixedInflationManagerLazyInitData =
    await createFixedInflationManagerLazyInitData(
      initialData,
      fixedInflationManagerLazyInitData
    )
  treasurySplitterManagerLazyInitData =
    await createTreasurySplitterManagerLazyInitData(
      initialData,
      treasurySplitterManagerLazyInitData
    )
  delegationsManagerLazyInitData = await createDelegationsManagerLazyInitData(
    initialData,
    delegationsManagerLazyInitData
  )
  investmentsManagerLazyInitData = await createInvestmentsManagerLazyInitData(
    initialData,
    investmentsManagerLazyInitData
  )

  var mandatoryComponentsDeployData = [proposalsManagerLazyInitData]
  var additionalComponents = [1, 5, 6, 7]
  var additionalComponentsDeployData = [
    '0x',
    treasurySplitterManagerLazyInitData,
    delegationsManagerLazyInitData,
    investmentsManagerLazyInitData,
  ]
  var specialComponentsData = []
  var specificOrganizationData = await createSubDAOProposalModels(
    initialData,
    organizationDeployData.proposalModelsData
  )

  if (fixedInflationManagerLazyInitData != '0x') {
    additionalComponents = [
      ...additionalComponents.slice(0, 1),
      4,
      ...additionalComponents.slice(1),
    ]
    additionalComponentsDeployData = [
      ...additionalComponentsDeployData.slice(0, 1),
      fixedInflationManagerLazyInitData,
      ...additionalComponentsDeployData.slice(1),
    ]
  }

  var organizationDeployData = {
    uri: organizationUri,
    mandatoryComponentsDeployData,
    additionalComponents,
    additionalComponentsDeployData,
    specialComponentsData,
    specificOrganizationData,
  }

  var type = 'tuple(string,bytes[],uint256[],bytes[],bytes[],bytes)'
  var deployData = abi.encode([type], [Object.values(organizationDeployData)])

  return deployData
}

function createProposalRules(data) {
  var {
    proposalDuration,
    hardCapPercentage,
    quorumPercentage,
    validationBomb,
  } = data

  var canTerminateAddresses = []
  var validatorsAddresses = []
  var canTerminateData = []
  var validatorsData = []

  if (proposalDuration) {
    canTerminateAddresses.push(1)
    canTerminateData.push(abi.encode(['uint256'], [proposalDuration]))
  }

  if (hardCapPercentage) {
    canTerminateAddresses.push(2)
    canTerminateData.push(
      abi.encode(
        ['uint256', 'bool'],
        [toDecimals(hardCapPercentage / 100, 18), true]
      )
    )
  }

  if (quorumPercentage) {
    validatorsAddresses.push(3)
    validatorsData.push(
      abi.encode(
        ['uint256', 'bool'],
        [toDecimals(quorumPercentage / 100, 18), true]
      )
    )
  }

  if (validationBomb) {
    validatorsAddresses.push(4)
    validatorsData.push(abi.encode(['uint256'], [validationBomb]))
  }

  canTerminateAddresses = canTerminateAddresses.map((it) =>
    abi.decode(['address'], abi.encode(['uint256'], [it]))[0].toString()
  )
  validatorsAddresses = validatorsAddresses.map((it) =>
    abi.decode(['address'], abi.encode(['uint256'], [it]))[0].toString()
  )

  return {
    canTerminateAddresses,
    validatorsAddresses,
    canTerminateData,
    validatorsData,
  }
}

async function createProposalsManagerLazyInitData(data) {
  var { tokenAddress, host } = data

  var {
    canTerminateAddresses,
    validatorsAddresses,
    canTerminateData,
    validatorsData,
  } = createProposalRules(data)

  var tokens = tokenAddress
  tokens = tokens && (Array.isArray(tokens) ? tokens : [tokens])

  var proposalConfiguration = {
    collections: tokens.map(() => VOID_ETHEREUM_ADDRESS),
    objectIds: tokens.map((it) =>
      abi.decode(['uint256'], abi.encode(['address'], [it]))[0].toString()
    ),
    weights: tokens.map(() => 1),
    creationRules: VOID_ETHEREUM_ADDRESS,
    triggeringRules: VOID_ETHEREUM_ADDRESS,
    canTerminateAddresses,
    validatorsAddresses,
    creationData:
      !host || host === VOID_ETHEREUM_ADDRESS
        ? '0x'
        : abi.encode(['address', 'bool'], [host, true]),
    triggeringData: '0x',
    canTerminateData,
    validatorsData,
  }

  var type =
    'tuple(address[],uint256[],uint256[],address,address,address[],address[],bytes,bytes,bytes[],bytes[])'

  var data = abi.encode([type], [Object.values(proposalConfiguration)])

  return data
}

async function createFixedInflationManagerLazyInitData(initialData, data) {
  if (!data) {
    return '0x'
  }

  var { context, chainId } = initialData

  var {
    tokenAddress,
    tokenMinterOwner,
    giveBackOwnershipSeconds,
    inflationPercentage,
    _bootstrapFundWalletAddress,
    _bootstrapFundIsRaw,
    _bootstrapFundWalletPercentage,
    _rawTokenComponentKeys,
    _rawTokenComponentsPercentages,
    _swappedTokenComponentKeys,
    _swappedTokenComponentsPercentages,
    ammPlugin,
    liquidityPoolAddresses,
    swapPath,
    firstExecution,
  } = data

  var executorRewardPercentage = context.executorRewardPercentage
  var prestoAddress = getNetworkElement({ context, chainId }, 'prestoAddress')
  var tokenMinter = await createFixedInflationTokenMinter(
    initialData,
    tokenAddress,
    tokenMinterOwner,
    giveBackOwnershipSeconds
  )
  var lazyInitData = []
  inflationPercentage = toDecimals(inflationPercentage / 100, 18)
  _bootstrapFundWalletPercentage = toDecimals(
    _bootstrapFundWalletPercentage / 100,
    18
  )
  var _bootstrapFundWalletOwner = _bootstrapFundWalletAddress
  var _defaultBootstrapFundComponentKey = VOID_BYTES32
  var executionInterval = getNetworkElement(
    { context, chainId },
    'fixedInflationExecutionInterval'
  )
  _rawTokenComponentKeys = _rawTokenComponentKeys || []
  _rawTokenComponentsPercentages = (_rawTokenComponentsPercentages || []).map(
    (it) => toDecimals(it / 100, 18)
  )
  _swappedTokenComponentKeys = _swappedTokenComponentKeys || []
  _swappedTokenComponentsPercentages = (
    _swappedTokenComponentsPercentages || []
  ).map((it) => toDecimals(it / 100, 18))
  lazyInitData.push(
    abi.encode(
      ['address', 'uint256', 'address', 'bytes'],
      [prestoAddress, executorRewardPercentage, tokenAddress, tokenMinter]
    )
  )
  lazyInitData.push(
    abi.encode(
      ['uint256', 'uint256', 'uint256'],
      [inflationPercentage, executionInterval, firstExecution || 0]
    )
  )
  lazyInitData.push(
    abi.encode(
      ['address', 'address', 'uint256', 'bool', 'bytes32'],
      [
        _bootstrapFundWalletOwner,
        _bootstrapFundWalletAddress,
        _bootstrapFundWalletPercentage,
        _bootstrapFundIsRaw || false,
        _defaultBootstrapFundComponentKey,
      ]
    )
  )
  lazyInitData.push(
    abi.encode(
      ['bytes32[]', 'uint256[]', 'bytes32[]', 'uint256[]'],
      [
        _rawTokenComponentKeys,
        _rawTokenComponentsPercentages,
        _swappedTokenComponentKeys,
        _swappedTokenComponentsPercentages,
      ]
    )
  )
  lazyInitData.push(
    abi.encode(
      ['address', 'address[]', 'address[]'],
      [ammPlugin, liquidityPoolAddresses, swapPath]
    )
  )
  lazyInitData = abi.encode(['bytes[]'], [lazyInitData])
  return lazyInitData
}

async function createFixedInflationTokenMinter(
  initialData,
  tokenAddress,
  owner,
  seconds
) {
  return await generateTokenMinter(initialData, tokenAddress, owner, seconds)
  if (!owner) {
    return VOID_ETHEREUM_ADDRESS
  }

  var { web3, context } = initialData

  tokenAddress = web3Utils.toChecksumAddress(tokenAddress)

  var TokenMinter = await getTokenMinter()
  var deployData = new web3.eth.Contract(TokenMinter.abi)
    .deploy({
      data: TokenMinter.bin,
      arguments: [
        context.grimoire.COMPONENT_KEY_FIXED_INFLATION_MANAGER,
        tokenAddress,
        owner || VOID_ETHEREUM_ADDRESS,
      ],
    })
    .encodeABI()
  return deployData
}

async function createTreasurySplitterManagerLazyInitData(initialData, data) {
  var { context } = initialData

  var { keys, percentages, splitInterval, firstSplitEvent } = data

  var executorRewardPercentage = context.executorRewardPercentage
  var flushExecutorRewardPercentage = context.executorRewardPercentage
  var _flushKey = VOID_BYTES32
  percentages = percentages.map((it) => toDecimals(it / 100, 18))
  var lazyInitData = abi.encode(
    [
      'uint256',
      'uint256',
      'bytes32[]',
      'uint256[]',
      'bytes32',
      'uint256',
      'uint256',
    ],
    [
      firstSplitEvent || 0,
      splitInterval,
      keys,
      percentages,
      _flushKey,
      flushExecutorRewardPercentage,
      executorRewardPercentage,
    ]
  )

  return lazyInitData
}

async function createDelegationsManagerLazyInitData(initialData, data) {
  var { chainId, context, web3 } = initialData

  var { tokenAddress, attachInsurance } = data

  var flusherKey = context.grimoire.COMPONENT_KEY_TREASURY_SPLITTER_MANAGER
  var executorRewardPercentage = context.executorRewardPercentage

  var factoryOfFactories = new web3.eth.Contract(
    context.FactoryOfFactoriesABI,
    getNetworkElement({ context, chainId }, 'factoryOfFactoriesAddress')
  )

  var list = []
  try {
    list = await factoryOfFactories.methods
      .get(getNetworkElement({ context, chainId }, 'factoryIndices').delegation)
      .call()
    list = [...list[1]]
  } catch (e) {}

  var decimals = await getTokenDecimals(initialData, tokenAddress)
  attachInsurance = toDecimals(attachInsurance || 0, decimals)

  var lazyInitData = abi.encode(['address[]', 'address[]'], [list, []])
  lazyInitData = abi.encode(
    ['uint256', 'address', 'bytes32', 'bytes'],
    [attachInsurance, VOID_ETHEREUM_ADDRESS, flusherKey, lazyInitData]
  )
  lazyInitData = abi.encode(
    ['uint256', 'address', 'uint256', 'bytes'],
    [
      executorRewardPercentage,
      VOID_ETHEREUM_ADDRESS,
      abi
        .decode(['uint256'], abi.encode(['address'], [tokenAddress]))[0]
        .toString(),
      lazyInitData,
    ]
  )

  return lazyInitData
}

async function createInvestmentsManagerLazyInitData(initialData, data) {
  var { context, chainId } = initialData

  var { operations, swapToEtherInterval, firstSwapToEtherEvent } = data

  operations = operations.map((it) => ({
    inputTokenAddress: it.inputTokenAddress || VOID_ETHEREUM_ADDRESS,
    inputTokenAmount: it.inputTokenAmount || 0,
    ammPlugin: it.ammPlugin,
    liquidityPoolAddresses: it.liquidityPoolAddresses,
    swapPath: it.swapPath,
    enterInETH: false,
    exitInETH: false,
    tokenMins: [],
    receivers: it.receivers || [],
    receiversPercentages: [],
  }))

  var executorRewardPercentage = context.executorRewardPercentage
  var prestoAddress = getNetworkElement({ context, chainId }, 'prestoAddress')
  var _organizationComponentKey =
    context.grimoire.COMPONENT_KEY_TREASURY_SPLITTER_MANAGER
  var type =
    'tuple(address,uint256,address,address[],address[],bool,bool,uint256[],address[],uint256[])[]'
  operations = abi.encode([type], [operations.map((it) => Object.values(it))])

  var lazyInitData = abi.encode(
    ['bytes32', 'uint256', 'address', 'uint256', 'uint256', 'bytes'],
    [
      _organizationComponentKey,
      executorRewardPercentage,
      prestoAddress,
      firstSwapToEtherEvent || 0,
      swapToEtherInterval,
      operations,
    ]
  )

  return lazyInitData
}

async function createSubDAOProposalModels(initialData, proposalModelsData) {
  var { context } = initialData

  Object.values(proposalModelsData).forEach(
    (it) => it && (it.proposalRules = createProposalRules(it))
  )
  var subDAOProposalModels = []
  subDAOProposalModels = [
    ...subDAOProposalModels,
    {
      source: VOID_ETHEREUM_ADDRESS,
      uri: '',
      isPreset: false,
      presetValues: [
        abi.encode(
          ['uint256'],
          [
            toDecimals(
              proposalModelsData.treasuryManager.maxPercentagePerToken / 100,
              18
            ),
          ]
        ),
      ],
      presetProposals: [],
      creationRules: VOID_ETHEREUM_ADDRESS,
      triggeringRules: VOID_ETHEREUM_ADDRESS,
      votingRulesIndex: 0,
      canTerminateAddresses: [
        proposalModelsData.treasuryManager.proposalRules.canTerminateAddresses,
      ],
      validatorsAddresses: [
        proposalModelsData.treasuryManager.proposalRules.validatorsAddresses,
      ],
      creationData: '0x',
      triggeringData: '0x',
      canTerminateData: [
        proposalModelsData.treasuryManager.proposalRules.canTerminateData,
      ],
      validatorsData: [
        proposalModelsData.treasuryManager.proposalRules.validatorsData,
      ],
    },
    {
      source: VOID_ETHEREUM_ADDRESS,
      uri: '',
      isPreset: false,
      presetValues: [],
      presetProposals: [],
      creationRules: VOID_ETHEREUM_ADDRESS,
      triggeringRules: VOID_ETHEREUM_ADDRESS,
      votingRulesIndex: 0,
      canTerminateAddresses: [
        proposalModelsData.delegationsManagerBan.proposalRules
          .canTerminateAddresses,
      ],
      validatorsAddresses: [
        proposalModelsData.delegationsManagerBan.proposalRules
          .validatorsAddresses,
      ],
      creationData: '0x',
      triggeringData: '0x',
      canTerminateData: [
        proposalModelsData.delegationsManagerBan.proposalRules.canTerminateData,
      ],
      validatorsData: [
        proposalModelsData.delegationsManagerBan.proposalRules.validatorsData,
      ],
    },
    {
      source: VOID_ETHEREUM_ADDRESS,
      uri: '',
      isPreset: true,
      presetValues:
        proposalModelsData.delegationsManagerInsurance.presetValues.map((it) =>
          abi.encode(['uint256'], [it])
        ),
      presetProposals: [],
      creationRules: VOID_ETHEREUM_ADDRESS,
      triggeringRules: VOID_ETHEREUM_ADDRESS,
      votingRulesIndex: 0,
      canTerminateAddresses: [
        proposalModelsData.delegationsManagerInsurance.proposalRules
          .canTerminateAddresses,
      ],
      validatorsAddresses: [
        proposalModelsData.delegationsManagerInsurance.proposalRules
          .validatorsAddresses,
      ],
      creationData: '0x',
      triggeringData: '0x',
      canTerminateData: [
        proposalModelsData.delegationsManagerInsurance.proposalRules
          .canTerminateData,
      ],
      validatorsData: [
        proposalModelsData.delegationsManagerInsurance.proposalRules
          .validatorsData,
      ],
    },
    {
      source: VOID_ETHEREUM_ADDRESS,
      uri: '',
      isPreset: false,
      presetValues: [
        abi.encode(['uint256'], [context.investmentsManagerMaxTokens]),
      ],
      presetProposals: [],
      creationRules: VOID_ETHEREUM_ADDRESS,
      triggeringRules: VOID_ETHEREUM_ADDRESS,
      votingRulesIndex: 0,
      canTerminateAddresses: [
        proposalModelsData.changeInvestmentsManagerTokensFromETHList
          .proposalRules.canTerminateAddresses,
      ],
      validatorsAddresses: [
        proposalModelsData.changeInvestmentsManagerTokensFromETHList
          .proposalRules.validatorsAddresses,
      ],
      creationData: '0x',
      triggeringData: '0x',
      canTerminateData: [
        proposalModelsData.changeInvestmentsManagerTokensFromETHList
          .proposalRules.canTerminateData,
      ],
      validatorsData: [
        proposalModelsData.changeInvestmentsManagerTokensFromETHList
          .proposalRules.validatorsData,
      ],
    },
    {
      source: VOID_ETHEREUM_ADDRESS,
      uri: '',
      isPreset: false,
      presetValues: [
        abi.encode(
          ['uint256', 'uint256'],
          [
            context.investmentsManagerMaxTokens,
            toDecimals(
              proposalModelsData.changeInvestmentsManagerTokensToETHList
                .maxPercentagePerToken / 100,
              18
            ),
          ]
        ),
      ],
      presetProposals: [],
      creationRules: VOID_ETHEREUM_ADDRESS,
      triggeringRules: VOID_ETHEREUM_ADDRESS,
      votingRulesIndex: 0,
      canTerminateAddresses: [
        proposalModelsData.changeInvestmentsManagerTokensToETHList.proposalRules
          .canTerminateAddresses,
      ],
      validatorsAddresses: [
        proposalModelsData.changeInvestmentsManagerTokensToETHList.proposalRules
          .validatorsAddresses,
      ],
      creationData: '0x',
      triggeringData: '0x',
      canTerminateData: [
        proposalModelsData.changeInvestmentsManagerTokensToETHList.proposalRules
          .canTerminateData,
      ],
      validatorsData: [
        proposalModelsData.changeInvestmentsManagerTokensToETHList.proposalRules
          .validatorsData,
      ],
    },
  ]

  if (proposalModelsData.fixedInflation) {
    subDAOProposalModels = [
      ...subDAOProposalModels,
      {
        source: VOID_ETHEREUM_ADDRESS,
        uri: '',
        isPreset: true,
        presetValues: proposalModelsData.fixedInflation.presetValues.map((it) =>
          abi.encode(['uint256'], [toDecimals(it / 100, 18)])
        ),
        presetProposals: [],
        creationRules: VOID_ETHEREUM_ADDRESS,
        triggeringRules: VOID_ETHEREUM_ADDRESS,
        votingRulesIndex: 0,
        canTerminateAddresses: [
          proposalModelsData.fixedInflation.proposalRules.canTerminateAddresses,
        ],
        validatorsAddresses: [
          proposalModelsData.fixedInflation.proposalRules.validatorsAddresses,
        ],
        creationData: '0x',
        triggeringData: '0x',
        canTerminateData: [
          proposalModelsData.fixedInflation.proposalRules.canTerminateData,
        ],
        validatorsData: [
          proposalModelsData.fixedInflation.proposalRules.validatorsData,
        ],
      },
    ]
  }

  var type =
    'tuple(address,string,bool,bytes[],bytes32[],address,address,uint256,address[][],address[][],bytes,bytes,bytes[][],bytes[][])[]'

  subDAOProposalModels = abi.encode(
    [type],
    [subDAOProposalModels.map(Object.values)]
  )

  return subDAOProposalModels
}

async function getTokenMinter() {
  var TokenMinter = {}
  TokenMinter.abi = [
    {
      inputs: [
        { internalType: 'bytes32', name: '_componentKey', type: 'bytes32' },
        { internalType: 'address', name: '_tokenAddress', type: 'address' },
        { internalType: 'address', name: '_owner', type: 'address' },
      ],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      inputs: [],
      name: 'componentKey',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'host',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: 'account', type: 'address' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' },
      ],
      name: 'mint',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'owner',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'tokenAddress',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
      name: 'transferOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
      name: 'transferTokenOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ]
  TokenMinter.bin =
    '60e060405234801561001057600080fd5b5060405161066738038061066783398101604081905261002f91610128565b8260808181525050336001600160a01b031663f437bc596040518163ffffffff1660e01b815260040160206040518083038186803b15801561007057600080fd5b505afa158015610084573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906100a89190610106565b606090811b6001600160601b031990811660a05292901b90911660c052600080546001600160a01b0319166001600160a01b0390921691909117905550610164565b80516001600160a01b038116811461010157600080fd5b919050565b60006020828403121561011857600080fd5b610121826100ea565b9392505050565b60008060006060848603121561013d57600080fd5b8351925061014d602085016100ea565b915061015b604085016100ea565b90509250925092565b60805160a05160601c60c05160601c6104b36101b460003960008181610114015281816101c2015261032601526000818161014e015261026001526000818160af015261023001526104b36000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c80638da5cb5b1161005b5780638da5cb5b146100e45780639d76ea581461010f578063f2fde38b14610136578063f437bc591461014957600080fd5b806321e6b53d1461008257806340c10f19146100975780638d8a0014146100aa575b600080fd5b6100956100903660046103d2565b610170565b005b6100956100a5366004610413565b610221565b6100d17f000000000000000000000000000000000000000000000000000000000000000081565b6040519081526020015b60405180910390f35b6000546100f7906001600160a01b031681565b6040516001600160a01b0390911681526020016100db565b6100f77f000000000000000000000000000000000000000000000000000000000000000081565b6100956101443660046103d2565b610386565b6100f77f000000000000000000000000000000000000000000000000000000000000000081565b6000546001600160a01b031633146101a35760405162461bcd60e51b815260040161019a9061043f565b60405180910390fd5b60405163f2fde38b60e01b81526001600160a01b0382811660048301527f0000000000000000000000000000000000000000000000000000000000000000169063f2fde38b90602401600060405180830381600087803b15801561020657600080fd5b505af115801561021a573d6000803e3d6000fd5b5050505050565b60405163023aa9ab60e61b81527f0000000000000000000000000000000000000000000000000000000000000000600482015233906001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001690638eaa6ac09060240160206040518083038186803b1580156102a257600080fd5b505afa1580156102b6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102da91906103f6565b6001600160a01b0316146103005760405162461bcd60e51b815260040161019a9061043f565b6040516340c10f1960e01b81526001600160a01b038381166004830152602482018390527f000000000000000000000000000000000000000000000000000000000000000016906340c10f1990604401600060405180830381600087803b15801561036a57600080fd5b505af115801561037e573d6000803e3d6000fd5b505050505050565b6000546001600160a01b031633146103b05760405162461bcd60e51b815260040161019a9061043f565b600080546001600160a01b0319166001600160a01b0392909216919091179055565b6000602082840312156103e457600080fd5b81356103ef81610465565b9392505050565b60006020828403121561040857600080fd5b81516103ef81610465565b6000806040838503121561042657600080fd5b823561043181610465565b946020939093013593505050565b6020808252600c908201526b1d5b985d5d1a1bdc9a5e995960a21b604082015260600190565b6001600160a01b038116811461047a57600080fd5b5056fea2646970667358221220ddfea61499e9f3bfd073fd579bdf655d80bb763afcd1c3482d2a5b0513d234b764736f6c63430008060033'
  return TokenMinter
}

async function getTokenDecimals(initialData, tokenAddress) {
  var { web3 } = initialData

  var response = await web3.eth.call({
    to: tokenAddress,
    data: web3Utils.sha3('decimals()').substring(0, 10),
  })

  response = abi.decode(['uint256'], response)[0].toString()
  return parseInt(response)
}

async function generateTokenMinter(data, tokenAddress, owner, seconds) {
  if (owner === undefined || owner === null) {
    return '0x'
  }
  const payload = abi
    .encode(['uint256', 'address'], [seconds, owner])
    .substring(2)
  var mainInterface = await getRawField(
    data.web3,
    tokenAddress,
    'mainInterface'
  )
  return (
    (mainInterface === '0x'
      ? tokenMinter_FixedInflationCore
      : tokenMinter_ItemBasedFixedInflationCore) + payload
  )
}

const tokenMinter_FixedInflationCore =
  '0x60a06040523360601b60805234801561001757600080fd5b506040516108e63803806108e68339810160408190526100369161022c565b336001600160a01b0316636addb6636040518163ffffffff1660e01b8152600401604080518083038186803b15801561006e57600080fd5b505afa158015610082573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906100a691906101f9565b50600080546001600160a01b0319166001600160a01b0392909216919091179055816101035760405162461bcd60e51b81526020600482015260076024820152667365636f6e647360c81b60448201526064015b60405180910390fd5b61010d824261024f565b60018190556040516000907f073d5fd87a7e0c2a384727f9aab2e84826370623aba582638b425a417e799a2c908290a36001600160a01b03811661017b5760405162461bcd60e51b815260206004820152600560248201526437bbb732b960d91b60448201526064016100fa565b6101848161018b565b5050610275565b600280546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b80516001600160a01b03811681146101f457600080fd5b919050565b6000806040838503121561020c57600080fd5b610215836101dd565b9150610223602084016101dd565b90509250929050565b6000806040838503121561023f57600080fd5b82519150610223602084016101dd565b6000821982111561027057634e487b7160e01b600052601160045260246000fd5b500190565b60805160601c61064c61029a600039600081816101120152610194015261064c6000f3fe608060405234801561001057600080fd5b506004361061009e5760003560e01c8063736e66b911610066578063736e66b91461013e5780638da5cb5b14610151578063e8c235e614610164578063f2fde38b1461016c578063f43098af1461017f57600080fd5b806329dcb0cf146100a35780633443bc71146100bf57806340c10f19146100ea57806367e404ce1461010d578063715018a614610134575b600080fd5b6100ac60015481565b6040519081526020015b60405180910390f35b6000546100d2906001600160a01b031681565b6040516001600160a01b0390911681526020016100b6565b6100fd6100f836600461054e565b610187565b60405190151581526020016100b6565b6100d27f000000000000000000000000000000000000000000000000000000000000000081565b61013c6101dd565b005b61013c61014c36600461059c565b610210565b6002546100d2906001600160a01b031681565b6100d26102be565b61013c61017a366004610514565b61034a565b61013c6103c0565b6000336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146101be57600080fd5b60015442106101cc57600080fd5b6101d683836103d8565b9392505050565b6002546001600160a01b0316331461009e5760405162461bcd60e51b8152600401610207906105b5565b60405180910390fd5b6002546001600160a01b0316331461023a5760405162461bcd60e51b8152600401610207906105b5565b600081116102745760405162461bcd60e51b81526020600482015260076024820152667365636f6e647360c81b6044820152606401610207565b60018054908290600061028783856105db565b909155505060015460405182907f073d5fd87a7e0c2a384727f9aab2e84826370623aba582638b425a417e799a2c90600090a35050565b60008060009054906101000a90046001600160a01b03166001600160a01b0316638da5cb5b6040518163ffffffff1660e01b815260040160206040518083038186803b15801561030d57600080fd5b505afa158015610321573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103459190610531565b905090565b6002546001600160a01b031633146103745760405162461bcd60e51b8152600401610207906105b5565b6001600160a01b0381166103b45760405162461bcd60e51b8152602060048201526007602482015266125b9d985b1a5960ca1b6044820152606401610207565b6103bd8161045f565b50565b60015442116103ce57600080fd5b6103d66104b1565b565b600080546040516340c10f1960e01b81526001600160a01b03858116600483015260248201859052909116906340c10f1990604401602060405180830381600087803b15801561042757600080fd5b505af115801561043b573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101d6919061057a565b600280546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b60005460025460405163f2fde38b60e01b81526001600160a01b03918216600482015291169063f2fde38b90602401600060405180830381600087803b1580156104fa57600080fd5b505af115801561050e573d6000803e3d6000fd5b50505050565b60006020828403121561052657600080fd5b81356101d681610601565b60006020828403121561054357600080fd5b81516101d681610601565b6000806040838503121561056157600080fd5b823561056c81610601565b946020939093013593505050565b60006020828403121561058c57600080fd5b815180151581146101d657600080fd5b6000602082840312156105ae57600080fd5b5035919050565b6020808252600c908201526b155b985d5d1a1bdc9a5e995960a21b604082015260600190565b600082198211156105fc57634e487b7160e01b600052601160045260246000fd5b500190565b6001600160a01b03811681146103bd57600080fdfea26469706673582212207a68e0d42feb38f8422d40f5501d4222011e646258066019d4ac319a3ce7173a64736f6c63430008060033'
const tokenMinter_ItemBasedFixedInflationCore =
  '0x60e06040523360601b6080523480156200001857600080fd5b50604051620015b5380380620015b58339810160408190526200003b9162000771565b8181336001600160a01b0316636addb6636040518163ffffffff1660e01b8152600401604080518083038186803b1580156200007657600080fd5b505afa1580156200008b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620000b19190620005a2565b50600080546001600160a01b0319166001600160a01b0392909216919091179055816200010f5760405162461bcd60e51b81526020600482015260076024820152667365636f6e647360c81b60448201526064015b60405180910390fd5b6200011b8242620007f5565b60018190556040516000907f073d5fd87a7e0c2a384727f9aab2e84826370623aba582638b425a417e799a2c908290a36001600160a01b0381166200018b5760405162461bcd60e51b815260206004820152600560248201526437bbb732b960d91b604482015260640162000106565b6200019681620003d3565b505060008060009054906101000a90046001600160a01b03166001600160a01b0316631836b97d6040518163ffffffff1660e01b815260040160206040518083038186803b158015620001e857600080fd5b505afa158015620001fd573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906200022391906200057d565b6000805460405163898e621960e01b81526001600160a01b03918216600482015292935090919083169063898e62199060240160006040518083038186803b1580156200026f57600080fd5b505afa15801562000284573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052620002ae91908101906200067f565b50508051600380546001600160a01b0319166001600160a01b039092169190911781556020808301518051849392620002ed9260049291019062000425565b50604082015180516200030b91600284019160209091019062000425565b50606082015180516200032991600384019160209091019062000425565b50505060c0829052506040516336a6802f60e01b8152600481018290529091506001600160a01b038316906336a6802f9060240160006040518083038186803b1580156200037657600080fd5b505afa1580156200038b573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052620003b59190810190620005da565b50505060601b6001600160601b03191660a052506200086f92505050565b600280546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b82805462000433906200081c565b90600052602060002090601f016020900481019282620004575760008555620004a2565b82601f106200047257805160ff1916838001178555620004a2565b82800160010185558215620004a2579182015b82811115620004a257825182559160200191906001019062000485565b50620004b0929150620004b4565b5090565b5b80821115620004b05760008155600101620004b5565b80516001600160a01b0381168114620004e357600080fd5b919050565b600082601f830112620004fa57600080fd5b81516001600160401b0381111562000516576200051662000859565b60206200052c601f8301601f19168201620007c2565b82815285828487010111156200054157600080fd5b60005b838110156200056157858101830151828201840152820162000544565b83811115620005735760008385840101525b5095945050505050565b6000602082840312156200059057600080fd5b6200059b82620004cb565b9392505050565b60008060408385031215620005b657600080fd5b620005c183620004cb565b9150620005d160208401620004cb565b90509250929050565b60008060008060808587031215620005f157600080fd5b620005fc85620004cb565b60208601519094506001600160401b03808211156200061a57600080fd5b6200062888838901620004e8565b945060408701519150808211156200063f57600080fd5b6200064d88838901620004e8565b935060608701519150808211156200066457600080fd5b506200067387828801620004e8565b91505092959194509250565b600080600080608085870312156200069657600080fd5b845160208601519094506001600160401b0380821115620006b657600080fd5b9086019060808289031215620006cb57600080fd5b620006d562000797565b620006e083620004cb565b8152602083015182811115620006f557600080fd5b620007038a828601620004e8565b6020830152506040830151828111156200071c57600080fd5b6200072a8a828601620004e8565b6040830152506060830151828111156200074357600080fd5b620007518a828601620004e8565b60608381019190915260408a0151990151979a9199509095505050505050565b600080604083850312156200078557600080fd5b82519150620005d160208401620004cb565b604051608081016001600160401b0381118282101715620007bc57620007bc62000859565b60405290565b604051601f8201601f191681016001600160401b0381118282101715620007ed57620007ed62000859565b604052919050565b600082198211156200081757634e487b7160e01b600052601160045260246000fd5b500190565b600181811c908216806200083157607f821691505b602082108114156200085357634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052604160045260246000fd5b60805160601c60a05160601c60c051610cfb620008ba60003960006106dc0152600081816102d701528181610754015261086701526000818161011201526101940152610cfb6000f3fe608060405234801561001057600080fd5b506004361061009e5760003560e01c8063736e66b911610066578063736e66b91461013e5780638da5cb5b14610151578063e8c235e614610164578063f2fde38b1461016c578063f43098af1461017f57600080fd5b806329dcb0cf146100a35780633443bc71146100bf57806340c10f19146100ea57806367e404ce1461010d578063715018a614610134575b600080fd5b6100ac60015481565b6040519081526020015b60405180910390f35b6000546100d2906001600160a01b031681565b6040516001600160a01b0390911681526020016100b6565b6100fd6100f836600461091f565b610187565b60405190151581526020016100b6565b6100d27f000000000000000000000000000000000000000000000000000000000000000081565b61013c6101dd565b005b61013c61014c366004610a10565b610210565b6002546100d2906001600160a01b031681565b6100d26102be565b61013c61017a3660046108e5565b61035e565b61013c6103d4565b6000336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146101be57600080fd5b60015442106101cc57600080fd5b6101d683836103ec565b9392505050565b6002546001600160a01b0316331461009e5760405162461bcd60e51b815260040161020790610bfd565b60405180910390fd5b6002546001600160a01b0316331461023a5760405162461bcd60e51b815260040161020790610bfd565b600081116102745760405162461bcd60e51b81526020600482015260076024820152667365636f6e647360c81b6044820152606401610207565b6001805490829060006102878385610c23565b909155505060015460405182907f073d5fd87a7e0c2a384727f9aab2e84826370623aba582638b425a417e799a2c90600090a35050565b60405163ab3d047f60e01b8152600160048201526000907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169063ab3d047f9060240160206040518083038186803b15801561032157600080fd5b505afa158015610335573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103599190610902565b905090565b6002546001600160a01b031633146103885760405162461bcd60e51b815260040161020790610bfd565b6001600160a01b0381166103c85760405162461bcd60e51b8152602060048201526007602482015266125b9d985b1a5960ca1b6044820152606401610207565b6103d1816107ec565b50565b60015442116103e257600080fd5b6103ea61083e565b565b604080516001808252818301909252600091829190816020015b6040805161012081018252600060a08201818152606060c0840181905260e084018190526101008401819052908352602083018290529282015281810182905260808101919091528152602001906001900390816104065750506040805160018082528183019092529192506000919060208083019080368337505060408051600180825281830190925292935060009291506020808301908036833701905050905085826000815181106104bd576104bd610c84565b60200260200101906001600160a01b031690816001600160a01b03168152505084816000815181106104f1576104f1610c84565b6020908102919091010152604080516101208101909152600380546001600160a01b031660a083019081526004805484939160c085019161053190610c49565b80601f016020809104026020016040519081016040528092919081815260200182805461055d90610c49565b80156105aa5780601f1061057f576101008083540402835291602001916105aa565b820191906000526020600020905b81548152906001019060200180831161058d57829003601f168201915b505050505081526020016002820180546105c390610c49565b80601f01602080910402602001604051908101604052809291908181526020018280546105ef90610c49565b801561063c5780601f106106115761010080835404028352916020019161063c565b820191906000526020600020905b81548152906001019060200180831161061f57829003601f168201915b5050505050815260200160038201805461065590610c49565b80601f016020809104026020016040519081016040528092919081815260200182805461068190610c49565b80156106ce5780601f106106a3576101008083540402835291602001916106ce565b820191906000526020600020905b8154815290600101906020018083116106b157829003601f168201915b5050509190925250505081527f00000000000000000000000000000000000000000000000000000000000000006020820152600080546001600160a01b03166040830152606082018590526080909101839052845185919061073257610732610c84565b602090810291909101015260405163010581c560e61b81526001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001690634160714090610789908690600401610aea565b600060405180830381600087803b1580156107a357600080fd5b505af11580156107b7573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526107df919081019061094b565b5060019695505050505050565b600280546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b60025460405163039e870760e61b8152600160048201526001600160a01b0391821660248201527f00000000000000000000000000000000000000000000000000000000000000009091169063e7a1c1c090604401602060405180830381600087803b1580156108ad57600080fd5b505af11580156108c1573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103d19190610902565b6000602082840312156108f757600080fd5b81356101d681610cb0565b60006020828403121561091457600080fd5b81516101d681610cb0565b6000806040838503121561093257600080fd5b823561093d81610cb0565b946020939093013593505050565b6000602080838503121561095e57600080fd5b825167ffffffffffffffff8082111561097657600080fd5b818501915085601f83011261098a57600080fd5b81518181111561099c5761099c610c9a565b8060051b604051601f19603f830116810181811085821117156109c1576109c1610c9a565b604052828152858101935084860182860187018a10156109e057600080fd5b600095505b83861015610a035780518552600195909501949386019386016109e5565b5098975050505050505050565b600060208284031215610a2257600080fd5b5035919050565b600081518084526020808501945080840160005b83811015610a625781516001600160a01b031687529582019590820190600101610a3d565b509495945050505050565b600081518084526020808501945080840160005b83811015610a6257815187529582019590820190600101610a81565b6000815180845260005b81811015610ac357602081850181015186830182015201610aa7565b81811115610ad5576000602083870101525b50601f01601f19169290920160200192915050565b60006020808301818452808551808352604092508286019150828160051b87010184880160005b83811015610bef57888303603f190185528151805160a080865281516001600160a01b03169086015288810151608060c08701819052909190610b58610120880184610a9d565b925089820151609f19808986030160e08a0152610b758583610a9d565b6060948501518a82039092016101008b01529450929050610b968484610a9d565b93508b8501518c8901528a8501518b8901528085015192508784038189015250610bc08383610a29565b9250808401519350868303818801525050610bdb8183610a6d565b968901969450505090860190600101610b11565b509098975050505050505050565b6020808252600c908201526b155b985d5d1a1bdc9a5e995960a21b604082015260600190565b60008219821115610c4457634e487b7160e01b600052601160045260246000fd5b500190565b600181811c90821680610c5d57607f821691505b60208210811415610c7e57634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160a01b03811681146103d157600080fdfea264697066735822122065affcc238022adbd3c87ff06a8fcdb7c8fc916994ec14877f6a4dedb217be1e64736f6c63430008060033'
