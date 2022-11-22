import React from 'react'

import WrapNFT from "../../../../components/Items/Wrap/NFT"
import Wrap from './index'

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
    return <Wrap.Wrap voices={deckWrapVoices}/>
}

WrapDecks.menuVoice = {
  path : '/items/wrap/decks',
}

export default WrapDecks