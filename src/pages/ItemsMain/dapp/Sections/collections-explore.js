import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './../items-main.module.css'
import ExploreCollections from '../../../../components/Items/ExploreCollections/index.js'

const CollectionsExplore = (props) => {
  return (
    <>
      <div className={style.ItemsExploreMain}>
        <ExploreCollections></ExploreCollections>
      </div>
    </>
  )
}

export default CollectionsExplore
