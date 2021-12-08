import React from 'react'
import { Link } from 'react-router-dom'
import { formatMoney, fromDecimals } from '@ethereansos/interfaces-core'
import style from '../../../all.module.css'
import ItemObject from '../../Global/ObjectsLists/item-object'
import ItemImage from '../ItemImage'

const Item = ({element, allMine}) => (
  <div className={style.ItemSingle}>
    <Link to={`/items/dapp/${element.address}`}>
      <ItemImage input={element}/>
      <div className={style.ItemTitle}>
        <h6>{element.name}</h6>
      </div>
      <div className={style.ItemInfo}>
        {!allMine && <div className={style.ItemInfoSide}>
          <p>Supply:</p>
          <p>{fromDecimals(element.totalSupply, element.decimals)}</p>
        </div>}
        {allMine && <div className={style.ItemInfoSide}>
          <p>Balance:</p>
          <p>{fromDecimals(element.balance, element.decimals)}</p>
        </div>}
        <div className={style.ItemInfoSide2}>
          <p>Price:</p>
          <p>{element.price ? ("$" + formatMoney(element.price, 2)) : '-'}</p>
        </div>
      </div>
    </Link>
  </div>
)

export default function ExploreItems(props) {
  return (
    <div className={style.ItemAllSingle}>
      <ItemObject {...{...props, element : props.element || Item}}/>
    </div>
  )
}