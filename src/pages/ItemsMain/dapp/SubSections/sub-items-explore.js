import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './items-main-sub-sections.module.css'
import ExploreItems from '../../../../components/Items/ExploreItems/index.js'

const ItemsExplore = (props) => {
  return (
    <>
      <div className={style.ItemsExploreMain}>
        <ExploreItems></ExploreItems>
      </div>
    </>
  )
}


export default ItemsExplore
