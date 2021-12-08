import React from 'react'

import {useWeb3, useEthosContext } from '@ethereansos/interfaces-core'
import {loadItemsByFactories} from '../../../logic/itemsV2'
import {loadTokens} from '../../../logic/erc20'

import ItemObjectElement from './element/item-object-element'
import Web3DependantList from '../Web3DependantList'

export default ({onResult, provider, discriminant, allMine, forCollection, excluding, element = ItemObjectElement, wrappedOnly, renderedProperties, hardCabledList}) => {

  const context = useEthosContext()
  const { web3, account, getGlobalContract, newContract, chainId } = useWeb3()

  return <Web3DependantList
    Renderer={element}
    renderedProperties={{...renderedProperties, allMine}}
    provider={() => (provider ? provider() : hardCabledList ? loadTokens({context, chainId, web3, account, newContract, alsoETH : false, listName : hardCabledList}) : loadItemsByFactories({chainId, context, web3, account, newContract, getGlobalContract, collectionData : forCollection, excluding, wrappedOnly, allMine}, getGlobalContract("itemProjectionFactory"))).then(r => {
      onResult && onResult(r)
      return r
    }) }
    discriminant={discriminant || allMine ? account : hardCabledList}
  />
}