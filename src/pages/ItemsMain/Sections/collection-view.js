import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './items-main-sections.module.css'
import ItemsList from '../../../components/Items/ExploreItems/index.js'
import DappSubMenu from '../../../components/Global/DappSubMenu/index.js'
import ViewCover from '../../../components/Items/ViewCover/index.js'
import ViewDescription from '../../../components/Items/ViewDescription/index.js'
import ViewInfoBox from '../../../components/Items/ViewInfoBox/index.js'
import SubItemsExplore from '../../../pages/ItemsMain/SubSections/sub-items-explore.js'
import Trade from '../../../components/Global/Trade/index.js'

const CollectionView = (props) => {
  return (
    <>
      <div className={style.SingleContentPage}>
        <div className={style.CollectionLeft}>
          <ViewCover></ViewCover>
          <ViewDescription></ViewDescription>
        </div>
        <div className={style.CollectionRight}>
          <ViewInfoBox></ViewInfoBox>
          <DappSubMenu></DappSubMenu>
          <SubItemsExplore></SubItemsExplore>
        </div>
      </div>
      
    </>
  )
}


export default CollectionView
