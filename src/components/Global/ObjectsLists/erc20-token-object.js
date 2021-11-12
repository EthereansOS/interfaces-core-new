import React from 'react'

import ERC20TokenObjectElement from './element/erc20-token-object-element'
import Web3DependantList from '../Web3DependantList'
import { useWeb3, useEthosContext } from '@ethereansos/interfaces-core'

import { loadTokens } from '../../../logic/erc20'

export default ({alsoETH, searchText}) => {

  const context = useEthosContext()
  const { web3, account, chainId, newContract } = useWeb3()

  return <Web3DependantList
      Renderer={ERC20TokenObjectElement}
      provider={() => loadTokens({ context, chainId, web3, account, newContract, alsoETH })}
      searchText={searchText}
      emptyMessage=''
    />
}