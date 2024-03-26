import React, { useState } from 'react'

import { Link } from 'react-router-dom'
import DappSubMenu from '../../../../components/Global/DappSubMenu'

import style from '../../../../all.module.css'
import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'

const Wrap = ({ voices }) => {
  const [currentVoice, setCurrentVoice] = useState(voices[0])
  const { Component, props } = currentVoice
  return (
    <div className={style.SmallBoxWidth}>
      <div className={style.CovenantsMainBox}>
        <DappSubMenu
          isSelected={(it) => it.id === currentVoice?.id}
          voices={voices.map((it) => ({
            ...it,
            onClick: () => setCurrentVoice(it),
          }))}
        />
        <Component {...props} />
      </div>
    </div>
  )
}

const WrapIndex = ({}) => {
  return (
    <div className={style.SectionMinWidth}>
      <ScrollToTopOnMount />

      <div>
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
          <h2>Wrap Items or Decks</h2>
          <p>Discover the most trending Decks in EthereanOS.</p>
        </div>
        <div className={style.CreateBoxDesc}>
          <h6>Items</h6>
          <p>
            Wrap any ERC20, ERC721 or ERC1155 as an Item, allowing it to act as
            an ERC20, ERC1155 and as a token with unprecedented capabilities.
          </p>
          <Link
            className={style.footerNextButton}
            style={{ padding: '5px 15px 6px' }}
            to="/items/wrap/items">
            Start
          </Link>
          <a
            target="_blank"
            href="https://docs.ethos.wiki/ethereansos-docs/organizations/organizations"
            className={style.ExtLinkButtonAlpha}>
            Learn
          </a>
        </div>
        <div className={style.CreateBoxDesc}>
          <h6>Decks</h6>
          <p>
            Wrap any ERC721 or ERC1155 into a Deck, a suite of tokens from an
            ERC721 or ERC1155 Collection wrapped into a fungible supply of
            Items.
          </p>
          <Link
            className={style.footerNextButton}
            style={{ padding: '5px 15px 6px' }}
            to="/items/wrap/decks">
            Start
          </Link>
          <a
            target="_blank"
            href="https://docs.ethos.wiki/ethereansos-docs/organizations/organizations"
            className={style.ExtLinkButtonAlpha}>
            Learn
          </a>
        </div>
      </div>
    </div>
  )
}

WrapIndex.Wrap = Wrap

WrapIndex.menuVoice = {
  label: 'Wrap',
  path: '/items/wrap',
  contextualRequire: () => require.context('./', false, /.js$/),
}

export default WrapIndex
