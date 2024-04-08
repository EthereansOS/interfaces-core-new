import React from 'react'
import { Link } from 'react-router-dom'

import style from '../../../../all.module.css'
import ExploreItems from '../../../../components/Items/ExploreItems/index.js'
import Banners from '../../../../components/Global/banners/index.js'
import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'

const DecksList = ({}) => (
  <div className={style.SectionMinWidth}>
    <ScrollToTopOnMount />

    {/*<Banners bannerA="banner1" bannerB="banner4" sizeA="30%" sizeB="60%" titleA="NFTs Everywhere" titleB="Unlimited Utilities" linkA="https://docs.ethos.wiki/ethereansos-docs/items/items-learn" linkB="https://docs.ethos.wiki/ethereansos-docs/items/items/item-v2-protocol-overview/deck-items" textA="Decks allow you to wrap NFT Collections into fungible supplies of Items, so that you can use them as if they were any other type of token." textB="Until now, NFTs have been limited by the ERC721 and ERC1155 standards. But built on the Item standard, Decks allow NFT Collections to shift between non-fungible and fungible states so that NFT communities can use them in DeFi, governance and more, and with state of the art capabilities."/>*/}

    <ul className={style.SectionSubMenuItems}>
      <li>
        <Link to="/items">Items</Link>
      </li>
      <li className={style.SectionSubMenuItemsActive}>
        <Link to="/items/decks">Decks</Link>
      </li>
      <li>
        <Link to="/items/collections">
          <a href="#">Collections</a>
        </Link>
      </li>
      <li>
        <Link to="/items/wrap">
          <a href="#">Wrap</a>
        </Link>
      </li>
    </ul>
    <div className={style.ItemsExploreMainTitleArea}>
      <h2 className={style.textGradientHeading}>
        What's trending now in Decks
      </h2>
      <p>Discover the most trending Decks in EthereansOS.</p>
      <div className={style.ItemsExploreMainSearch}>
        <input placeholder="Search decks..." />
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"></path>
          <path
            d="M22 22L20 20"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"></path>
        </svg>
      </div>
    </div>
    <div className={style.ItemsExploreMain}>
      <ExploreItems wrappedOnly={'Deck'} />
    </div>
  </div>
)

DecksList.menuVoice = {
  label: 'Decks',
  path: '/items/decks',
  index: 1,
  contextualRequire: () => require.context('./', false, /.js$/),
}

export default DecksList
