import React from 'react'

import ExploreCollections from '../../../../components/Items/ExploreCollections/'

import style from '../../../../all.module.css'

const Collections = () => (
  <div className={style.ItemsExploreMain}>
    <ExploreCollections/>
  </div>
)

Collections.menuVoice = {
  label : 'Collections',
  path : '/items/dapp/collections',
  contextualRequire : () => require.context('./', false, /.js$/)
}

export default Collections