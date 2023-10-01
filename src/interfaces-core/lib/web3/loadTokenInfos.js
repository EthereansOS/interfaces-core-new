import web3Utils from 'web3-utils'

import { newContract } from './contracts'
import blockchainCall from './blockchainCall'

/**
 * Load token infos
 *
 * @param {Object} adapters - The adapters injected required by the function.
 * @param {web3} adapters.web3 - The web3 instance.
 * @param {EthosContext} adapters.context - The application context.
 * @param addresses
 * @param wethAddress
 * @return {Promise<string[]> | Promise<string>}
 */
async function loadTokenInfos({ web3, context }, addresses, wethAddress) {
  let loadedTokens = {}
  wethAddress =
    wethAddress ||
    (await blockchainCall(
      { web3, context },
      newContract(
        { web3 },
        context.uniSwapV2RouterAbi,
        context.uniSwapV2RouterAddress
      ).methods.WETH
    ))
  wethAddress = web3Utils.toChecksumAddress(wethAddress)
  const single = (typeof addresses).toLowerCase() === 'string'
  addresses = single ? [addresses] : addresses
  const tokens = []
  for (let address of addresses) {
    address = web3Utils.toChecksumAddress(address)
    const token = newContract({ web3 }, context.votingTokenAbi, address)
    tokens.push(
      loadedTokens[address] ||
        (loadedTokens[address] = {
          address,
          token,
          name:
            address === wethAddress
              ? 'Ethereum'
              : await blockchainCall({ web3, context }, token.methods.name),
          symbol:
            address === wethAddress
              ? 'ETH'
              : await blockchainCall({ web3, context }, token.methods.symbol),
          decimals:
            address === wethAddress
              ? '18'
              : await blockchainCall({ web3, context }, token.methods.decimals),
          // TODO move load logo inside core package
          // logo: await loadLogo(
          //   {},
          //   address === wethAddress ? VOID_ETHEREUM_ADDRESS : address
          // ),
        })
    )
  }
  return single ? tokens[0] : tokens
}

export default loadTokenInfos
