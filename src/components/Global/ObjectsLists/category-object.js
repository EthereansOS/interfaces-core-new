import React from 'react'

import { useContextualWeb3 } from '../../../logic/frontend/contextualWeb3'
import {useWeb3, useEthosContext } from '@ethereansos/interfaces-core'
import {loadCollectionsByFactories} from '../../../logic/backend/itemsV2'

import CategoryObjectElement from './element/category-object-element'
import Web3DependantList from '../../../logic/frontend/web3DependantList'

export default ({element = CategoryObjectElement}) => {

  const { getGlobalContract, newContract } = useContextualWeb3()
  const context = useEthosContext()
  const { web3, account } = useWeb3()

  return <Web3DependantList 
    Renderer={element}
    provider={
      () => loadCollectionsByFactories({context, web3, account, newContract}, getGlobalContract("itemProjectionFactory"))
    }
  />
}