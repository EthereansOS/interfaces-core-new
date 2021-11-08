import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'
import Navigation from '../Navigation'
import style from './objects-lists.module.css'
import { useContextualWeb3 } from '../../../logic/frontend/contextualWeb3'
import {useWeb3, useEthosContext } from '@ethereansos/interfaces-core'
import { CircularProgress } from '@ethereansos/interfaces-ui'
import {loadItemsFromFactories} from '../../../logic/backend/itemsV2'

const ItemObjectSingle = ({item}) => {
  return (
    <a className={style.TokenObject}>
      <figure>
          <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
      </figure>
      <div className={style.ObjectInfo}>
        <div className={style.ObjectInfoAndLink}>
          <h5>{item.name} ({item.symbol})</h5>
          <a>Etherscan</a>
          <a className={style.LinkCool} target="_blank" >Item</a>
        </div>
        <div className={style.ObjectInfoBalance}>
          <p>{0}</p>
          <span>Balance</span>
        </div>
      </div>
    </a>
  )
}

const ItemObject = () => {

  const { getGlobalContract } = useContextualWeb3()
  const context = useEthosContext()
  const { web3, account, chainId } = useWeb3()

  const [items, setItems] = useState(null)
  const itemProjectionFactory = getGlobalContract("itemProjectionFactory")

  useEffect(() => {
    console.log('mario')
    setItems(null)
    loadItemsFromFactories({context, web3, account}, itemProjectionFactory).then(setItems)
  }, [itemProjectionFactory])

  return items === null ?
    <CircularProgress/> :
    items.length === 0 ? <div>No items to display</div> :
    <>{items.map(it => <ItemObjectSingle key={it.itemId} item={it}/>)}</>
}

export default ItemObject
