import React, { useState } from 'react'

import WrapERC20 from "../../../../components/Items/Wrap/ERC20"
import WrapNFT from "../../../../components/Items/Wrap/NFT"
import DappSubMenu from '../../../../components/Global/DappSubMenu'

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
];

const Wrap = ({}) => {
  const [currentVoice, setCurrentVoice] = useState(wrapVoices[0])
  const { Component, props } = currentVoice
  return (
    <div>
      <DappSubMenu isSelected={it => it.id === currentVoice?.id} voices={wrapVoices.map(it => ({...it, onClick : () => setCurrentVoice(it)}))}/>
      <Component {...props}/>
    </div>
  )
}

Wrap.menuVoice = {
  label : 'Wrap',
  path : '/items/dapp/wrap',
}

export default Wrap