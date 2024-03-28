import React from 'react'

import WrapERC20 from '../../../../components/Items/Wrap/ERC20'
import WrapNFT from '../../../../components/Items/Wrap/NFT'
import Wrap from './index'
import style from '../../../../all.module.css'
import { Link } from 'react-router-dom'
import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'

const wrapVoices = [
  {
    id: 'ERC20',
    label: 'Ethereum or ERC-20',
    Component: WrapERC20,
  },
  {
    id: 'ERC721',
    label: 'ERC-721',
    Component: WrapNFT,
    props: { nftType: 'ERC721' },
  },
  {
    id: 'ERC1155',
    label: 'ERC-1155',
    Component: WrapNFT,
  },
]

const WrapItems = () => {
  return (
    <>
      {' '}
      <ScrollToTopOnMount />
      <ul className={style.SectionSubMenuItems}>
        <li>
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
        <li className={style.SectionSubMenuItemsActive}>
          <Link to="/items/wrap">
            <a href="#">Wrap</a>
          </Link>
        </li>
      </ul>
      <div className={style.ItemsExploreMainTitleArea}>
        <h2>Wrap Items</h2>
        <p>Discover the most trending Decks in EthreansOS.</p>
      </div>
      <Wrap.Wrap voices={wrapVoices} />
    </>
  )
}

WrapItems.menuVoice = {
  path: '/items/wrap/items',
}

export default WrapItems
