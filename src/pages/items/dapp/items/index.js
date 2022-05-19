import React from 'react'

import ExploreItems from '../../../../components/Items/ExploreItems/index.js'
import Banners from '../../../../components/Global/banners/index.js'

import style from '../../../../all.module.css'

const ItemsList = ({wrappedOnly}) => (<>
    <Banners bannerA="banner1" bannerB="banner4" sizeA="40%" sizeB="50%" titleA="Overpowered Utilities" titleB="Build Overpowered Utilities!" linkA="https://docs.ethos.wiki/ethereansos-docs/items/items-learn" linkB="https://docs.ethos.wiki/ethereansos-docs/items/items" textA="Items are a new breed of Ethereum tokens. They can do everything that other tokens can do and more, more securely and in more dynamic ways." textB="Build your DApp with Items, empowering it with state of the art capabilities while making it natively interoperable with DeFi, NFTs, governance and everything else."/>
    <div className={style.ItemsExploreMain}>
      <ExploreItems wrappedOnly={wrappedOnly}/>
    </div>
  </>
)

ItemsList.menuVoice = {
  label : 'Items',
  path : '/items/dapp',
  index : 0,
  contextualRequire : () => require.context('./', false, /.js$/)
}

export default ItemsList