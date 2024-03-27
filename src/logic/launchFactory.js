import {
    getLogs,
    getTokenPriceInDollarsOnUniswapV3,
    getTokenPriceInDollarsOnSushiSwap,
    getTokenPriceInDollarsOnUniswap,
    cache,
    memoryFetch,
    VOID_ETHEREUM_ADDRESS,
    web3Utils,
    sendAsync,
    blockchainCall,
    abi,
    tryRetrieveMetadata,
    uploadMetadata,
    formatLink,
    VOID_BYTES32,
    toDecimals,
    getNetworkElement,
    async,
    newContract,
    numberToString,
    swap,
    fromDecimals,
    uploadToIPFS,
  } from 'interfaces-core'

  export async function launchFactoryV1(initialData, metadata, imageFile) {

    const { account, getGlobalContract } = initialData

    const itemProjectionFactory = getGlobalContract('itemProjectionFactory')

    var image = await uploadToIPFS(initialData, imageFile)

    var finalMetadata = {...metadata, image}
    delete finalMetadata.totalSupply

    var totalSupply = toDecimals(metadata.totalSupply, 18)
    var name = metadata.name
    var symbol = metadata.symbol

    var uri = await uploadMetadata(initialData, finalMetadata)

    var collectionHeader = {
        host : account,
        name,
        symbol,
        uri
    }

    var createItemHeader = {
        header : { ...collectionHeader },
        collectionId : VOID_BYTES32,
        idemId : 0,
        accounts : [account],
        amounts : [totalSupply]
    }

    var ops = [1, 4]

    var authorized = [account, account]

    var headerType = ['address', 'string', 'string', 'string']

    var headerVal = Object.values(collectionHeader)

    var createItemType = [
      `tuple(${headerType.join(',')})`,
      'bytes32',
      'uint256',
      'address[]',
      'uint256[]',
    ]

    var createItemValue = Object.values(createItemHeader)
    createItemValue[0] = Object.values(createItemValue[0])

    var deployData = abi.encode(['uint256[]', 'address[]'], [ops, authorized])
    deployData = abi.encode(
      [
        'bytes32',
        `tuple(${headerType.join(',')})`,
        `tuple(${createItemType.join(',')})[]`,
        'bytes',
      ],
      [VOID_BYTES32, headerVal, [createItemValue], deployData]
    )
    deployData = abi.encode(
      ['address', 'bytes'],
      [VOID_ETHEREUM_ADDRESS, deployData]
    )
    deployData = abi.encode(['uint256', 'bytes'], [0, deployData])

    var transaction = await blockchainCall(itemProjectionFactory.methods.deploy, deployData)
    var log = transaction.logs.filter(it => it.topics[0] === web3Utils.sha3('CollectionItem(bytes32,bytes32,uint256)'))[0]
    var itemAddress = abi.decode(["address"], log.topics[3])[0].toString()
    console.log(itemAddress)
    return itemAddress
  }