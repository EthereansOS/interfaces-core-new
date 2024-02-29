import React from 'react'

import WrapNFT from "../../../../components/Items/Wrap/NFT"
import Wrap from './index'
import style from '../../../../all.module.css'
import { Link } from 'react-router-dom'

const deckWrapVoices = [
  {
    id : "ERC721",
    label : "ERC-721",
    Component : WrapNFT,
    props : {nftType : 'ERC721Deck'}
  }, {
    id : "ERC1155",
    label : "ERC-1155",
    Component : WrapNFT,
    props : {nftType : 'ERC1155Deck'}
  }
]

const WrapDecks = () => {
    return <>
       <ul className={style.SectionSubMenuItems}>
            <li><Link to="/items">Items</Link></li>
            <li ><Link to="/items/decks">Decks</Link></li>
            <li><Link to="/items/collections"><a href="#">Collections</a></Link></li>
            <li className={style.SectionSubMenuItemsActive}><Link to="/items/wrap"><a href="#">Wrap</a></Link></li>
          </ul>
          <div className={style.ItemsExploreMainTitleArea}>
            <h2>Wrap Decks</h2>
            <p>Discover the most trending Decks in EthereanOS.</p>
            
          </div>
          <Wrap.Wrap voices={deckWrapVoices}/>
    </>
   
}

WrapDecks.menuVoice = {
  path : '/items/wrap/decks',
}

export default WrapDecks