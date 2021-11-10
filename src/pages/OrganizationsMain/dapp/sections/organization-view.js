import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './organizations-main-sections.module.css'

const ItemsExplore = (props) => {
  return (
    <>
      <div className={style.SingleContentPage}>
        <div className={style.CollectionLeft}>
          <ViewCover></ViewCover>
          <ViewBasics></ViewBasics>
          <ViewDescription></ViewDescription>
          <ViewProperties></ViewProperties>
        </div>
        <div className={style.CollectionRight}>
          <SubTrade></SubTrade>
          <DappSubMenu></DappSubMenu>
          <SubCollectionExplore></SubCollectionExplore>
        </div>
      </div>
    </>
  )
}


export default ItemsExplore
