import React from 'react'

import ExploreItems from '../../../../components/Items/ExploreItems/index.js'
import Banners from '../../../../components/Global/banners/index.js'
import { Link } from 'react-router-dom'
import style from '../../../../all.module.css'
import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'

const ItemsList = ({ wrappedOnly }) => (
  <div className={style.SectionMinWidth}>
    <ScrollToTopOnMount />

    {/*<Banners bannerA="banner1" bannerB="banner4" sizeA="40%" sizeB="50%" titleA="Overpowered Utilities" titleB="Build Overpowered Utilities!" linkA="https://docs.ethos.wiki/ethereansos-docs/items/items-learn" linkB="https://docs.ethos.wiki/ethereansos-docs/items/items" textA="Items are a new breed of Ethereum tokens. They can do everything that other tokens can do and more, more securely and in more dynamic ways." textB="Build your DApp with Items, empowering it with state of the art capabilities while making it natively interoperable with DeFi, NFTs, governance and everything else."/>*/}
    <ul className={style.SectionSubMenuItems}>
      <li className={style.SectionSubMenuItemsActive}>
        <Link to="/items">Items</Link>
      </li>
      <li>
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
      <h2 className={style.textGradientHeading}>What's Trending Now</h2>
      <Link
        to="/items/create"
        className={style.ItemsExploreMainCategoriesCreateElement}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"></path>
          <path
            d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"></path>
          <path
            d="M2.67004 18.9501L7.60004 15.6401C8.39004 15.1101 9.53004 15.1701 10.24 15.7801L10.57 16.0701C11.35 16.7401 12.61 16.7401 13.39 16.0701L17.55 12.5001C18.33 11.8301 19.59 11.8301 20.37 12.5001L22 13.9001"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"></path>
        </svg>
        <span>Create</span>
      </Link>
      <p>Discover the most trending NFT Items in EthereanOS.</p>
      <div className={style.ItemsExploreMainSearch}>
        <input placeholder="Search items..." />
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
    <ul
      className={style.ItemsExploreMainCategories}
      style={{ display: 'none' }}>
      <li className={style.ItemsExploreMainCategoriesActive}>All</li>
      <li>Art</li>
      <li>Video</li>
      <li>Audio</li>
      <li>Collectible</li>
      <li>Voxel</li>
      <li>Document</li>
      <li>Other</li>
      <li className={style.ItemsExploreMainCategoriesCreateElement}>
        <Link to="/items/create" style={{ color: 'white' }}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"></path>
            <path
              d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"></path>
            <path
              d="M2.67004 18.9501L7.60004 15.6401C8.39004 15.1101 9.53004 15.1701 10.24 15.7801L10.57 16.0701C11.35 16.7401 12.61 16.7401 13.39 16.0701L17.55 12.5001C18.33 11.8301 19.59 11.8301 20.37 12.5001L22 13.9001"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"></path>
          </svg>
          <span>Create</span>
        </Link>
      </li>
    </ul>
    <div className={style.ItemsExploreMain}>
      <ExploreItems wrappedOnly={wrappedOnly} />
    </div>
  </div>
)

ItemsList.menuVoice = {
  label: 'Items',
  path: '/items',
  index: 0,
  contextualRequire: () => require.context('./', false, /.js$/),
}

export default ItemsList
