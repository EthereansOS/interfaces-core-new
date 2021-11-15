import React, { useState } from 'react'

import W20 from "./w20"
import W721 from "./w721"
import W1155 from "./w1155"
import DappMenu from '../../../../components/Global/DappMenu'

var wrapVoices = [
  {
    id : "w20",
    label : "Ethereum or ERC-20",
    Component : W20
  }, {
    id : "w721",
    label : "ERC-721",
    Component : W721
  }, {
    id : "w1155",
    label : "ERC-1155",
    Component : W1155
  }
];

var Wrap = () => {
  const [currentVoice, setCurrentVoice] = useState(wrapVoices[0])
  var Component = currentVoice.Component
  return (
    <div>
      <DappMenu voices={wrapVoices.map(it => ({...it, onClick : () => setCurrentVoice(it)}))}/>
      <Component/>
    </div>
  )
}

Wrap.menuVoice = {
  label : 'Wrap',
  path : '/items/dapp/wrap',
}

export default Wrap