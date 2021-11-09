import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './explore-items.module.css'
import ItemObject from '../../Global/ObjectsLists/item-object'

const Item = ({item}) => (
  <div className={style.ItemSingle}>
   <figure>
     <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
   </figure>
   <div className={style.ItemTitle}>
     <h6>I'm a fancy Item</h6>
   </div>
   <div className={style.ItemInfo}>
     <div className={style.ItemInfoSide}>
       <p>Supply:</p>
       <p>1,000,000</p>
     </div>
     <div className={style.ItemInfoSide2}>
       <p>Price:</p>
       <p>$13</p>
     </div>
  </div>
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
