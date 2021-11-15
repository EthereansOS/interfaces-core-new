import React from 'react'

import ExploreItems from '../../../../components/Items/ExploreItems/index.js'

import style from '../items-main-sections.module.css'

const ItemsList = ({wrappedOnly}) => (
  <div className={style.ItemsExploreMain}>
    <ExploreItems wrappedOnly={wrappedOnly}/>
  </div>
)

ItemsList.menuVoice = {
  label : 'Items',
  path : '/dapp',
  index : 0,
  contextualRequire : () => require.context('./', false, /.js$/)
}

export default ItemsList