import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './organizations-main-sections.module.css'
import OrgHeadline from '../../../../components/Organizations/OrgHeadline'
import MainSectionView from '../SubSections/main-section-view.js'
import GovernanceSectionView from '../SubSections/governance-section-view.js'
import DappSubMenu from '../../../../components/Global/DappSubMenu/index.js'

const ItemsExplore = (props) => {
  return (
    <>
      <div className={style.SingleContentPage}>
        <OrgHeadline></OrgHeadline>
        <DappSubMenu></DappSubMenu>
        <GovernanceSectionView></GovernanceSectionView>
        
      </div>
    </>
  )
}


export default ItemsExplore
