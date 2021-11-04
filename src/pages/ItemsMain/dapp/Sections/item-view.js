import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './items-main-sections.module.css'
import ItemsList from '../../../../components/Items/ExploreItems/index.js'
import DappSubMenu from '../../../../components/Global/DappSubMenu/index.js'
import ViewCover from '../../../../components/Items/ViewCover/index.js'
import ViewDescription from '../../../../components/Items/ViewDescription/index.js'
import ViewProperties from '../../../../components/Items/ViewProperties/index.js'
import ViewBasics from '../../../../components/Items/ViewBasics/index.js'
import SubTrade from '../SubSections/sub-trade.js'
import ModalStandard from '../../../../components/Global/ModalStandard/index.js'
import ObjectsLists from '../../../../components/Global/ObjectsLists'
import MetadataSection from '../../../../components/Global/MetadataSection/index.js'
import SubCollectionExplore from '../SubSections/sub-collection-explore.js'

const CollectionView = (props) => {
  return (
    <>
    <ModalStandard>
      <ObjectsLists/>
    </ModalStandard>
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


export default CollectionView
