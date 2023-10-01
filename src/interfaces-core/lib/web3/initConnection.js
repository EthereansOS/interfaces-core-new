import makeBlockie from 'ethereum-blockies-base64'

import { newContract, resetContracts } from './contracts'
import createWeb3 from './createWeb3'
import getNetworkElement from './getNetworkElement'
import blockchainCall from './blockchainCall'

/**
 * Initialize the connection
 * @param environment
 * @param onUpdate
 * @return {Promise<void|{uniswapV2Factory: *, walletAvatar: string | string, web3ForLogs: *, uniswapV2Router: *, wethAddress: *, web3: {currentProvider}, chainId: *, walletAddress: *, proxyChangedTopic: *}>}
 */
async function initConnection(environment, onUpdate, provider) {
  const { context } = environment
  let chainId = environment.chainId
  let web3 = environment.web3
  let web3ForLogs = environment.web3ForLogs
  let uniswapV2Factory = environment.uniswapV2Factory
  let uniswapV2Router = environment.uniswapV2Router
  let wethAddress = environment.wethAddress
  let walletAddress = environment.walletAddress
  let walletAvatar = environment.walletAvatar
  let proxyChangedTopic = environment.proxyChangedTopic

  if (!chainId || chainId !== parseInt(provider.chainId)) {
    resetContracts()

    provider &&
      (provider.enable = () =>
        provider.request({ method: 'eth_requestAccounts' }))
    provider &&
      provider.autoRefreshOnNetworkChange &&
      (provider.autoRefreshOnNetworkChange = false)
    provider &&
      provider.on &&
      (!provider._events ||
        !provider._events.accountsChanged ||
        provider._events.accountsChanged.length === 0) &&
      provider.on('accountsChanged', onUpdate)
    provider &&
      provider.on &&
      (!provider._events ||
        !provider._events.chainChanged ||
        provider._events.chainChanged.length === 0) &&
      provider.on('chainChanged', onUpdate)

    web3 = await createWeb3(provider)
    chainId = await web3.eth.net.getId()
    web3ForLogs = await createWeb3(
      getNetworkElement(
        { context, chainId },
        'blockchainConnectionForLogString'
      ) || web3.currentProvider
    )
    const network = context.ethereumNetwork[chainId]
    if (network === undefined || network === null) {
      return alert('This network is actually not supported!')
    }
    // delete window.tokensList
    // delete window.loadedTokens
    //
    // window.loadOffChainWallets();

    if (context.uniSwapV2FactoryAbi && context.uniSwapV2FactoryAddress) {
      uniswapV2Factory = newContract(
        { web3 },
        context.uniSwapV2FactoryAbi,
        context.uniSwapV2FactoryAddress
      )
    }

    if (context.uniSwapV2RouterAbi && context.uniSwapV2RouterAddress) {
      uniswapV2Router = newContract(
        { web3 },
        context.uniSwapV2RouterAbi,
        context.uniSwapV2RouterAddress
      )
      const callResult = await blockchainCall(
        { web3, context },
        uniswapV2Router.methods.WETH
      )
      wethAddress = web3.utils.toChecksumAddress(callResult)
    }

    proxyChangedTopic =
      proxyChangedTopic || web3.utils.sha3('ProxyChanged(address)')
  }

  const accounts = await web3.eth.getAccounts()
  walletAddress = accounts && accounts.length > 0 ? accounts[0] : null
  walletAvatar = walletAddress ? makeBlockie(walletAddress) : null

  return {
    web3,
    chainId,
    web3ForLogs,
    proxyChangedTopic,
    uniswapV2Factory,
    uniswapV2Router,
    wethAddress,
    walletAddress,
    walletAvatar,
  }
}

export default initConnection
