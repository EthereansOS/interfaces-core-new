import React from 'react'

import {useWeb3, useEthosContext } from 'interfaces-core'
import {loadCollectionsByFactories} from '../../../logic/itemsV2'

import CategoryObjectElement from './element/category-object-element'
import Web3DependantList from '../Web3DependantList'
import { useOpenSea } from '../../../logic/uiUtilities'

export default ({element = CategoryObjectElement, fixedList}) => {

  const context = useEthosContext()
  const web3Data = useWeb3()
  const { getGlobalContract } = web3Data

  const seaport = useOpenSea()

  return <Web3DependantList
    Renderer={element}
    provider={() => loadCollectionsByFactories({seaport, context, ...web3Data}, getGlobalContract("itemProjectionFactory"))}
    fixedList={fixedList}
  />
}