import React from 'react'

import { useEthosContext, useWeb3, getNetworkElement } from '@ethereansos/interfaces-core'

import ExtLinkButton from '../../Global/ExtLinkButton/index.js'

import style from '../../../all.module.css'

export default ({collection}) => {

  const context = useEthosContext()

  const { chainId } = useWeb3()

  return (
    <div className={style.InfoBox}>
      <h1>{collection.name + (collection.symbol ? ` (${collection.symbol})` : "")}</h1>
      <div className={style.InfoBoxBtns}>
        <ExtLinkButton href={getNetworkElement({context, chainId}, 'etherscanURL') + 'address/' + collection.mainInterface.options.address} text="Contract"/> {/* Contract - Contract Link */}
        <ExtLinkButton href={collection.external_url} text="Website"/> {/* Website - Website Link */}
        <ExtLinkButton href={getNetworkElement({context, chainId}, 'etherscanURL') + 'address/' + collection.host} text="Host"/> {/* Host - Host Link */}
        {false &&<ExtLinkButton text="Opensea"/>} {/* Open Sea - Open Sea Link */}
      </div>
      <div className={style.InfoBoxaside}>
        <a>Version: {collection.symbol.indexOf("W") === 0 ? collection.symbol : 'Native'}_1.0.0</a>
      </div>
    </div>
  )
}