import React from 'react'

import ExploreItems from '../../../../components/Items/ExploreItems/index.js'

import style from './items-main-sections.module.css'

export default ({wrappedOnly}) => (
  <div className={style.ItemsExploreMain}>
    <ExploreItems wrappedOnly={wrappedOnly}/>
  </div>
)