import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import { fromDecimals } from '@ethereansos/interfaces-core'
import style from './explore-items.module.css'
import ItemObject from '../../Global/ObjectsLists/item-object'

const Item = ({item}) => (
  <div className={style.ItemSingle}>
    <Link to={`dapp/item/${item.id}`}>
   <figure>
     <img src={item.image}></img>
   </figure>
   <div className={style.ItemTitle}>
     <h6>{item.name}</h6>
   </div>
   <div className={style.ItemInfo}>
     <div className={style.ItemInfoSide}>
       <p>Supply:</p>
       <p>{fromDecimals(item.totalSupply, item.decimals)}</p>
     </div>
     <div className={style.ItemInfoSide2}>
       <p>Price:</p>
       <p>$13</p>
     </div>
  </div>
  </Link>
  </div>
)
const ExploreItems = (props) => {
  return (
    <div className={style.ItemAllSingle}>
      <ItemObject element={Item}/>
    </div>
  )
}

export default ExploreItems
