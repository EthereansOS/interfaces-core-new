import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './organizations-main-sections.module.css'
import OrgHeadline from '../../../../components/Organizations/OrgHeadline'

const ItemsExplore = (props) => {
  return (
    <>
      <div className={style.SingleContentPage}>
        <OrgHeadline></OrgHeadline>
      </div>
    </>
  )
}


export default ItemsExplore
