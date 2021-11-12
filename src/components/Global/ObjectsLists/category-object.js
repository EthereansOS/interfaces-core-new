import React from 'react'

import {useWeb3, useEthosContext } from '@ethereansos/interfaces-core'
import {loadCollectionsByFactories} from '../../../logic/itemsV2'

import CategoryObjectElement from './element/category-object-element'
import Web3DependantList from '../Web3DependantList'

export default ({element = CategoryObjectElement}) => {

  const context = useEthosContext()
  const { web3, account, getGlobalContract, newContract } = useWeb3()

  return <Web3DependantList 
    Renderer={element}
    provider={() => loadCollectionsByFactories({context, web3, account, newContract}, getGlobalContract("itemProjectionFactory"))}
  />
}