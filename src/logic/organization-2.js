import { abi, VOID_ETHEREUM_ADDRESS, uploadMetadata, formatLink, fromDecimals, toDecimals, getNetworkElement, blockchainCall, web3Utils, sendAsync, tryRetrieveMetadata, VOID_BYTES32, numberToString } from "@ethereansos/interfaces-core"

export async function createOrganization(initialData, inputData) {

    var organizationDeployData
    try {
        organizationDeployData = await buildOrganizationDeployData(initialData, inputData)
        console.log(organizationDeployData)
    } catch(e) {
        console.log(e)
    }

    var deployData
    try {
        deployData = await createOrganizationDeployData(initialData, organizationDeployData)
        console.log(deployData)
    } catch(e) {
        console.log(e)
    }

    var { context, chainId, web3 } = initialData

    var factoryIndex = getNetworkElement({ context, chainId }, "factoryIndices").organization
    var factoryOfFactories = new web3.eth.Contract(context.FactoryOfFactoriesABI, getNetworkElement({ context, chainId}, "factoryOfFactoriesAddress"))
    var organizationFactoryAddress = await blockchainCall(factoryOfFactories.methods.get, factoryIndex)
    organizationFactoryAddress = organizationFactoryAddress.factoryList
    organizationFactoryAddress = organizationFactoryAddress[organizationFactoryAddress.length -1]

    var organizationFactory = new web3.eth.Contract(context.IDFOFactoryABI, organizationFactoryAddress)


    var transaction = await blockchainCall(organizationFactory.methods.deploy, deployData)

    var log = transaction.logs.filter(it => it.topics[0] = web3Utils.sha3('Deployed(address,address,address,bytes)'))
    log = log[log.length - 1]
    var address = log.topics[2]
    address = abi.decode(["address"], address)[0].toString()

    return address
}

async function buildOrganizationDeployData(initialData, inputData) {
    console.log(inputData)

    var { context } = initialData

    var tokenAddress = web3Utils.toChecksumAddress(inputData.governance.token.address)
    var organizationUri = await uploadOrganizationMetadata(initialData, inputData.metadata)
    var proposalsManagerLazyInitData = inputData.governance
    var fixedInflationManagerLazyInitData
    if(inputData.fixedInflation) {
        fixedInflationManagerLazyInitData = {
            tokenMinterOwner : inputData.fixedInflation.tokenMinterOwner,
            _bootstrapFundWalletAddress : inputData.fixedInflation._bootstrapFundWalletAddress,
            _bootstrapFundIsRaw : inputData.fixedInflation._bootstrapFundIsRaw,
            _bootstrapFundWalletPercentage : inputData.fixedInflation._bootstrapFundWalletPercentage,
            firstExecution : stringToDate(inputData.fixedInflation.firstExecution),
            ammPlugin : inputData.fixedInflation.amm.address,
            inflationPercentage : inputData.fixedInflation.inflationPercentage0,
            swapPath : [inputData.fixedInflation.amm.ethereumAddress],
            liquidityPoolAddresses : [
                await retrieveLiquidityPoolAddress(initialData, [tokenAddress, inputData.fixedInflation.amm.ethereumAddress], inputData.fixedInflation.amm, inputData.fixedInflation.uniV3Pool)
            ],
            inflationPercentages : [
                inputData.fixedInflation.inflationPercentage0,
                inputData.fixedInflation.inflationPercentage1,
                inputData.fixedInflation.inflationPercentage2,
                inputData.fixedInflation.inflationPercentage3,
                inputData.fixedInflation.inflationPercentage4
            ]
        }
        fixedInflationManagerLazyInitData._rawTokenComponentKeys = inputData.fixedInflation._rawTokenComponents.map(it => context.grimoire[it.component])
        fixedInflationManagerLazyInitData._rawTokenComponentsPercentages = inputData.fixedInflation._rawTokenComponents.map(it => it.percentage)
        fixedInflationManagerLazyInitData._swappedTokenComponentKeys = inputData.fixedInflation._swappedTokenComponents.map(it => context.grimoire[it.component])
        fixedInflationManagerLazyInitData._swappedTokenComponentsPercentages = inputData.fixedInflation._swappedTokenComponents.map(it => it.percentage)
        fixedInflationManagerLazyInitData._swappedTokenComponentsPercentages.pop()
    }
    var treasurySplitterManagerLazyInitData = {
        splitInterval : inputData.treasurySplitter.splitInterval,
        firstSplitEvent : stringToDate(inputData.treasurySplitter.firstSplitEvent),
        keys : inputData.treasurySplitter.components.map(it => context.grimoire[it.component]),
        percentages : inputData.treasurySplitter.components.map(it => it.percentage)
    }
    treasurySplitterManagerLazyInitData.percentages.pop()

    var delegationsManagerLazyInitData = {
        attachInsurance : inputData.delegationsManager.attachInsurance
    }

    var investmentsManagerLazyInitData = {
        swapToEtherInterval : inputData.investmentsManager.swapToEtherInterval,
        firstSwapToEtherEvent : stringToDate(inputData.investmentsManager.firstSwapToEtherEvent),
        operations : [...(await Promise.all(inputData.investmentsManager.fromETH.map(async it => ({
            ammPlugin : it.amm.address,
            liquidityPoolAddresses : [
                await retrieveLiquidityPoolAddress(initialData, [it.token.address, it.amm.ethereumAddress], it.amm, it.uniV3Pool)
            ],
            swapPath : [it.token.address],
            receivers : it.burn ? [] : [VOID_ETHEREUM_ADDRESS]
        })))), ...(await Promise.all(inputData.investmentsManager.toETH.map(async it => ({
            inputTokenAddress : it.token.address,
            inputTokenAmount : toDecimals(it.percentage / 100, 18),
            ammPlugin : it.amm.address,
            liquidityPoolAddresses : [
                await retrieveLiquidityPoolAddress(initialData, [it.token.address, it.amm.ethereumAddress], it.amm, it.uniV3Pool)
            ],
            swapPath : [it.amm.ethereumAddress]
        }))))]
    }

    var proposalModelsData = {
        fixedInflation : fixedInflationManagerLazyInitData ? {
            ...inputData.fixedInflation.proposalRules,
            presetValues : fixedInflationManagerLazyInitData.inflationPercentages
        } : undefined,
        treasuryManager : {...inputData.treasuryManager.proposalRules, maxPercentagePerToken : inputData.treasuryManager.maxPercentagePerToken},
        delegationsManager : {...inputData.delegationsManager.proposalRules},
        changeInvestmentsManagerTokensFromETHList : {...inputData.investmentsManager.proposalRules},
        changeInvestmentsManagerTokensToETHList : {...inputData.investmentsManager.proposalRules, maxPercentagePerToken : inputData.investmentsManager.maxPercentagePerToken}
    }

    return {
        tokenAddress,
        organizationUri,
        proposalsManagerLazyInitData,
        fixedInflationManagerLazyInitData,
        treasurySplitterManagerLazyInitData,
        delegationsManagerLazyInitData,
        investmentsManagerLazyInitData,
        proposalModelsData
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

async function retrieveLiquidityPoolAddress(initialData, tokens, amm, uniV3Pool) {

    tokens = tokens.map(it => web3Utils.toChecksumAddress(it.address || it))
    if(amm.name !== 'UniswapV3') {
        return (await blockchainCall(amm.contract.methods.byTokens, tokens))[2]
    }
    return await blockchainCall(amm.factory.methods.getPool, tokens[0], tokens[1], uniV3Pool)
}

async function createOrganizationDeployData(initialData, organizationDeployData) {

    var { tokenAddress, organizationUri, proposalsManagerLazyInitData, fixedInflationManagerLazyInitData, treasurySplitterManagerLazyInitData, delegationsManagerLazyInitData, investmentsManagerLazyInitData } = organizationDeployData

    proposalsManagerLazyInitData && (proposalsManagerLazyInitData.tokenAddress = tokenAddress)
    delegationsManagerLazyInitData.tokenAddress = tokenAddress
    fixedInflationManagerLazyInitData && (fixedInflationManagerLazyInitData.tokenAddress = tokenAddress)

    proposalsManagerLazyInitData = await createProposalsManagerLazyInitData(proposalsManagerLazyInitData)
    fixedInflationManagerLazyInitData = await createFixedInflationManagerLazyInitData(initialData, fixedInflationManagerLazyInitData)
    treasurySplitterManagerLazyInitData = await createTreasurySplitterManagerLazyInitData(initialData, treasurySplitterManagerLazyInitData)
    delegationsManagerLazyInitData = await createDelegationsManagerLazyInitData(initialData, delegationsManagerLazyInitData)
    investmentsManagerLazyInitData = await createInvestmentsManagerLazyInitData(initialData, investmentsManagerLazyInitData)

    var mandatoryComponentsDeployData = [proposalsManagerLazyInitData]
    var additionalComponents = [1, 5, 6, 7]
    var additionalComponentsDeployData = ['0x', treasurySplitterManagerLazyInitData, delegationsManagerLazyInitData, investmentsManagerLazyInitData]
    var specialComponentsData = []
    var specificOrganizationData = await createSubDAOProposalModels(initialData, organizationDeployData.proposalModelsData)

    if(fixedInflationManagerLazyInitData != '0x') {
        additionalComponents = [...additionalComponents.slice(0, 1), 4, ...additionalComponents.slice(1)]
        additionalComponentsDeployData = [...additionalComponentsDeployData.slice(0, 1), fixedInflationManagerLazyInitData, ...additionalComponentsDeployData.slice(1)]
    }

    var organizationDeployData = {
        uri : organizationUri,
        mandatoryComponentsDeployData,
        additionalComponents,
        additionalComponentsDeployData,
        specialComponentsData,
        specificOrganizationData
    }

    var type = 'tuple(string,bytes[],uint256[],bytes[],bytes[],bytes)'
    var deployData = abi.encode([type], [Object.values(organizationDeployData)])

    return deployData
}

function createProposalRules(data) {

    var {proposalDuration, hardCapPercentage, quorumPercentage, validationBomb} = data

    var canTerminateAddresses = []
    var validatorsAddresses = []
    var canTerminateData = []
    var validatorsData = []

    if(proposalDuration) {
        canTerminateAddresses.push(1)
        canTerminateData.push(abi.encode(["uint256"], [proposalDuration]))
    }

    if(hardCapPercentage) {
        canTerminateAddresses.push(2)
        canTerminateData.push(abi.encode(["uint256", "bool"], [toDecimals(hardCapPercentage / 100, 18), true]))
    }

    if(quorumPercentage) {
        validatorsAddresses.push(3)
        validatorsData.push(abi.encode(["uint256", "bool"], [toDecimals(quorumPercentage / 100, 18), true]))
    }

    if(validationBomb) {
        validatorsAddresses.push(4)
        validatorsData.push(abi.encode(["uint256"], [validationBomb]))
    }

    canTerminateAddresses = canTerminateAddresses.map(it => abi.decode(["address"], abi.encode(["uint256"], [it]))[0].toString())
    validatorsAddresses = validatorsAddresses.map(it => abi.decode(["address"], abi.encode(["uint256"], [it]))[0].toString())

    return {
        canTerminateAddresses,
        validatorsAddresses,
        canTerminateData,
        validatorsData
    }
}

async function createProposalsManagerLazyInitData(data) {

    var {tokenAddress, host} = data

    var {
        canTerminateAddresses,
        validatorsAddresses,
        canTerminateData,
        validatorsData
    } = createProposalRules(data)

    var tokens = tokenAddress
    tokens = tokens && (Array.isArray(tokens) ? tokens : [tokens])

    var proposalConfiguration = {
        collections : tokens.map(() => VOID_ETHEREUM_ADDRESS),
        objectIds : tokens.map(it => abi.decode(["uint256"], abi.encode(["address"], [it]))[0].toString()),
        weights : tokens.map(() => 1),
        creationRules : VOID_ETHEREUM_ADDRESS,
        triggeringRules : VOID_ETHEREUM_ADDRESS,
        canTerminateAddresses,
        validatorsAddresses,
        creationData : !host || host === VOID_ETHEREUM_ADDRESS ? '0x' : abi.encode(["address", "bool"], [host, true]),
        triggeringData : '0x',
        canTerminateData,
        validatorsData
    }

    var type = 'tuple(address[],uint256[],uint256[],address,address,address[],address[],bytes,bytes,bytes[],bytes[])'

    var data = abi.encode([type], [Object.values(proposalConfiguration)])

    return data
}

async function createFixedInflationManagerLazyInitData(initialData, data) {

    if(!data) {
        return '0x'
    }

    var { context, chainId } = initialData

    var { tokenAddress, tokenMinterOwner, inflationPercentage, _bootstrapFundWalletAddress, _bootstrapFundIsRaw, _bootstrapFundWalletPercentage, _rawTokenComponentKeys, _rawTokenComponentsPercentages, _swappedTokenComponentKeys, _swappedTokenComponentsPercentages, ammPlugin, liquidityPoolAddresses, swapPath, firstExecution } = data

    var executorRewardPercentage = context.executorRewardPercentage
    var prestoAddress = getNetworkElement({ context, chainId}, "prestoAddress")
    var tokenMinter = await createFixedInflationTokenMinter(initialData, tokenAddress, tokenMinterOwner)
    var lazyInitData = []
    inflationPercentage = toDecimals(inflationPercentage / 100, 18)
    _bootstrapFundWalletPercentage = toDecimals(_bootstrapFundWalletPercentage / 100, 18)
    var _bootstrapFundWalletOwner = _bootstrapFundWalletAddress
    var _defaultBootstrapFundComponentKey = VOID_BYTES32
    var executionInterval = getNetworkElement({context, chainId}, "fixedInflationExecutionInterval")
    _rawTokenComponentKeys = _rawTokenComponentKeys || []
    _rawTokenComponentsPercentages = (_rawTokenComponentsPercentages || []).map(it => toDecimals(it / 100, 18))
    _swappedTokenComponentKeys = _swappedTokenComponentKeys || []
    _swappedTokenComponentsPercentages = (_swappedTokenComponentsPercentages || []).map(it => toDecimals(it / 100, 18))
    lazyInitData.push(abi.encode(["address", "uint256", "address", "bytes"], [prestoAddress, executorRewardPercentage, tokenAddress, tokenMinter]))
    lazyInitData.push(abi.encode(["uint256", "uint256", "uint256"], [inflationPercentage, executionInterval, firstExecution || 0]))
    lazyInitData.push(abi.encode(["address", "address", "uint256", "bool", "bytes32"], [_bootstrapFundWalletOwner, _bootstrapFundWalletAddress, _bootstrapFundWalletPercentage, _bootstrapFundIsRaw || false, _defaultBootstrapFundComponentKey]))
    lazyInitData.push(abi.encode(["bytes32[]", "uint256[]", "bytes32[]", "uint256[]"], [_rawTokenComponentKeys, _rawTokenComponentsPercentages, _swappedTokenComponentKeys, _swappedTokenComponentsPercentages]))
    lazyInitData.push(abi.encode(["address", "address[]", "address[]"], [ammPlugin, liquidityPoolAddresses, swapPath]))
    lazyInitData = abi.encode(["bytes[]"], [lazyInitData])
    return lazyInitData
}

async function createFixedInflationTokenMinter(initialData, tokenAddress, owner) {
    if(!owner) {
        return VOID_ETHEREUM_ADDRESS
    }

    var { web3, context } = initialData

    tokenAddress = web3Utils.toChecksumAddress(tokenAddress)

    var TokenMinter = await getTokenMinter()
    var deployData = new web3.eth.Contract(TokenMinter.abi).deploy({ data: TokenMinter.bin, arguments : [context.grimoire.COMPONENT_KEY_FIXED_INFLATION_MANAGER, tokenAddress, owner || VOID_ETHEREUM_ADDRESS]}).encodeABI()
    return deployData
}

async function createTreasurySplitterManagerLazyInitData(initialData, data) {

    var { context } = initialData

    var { keys, percentages, splitInterval, firstSplitEvent } = data

    var executorRewardPercentage = context.executorRewardPercentage
    var flushExecutorRewardPercentage = context.executorRewardPercentage
    var _flushKey = VOID_BYTES32
    percentages = percentages.map(it => toDecimals(it / 100, 18))
    var lazyInitData = abi.encode(["uint256", "uint256", "bytes32[]", "uint256[]", "bytes32", "uint256", "uint256"], [firstSplitEvent || 0, splitInterval, keys, percentages, _flushKey, flushExecutorRewardPercentage, executorRewardPercentage])

    return lazyInitData
}

async function createDelegationsManagerLazyInitData(initialData, data) {

    var { chainId, context, web3 } = initialData

    var { tokenAddress, attachInsurance } = data

    var flusherKey = context.grimoire.COMPONENT_KEY_TREASURY_SPLITTER_MANAGER
    var executorRewardPercentage = context.executorRewardPercentage

    var factoryOfFactories = new web3.eth.Contract(context.FactoryOfFactoriesABI, getNetworkElement({context, chainId}, "factoryOfFactoriesAddress"))

    var list = await factoryOfFactories.methods.get(getNetworkElement({context, chainId}, "factoryIndices").delegation).call()
    list = [...list[1]]

    var decimals = await getTokenDecimals(initialData, tokenAddress)
    attachInsurance = toDecimals(attachInsurance || 0, decimals)

    var lazyInitData = abi.encode(["address[]", "address[]"], [list, []])
    lazyInitData = abi.encode(["uint256", "address", "bytes32", "bytes"], [attachInsurance, VOID_ETHEREUM_ADDRESS, flusherKey, lazyInitData])
    lazyInitData = abi.encode(["uint256", "address", "uint256", "bytes"], [executorRewardPercentage, VOID_ETHEREUM_ADDRESS, abi.decode(["uint256"], abi.encode(["address"], [tokenAddress]))[0].toString(), lazyInitData])

    return lazyInitData
}

async function createInvestmentsManagerLazyInitData(initialData, data) {

    var { context, chainId } = initialData

    var { operations, swapToEtherInterval, firstSwapToEtherEvent } = data

    operations = operations.map(it => ({
        inputTokenAddress : it.inputTokenAddress || VOID_ETHEREUM_ADDRESS,
        inputTokenAmount : it.inputTokenAmount || 0,
        ammPlugin : it.ammPlugin,
        liquidityPoolAddresses : it.liquidityPoolAddresses,
        swapPath : it.swapPath,
        enterInETH : false,
        exitInETH : false,
        tokenMins : [],
        receivers : it.receivers || [],
        receiversPercentages : []
    }))

    var executorRewardPercentage = context.executorRewardPercentage
    var prestoAddress = getNetworkElement({ context, chainId}, "prestoAddress")
    var _organizationComponentKey = context.grimoire.COMPONENT_KEY_TREASURY_SPLITTER_MANAGER
    var type = 'tuple(address,uint256,address,address[],address[],bool,bool,uint256[],address[],uint256[])[]'
    operations = abi.encode([type], [operations.map(it => Object.values(it))])

    var lazyInitData = abi.encode(["bytes32", "uint256", "address", "uint256", "uint256", "bytes"], [_organizationComponentKey, executorRewardPercentage, prestoAddress, firstSwapToEtherEvent || 0, swapToEtherInterval, operations])

    return lazyInitData
}

async function createSubDAOProposalModels(initialData, proposalModelsData) {

    var { context } = initialData

    Object.values(proposalModelsData).forEach(it => it && (it.proposalRules = createProposalRules(it)))
    var subDAOProposalModels = []
    subDAOProposalModels = [...subDAOProposalModels, {
        source: VOID_ETHEREUM_ADDRESS,
        uri : '',
        isPreset : false,
        presetValues : [
            abi.encode(["uint256"], [toDecimals(proposalModelsData.treasuryManager.maxPercentagePerToken / 100, 18)])
        ],
        presetProposals : [],
        creationRules : VOID_ETHEREUM_ADDRESS,
        triggeringRules : VOID_ETHEREUM_ADDRESS,
        votingRulesIndex : 0,
        canTerminateAddresses : [proposalModelsData.treasuryManager.proposalRules.canTerminateAddresses],
        validatorsAddresses : [proposalModelsData.treasuryManager.proposalRules.validatorsAddresses],
        creationData : '0x',
        triggeringData : '0x',
        canTerminateData : [proposalModelsData.treasuryManager.proposalRules.canTerminateData],
        validatorsData : [proposalModelsData.treasuryManager.proposalRules.validatorsData]
    }, {
        source: VOID_ETHEREUM_ADDRESS,
        uri : '',
        isPreset : false,
        presetValues : [],
        presetProposals : [],
        creationRules : VOID_ETHEREUM_ADDRESS,
        triggeringRules : VOID_ETHEREUM_ADDRESS,
        votingRulesIndex : 0,
        canTerminateAddresses : [proposalModelsData.delegationsManager.proposalRules.canTerminateAddresses],
        validatorsAddresses : [proposalModelsData.delegationsManager.proposalRules.validatorsAddresses],
        creationData : '0x',
        triggeringData : '0x',
        canTerminateData : [proposalModelsData.delegationsManager.proposalRules.canTerminateData],
        validatorsData : [proposalModelsData.delegationsManager.proposalRules.validatorsData]
    }, {
        source: VOID_ETHEREUM_ADDRESS,
        uri : '',
        isPreset : false,
        presetValues : [
            abi.encode(["uint256"], [context.investmentsManagerMaxTokens])
        ],
        presetProposals : [],
        creationRules : VOID_ETHEREUM_ADDRESS,
        triggeringRules : VOID_ETHEREUM_ADDRESS,
        votingRulesIndex : 0,
        canTerminateAddresses : [proposalModelsData.changeInvestmentsManagerTokensFromETHList.proposalRules.canTerminateAddresses],
        validatorsAddresses : [proposalModelsData.changeInvestmentsManagerTokensFromETHList.proposalRules.validatorsAddresses],
        creationData : '0x',
        triggeringData : '0x',
        canTerminateData : [proposalModelsData.changeInvestmentsManagerTokensFromETHList.proposalRules.canTerminateData],
        validatorsData : [proposalModelsData.changeInvestmentsManagerTokensFromETHList.proposalRules.validatorsData]
    }, {
        source: VOID_ETHEREUM_ADDRESS,
        uri : '',
        isPreset : false,
        presetValues : [
            abi.encode(["uint256", "uint256"], [context.investmentsManagerMaxTokens, toDecimals(proposalModelsData.changeInvestmentsManagerTokensToETHList.maxPercentagePerToken / 100, 18)])
        ],
        presetProposals : [],
        creationRules : VOID_ETHEREUM_ADDRESS,
        triggeringRules : VOID_ETHEREUM_ADDRESS,
        votingRulesIndex : 0,
        canTerminateAddresses : [proposalModelsData.changeInvestmentsManagerTokensToETHList.proposalRules.canTerminateAddresses],
        validatorsAddresses : [proposalModelsData.changeInvestmentsManagerTokensToETHList.proposalRules.validatorsAddresses],
        creationData : '0x',
        triggeringData : '0x',
        canTerminateData : [proposalModelsData.changeInvestmentsManagerTokensToETHList.proposalRules.canTerminateData],
        validatorsData : [proposalModelsData.changeInvestmentsManagerTokensToETHList.proposalRules.validatorsData]
    }]

    if(proposalModelsData.fixedInflation) {
        subDAOProposalModels = [...subDAOProposalModels, {
            source: VOID_ETHEREUM_ADDRESS,
            uri : '',
            isPreset : true,
            presetValues : proposalModelsData.fixedInflation.presetValues.map(it => abi.encode(["uint256"], [toDecimals(it / 100, 18)])),
            presetProposals : [],
            creationRules : VOID_ETHEREUM_ADDRESS,
            triggeringRules : VOID_ETHEREUM_ADDRESS,
            votingRulesIndex : 0,
            canTerminateAddresses : [proposalModelsData.fixedInflation.proposalRules.canTerminateAddresses],
            validatorsAddresses : [proposalModelsData.fixedInflation.proposalRules.validatorsAddresses],
            creationData : '0x',
            triggeringData : '0x',
            canTerminateData : [proposalModelsData.fixedInflation.proposalRules.canTerminateData],
            validatorsData : [proposalModelsData.fixedInflation.proposalRules.validatorsData]
        }]
    }

    var type = 'tuple(address,string,bool,bytes[],bytes32[],address,address,uint256,address[][],address[][],bytes,bytes,bytes[][],bytes[][])[]'

    subDAOProposalModels = abi.encode([type], [subDAOProposalModels.map(Object.values)])

    return subDAOProposalModels
}

async function getTokenMinter() {
    var TokenMinter = {}
    TokenMinter.abi = [{"inputs":[{"internalType":"bytes32","name":"_componentKey","type":"bytes32"},{"internalType":"address","name":"_tokenAddress","type":"address"},{"internalType":"address","name":"_owner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"componentKey","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"host","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tokenAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferTokenOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]
    TokenMinter.bin = "60e060405234801561001057600080fd5b5060405161066738038061066783398101604081905261002f91610128565b8260808181525050336001600160a01b031663f437bc596040518163ffffffff1660e01b815260040160206040518083038186803b15801561007057600080fd5b505afa158015610084573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906100a89190610106565b606090811b6001600160601b031990811660a05292901b90911660c052600080546001600160a01b0319166001600160a01b0390921691909117905550610164565b80516001600160a01b038116811461010157600080fd5b919050565b60006020828403121561011857600080fd5b610121826100ea565b9392505050565b60008060006060848603121561013d57600080fd5b8351925061014d602085016100ea565b915061015b604085016100ea565b90509250925092565b60805160a05160601c60c05160601c6104b36101b460003960008181610114015281816101c2015261032601526000818161014e015261026001526000818160af015261023001526104b36000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c80638da5cb5b1161005b5780638da5cb5b146100e45780639d76ea581461010f578063f2fde38b14610136578063f437bc591461014957600080fd5b806321e6b53d1461008257806340c10f19146100975780638d8a0014146100aa575b600080fd5b6100956100903660046103d2565b610170565b005b6100956100a5366004610413565b610221565b6100d17f000000000000000000000000000000000000000000000000000000000000000081565b6040519081526020015b60405180910390f35b6000546100f7906001600160a01b031681565b6040516001600160a01b0390911681526020016100db565b6100f77f000000000000000000000000000000000000000000000000000000000000000081565b6100956101443660046103d2565b610386565b6100f77f000000000000000000000000000000000000000000000000000000000000000081565b6000546001600160a01b031633146101a35760405162461bcd60e51b815260040161019a9061043f565b60405180910390fd5b60405163f2fde38b60e01b81526001600160a01b0382811660048301527f0000000000000000000000000000000000000000000000000000000000000000169063f2fde38b90602401600060405180830381600087803b15801561020657600080fd5b505af115801561021a573d6000803e3d6000fd5b5050505050565b60405163023aa9ab60e61b81527f0000000000000000000000000000000000000000000000000000000000000000600482015233906001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001690638eaa6ac09060240160206040518083038186803b1580156102a257600080fd5b505afa1580156102b6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102da91906103f6565b6001600160a01b0316146103005760405162461bcd60e51b815260040161019a9061043f565b6040516340c10f1960e01b81526001600160a01b038381166004830152602482018390527f000000000000000000000000000000000000000000000000000000000000000016906340c10f1990604401600060405180830381600087803b15801561036a57600080fd5b505af115801561037e573d6000803e3d6000fd5b505050505050565b6000546001600160a01b031633146103b05760405162461bcd60e51b815260040161019a9061043f565b600080546001600160a01b0319166001600160a01b0392909216919091179055565b6000602082840312156103e457600080fd5b81356103ef81610465565b9392505050565b60006020828403121561040857600080fd5b81516103ef81610465565b6000806040838503121561042657600080fd5b823561043181610465565b946020939093013593505050565b6020808252600c908201526b1d5b985d5d1a1bdc9a5e995960a21b604082015260600190565b6001600160a01b038116811461047a57600080fd5b5056fea2646970667358221220ddfea61499e9f3bfd073fd579bdf655d80bb763afcd1c3482d2a5b0513d234b764736f6c63430008060033"
    return TokenMinter
}

async function getTokenDecimals(initialData, tokenAddress) {

    var { web3 } = initialData

    var response = await web3.eth.call({
        to : tokenAddress,
        data : web3Utils.sha3('decimals()').substring(0, 10)
    })

    response = abi.decode(["uint256"], response)[0].toString()
    return parseInt(response)
}