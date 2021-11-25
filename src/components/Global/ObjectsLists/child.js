import React from 'react'

import ERC20TokenObjectElement from './element/erc20-token-object-element'
import Web3DependantList from '../Web3DependantList'

export default ({list, searchText, renderedProperties}) => {

  return <Web3DependantList
      Renderer={ERC20TokenObjectElement}
      renderedProperties={renderedProperties}
      provider={() => list}
      searchText={searchText}
      emptyMessage=''
    />
}