import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './organizations-main-sections.module.css'
import ExploreDelegations from '../../../../components/Organizations/ExploreDelegations/index.js'

const ItemsExplore = (props) => {
  return (
    <>
      <div className={style.OrganizationsExploreMain}>
        <ExploreDelegations></ExploreDelegations>
      </div>
    </>
  )
}


export default ItemsExplore
