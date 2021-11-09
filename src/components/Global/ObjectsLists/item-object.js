import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'
import Navigation from '../Navigation'
import style from './objects-lists.module.css'
import { useContextualWeb3 } from '../../../logic/frontend/contextualWeb3'
import {useWeb3, useEthosContext } from '@ethereansos/interfaces-core'
import { CircularProgress } from '@ethereansos/interfaces-ui'
import {loadItemsFromFactories} from '../../../logic/backend/itemsV2'
import ItemObjectElement from './element/item-object-element'

const ItemObject = (props) => {

  const Element = props.element || ItemObjectElement

  const { getGlobalContract } = useContextualWeb3()
  const context = useEthosContext()
  const { web3, account, chainId } = useWeb3()

  const [items, setItems] = useState(null)
  const itemProjectionFactory = getGlobalContract("itemProjectionFactory")

  useEffect(() => {
    if(!itemProjectionFactory) {
      return
    }
    setItems(null)
    loadItemsFromFactories({context, web3, account}, itemProjectionFactory).then(setItems)
  }, [itemProjectionFactory])

  return items === null ?
    <CircularProgress/> :
    items.length === 0 ? <div>No items to display</div> :
    <>{items.map(it => <Element key={it.itemId} item={it}/>)}</>
}

export default ItemObject
