import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './organizations-main-sections.module.css'

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
