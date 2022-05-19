import React from 'react'
import { Link } from 'react-router-dom'

import style from '../../../../all.module.css'
import ExploreItems from '../../../../components/Items/ExploreItems/index.js'
import Banners from '../../../../components/Global/banners/index.js'

const DecksList = ({}) => (<>
  <Banners bannerA="banner1" bannerB="banner4" sizeA="30%" sizeB="60%" titleA="NFTs Everywhere" titleB="Unlimited Utilities" linkA="https://docs.ethos.wiki/ethereansos-docs/items/items-learn" linkB="https://docs.ethos.wiki/ethereansos-docs/items/items/item-v2-protocol-overview/deck-items" textA="Decks allow you to wrap NFT Collections into fungible supplies of Items, so that you can use them as if they were any other type of token." textB="Until now, NFTs have been limited by the ERC721 and ERC1155 standards. But built on the Item standard, Decks allow NFT Collections to shift between non-fungible and fungible states so that NFT communities can use them in DeFi, governance and more, and with state of the art capabilities."/>
  <div className={style.ItemsExploreMain}>
    <ExploreItems wrappedOnly={'Deck'}/>
  </div>
  </>
)

DecksList.menuVoice = {
  label : 'Decks',
  path : '/items/dapp/decks',
  index : 1,
  contextualRequire : () => require.context('./', false, /.js$/)
}

export default DecksList