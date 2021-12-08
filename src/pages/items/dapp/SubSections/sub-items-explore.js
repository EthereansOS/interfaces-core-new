import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from '../../../../all.module.css'
import ExploreItems from '../../../../components/Items/ExploreItems/index.js'

const ItemsExplore = ({collection}) => {
  return (
    <div className={style.ItemsExploreMain}>
      <ExploreItems forCollection={collection}/>
    </div>
  )
}

export default ItemsExplore