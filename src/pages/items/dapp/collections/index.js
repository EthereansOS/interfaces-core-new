import React from 'react'

import ExploreCollections from '../../../../components/Items/ExploreCollections/'
import Banners from '../../../../components/Global/banners/index.js'

import style from '../../../../all.module.css'

const Collections = () => (<>
  <Banners bannerA="banner1" bannerB="banner4" sizeA="40%" sizeB="50%" titleA="Overpowered Utilities" titleB="Overpowered Utilities" linkA="https://docs.ethos.wiki/ethereansos-docs/items/items-learn" linkB="https://docs.ethos.wiki/ethereansos-docs/items/items" textA="Items are a new breed of Ethereum tokens. They can do everything all other tokens can and more, and in more secure and dynamic ways." textB="Build your DApp with Items, empowering it with state of the art capabilities while making it natively interoperable with DeFi, NFTs, governance and everything else."/>
  <div className={style.ItemsExploreMain}>
    <ExploreCollections/>
  </div>
  </>
)

Collections.menuVoice = {
  label : 'Collections',
  path : '/items/collections',
  contextualRequire : () => require.context('./', false, /.js$/)
}

export default Collections