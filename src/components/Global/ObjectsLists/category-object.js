import React from 'react'

import {useWeb3, useEthosContext } from '@ethereansos/interfaces-core'
import {loadCollectionsByFactories} from '../../../logic/itemsV2'

import CategoryObjectElement from './element/category-object-element'
import Web3DependantList from '../Web3DependantList'
import { useOpenSea } from '../../../logic/uiUtilities'

export default ({element = CategoryObjectElement, fixedList}) => {

  const context = useEthosContext()
  const { chainId, web3, account, getGlobalContract, newContract } = useWeb3()

  const seaport = useOpenSea()

  return <Web3DependantList
    Renderer={element}
    provider={() => loadCollectionsByFactories({seaport, chainId, context, web3, account, newContract, getGlobalContract}, getGlobalContract("itemProjectionFactory"))}
    fixedList={fixedList}
  />
}