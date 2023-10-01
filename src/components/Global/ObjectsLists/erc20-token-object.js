import React, { useMemo } from 'react'

import ERC20TokenObjectElement from './element/erc20-token-object-element'
import Web3DependantList from '../Web3DependantList'
import { web3Utils, useWeb3, useEthosContext } from 'interfaces-core'

import { loadTokens, loadTokenFromAddress } from '../../../logic/erc20'

export default ({renderedProperties, noETH, searchText}) => {

  const context = useEthosContext()
  const { web3, account, chainId, newContract } = useWeb3()

  const tokenAddress = useMemo(() => {
    try {
      return web3Utils.toChecksumAddress(searchText)
    } catch(e) {
    }
  }, [searchText])

  return <Web3DependantList
      Renderer={ERC20TokenObjectElement}
      renderedProperties={renderedProperties}
      provider={() => !tokenAddress ? loadTokens({ context, chainId, web3, account, newContract, alsoETH : noETH !== true }) : loadTokenFromAddress({ context, chainId, web3, account, newContract }, tokenAddress)}
      searchText={tokenAddress ? '' : searchText}
      emptyMessage={tokenAddress ? `No ERC20 Token found for address ${tokenAddress}` : ''}
      discriminant={tokenAddress}
      fixedList
    />
}