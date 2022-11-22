import React from 'react'

import WrapERC20 from "../../../../components/Items/Wrap/ERC20"
import WrapNFT from "../../../../components/Items/Wrap/NFT"
import Wrap from './index'

const wrapVoices = [
  {
    id : "ERC20",
    label : "Ethereum or ERC-20",
    Component : WrapERC20
  }, {
    id : "ERC721",
    label : "ERC-721",
    Component : WrapNFT,
    props : {nftType : 'ERC721'}
  }, {
    id : "ERC1155",
    label : "ERC-1155",
    Component : WrapNFT
  }
]

const WrapItems = () => <Wrap.Wrap voices={wrapVoices}/>

WrapItems.menuVoice = {
  path : '/items/wrap/items',
}

export default WrapItems