import React, { useEffect, useState } from 'react'

import { useContextualWeb3 } from '../../../logic/frontend/contextualWeb3'
import {useWeb3, useEthosContext } from '@ethereansos/interfaces-core'
import { CircularProgress } from '@ethereansos/interfaces-ui'
import {loadItemsByFactories} from '../../../logic/backend/itemsV2'
import ItemObjectElement from './element/item-object-element'

const ItemObject = (props) => {

  const Element = props.element || ItemObjectElement

  const { getGlobalContract, newContract } = useContextualWeb3()
  const context = useEthosContext()
  const { web3, account } = useWeb3()

  const [items, setItems] = useState(null)
  const itemProjectionFactory = getGlobalContract("itemProjectionFactory")

  useEffect(() => {
    setItems(null)
    if(!itemProjectionFactory) {
      return
    }
    loadItemsByFactories({context, web3, account, newContract}, itemProjectionFactory).then(setItems)
  }, [itemProjectionFactory])

  return items === null ?
    <CircularProgress/> :
    items.length === 0 ? <div>No items to display</div> :
    <>{items.map(it => <Element key={it.itemId} item={it}/>)}</>
}

export default ItemObject
