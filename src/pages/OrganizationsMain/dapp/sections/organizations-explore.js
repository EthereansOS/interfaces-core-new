import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './organizations-main-sections.module.css'
import ExploreOrganizations from '../../../../components/Organizations/ExploreOrganizations/index.js'

const ItemsExplore = (props) => {
  return (
    <>
      <div className={style.OrganizationsExploreMain}>
        <ExploreOrganizations></ExploreOrganizations>
      </div>
    </>
  )
}
export default ItemsExplore
