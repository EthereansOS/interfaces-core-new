import React from 'react'

import { useEthosContext, useWeb3, getNetworkElement, VOID_ETHEREUM_ADDRESS } from '@ethereansos/interfaces-core'

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
        {collection.mintOperator && collection.mintOperator !== VOID_ETHEREUM_ADDRESS && <ExtLinkButton href={getNetworkElement({context, chainId}, 'etherscanURL') + 'address/' + collection.mintOperator} text="Mintable"/>}
        <ExtLinkButton className={(!collection.metadataOperator || collection.metadataOperator === VOID_ETHEREUM_ADDRESS) && 'Disabled'} href={collection.metadataOperator && collection.metadataOperator !== VOID_ETHEREUM_ADDRESS ? (getNetworkElement({context, chainId}, 'etherscanURL') + 'address/' + collection.metadataOperator) : undefined} text={`Metadata ${collection.metadataOperator && collection.metadataOperator !== VOID_ETHEREUM_ADDRESS ? 'Host' : 'Frozen'}`}/>
        {false &&<ExtLinkButton text="Opensea"/>} {/* Open Sea - Open Sea Link */}
      </div>
      <div className={style.InfoBoxaside}>
        <a>Version: {collection.symbol.indexOf("W") === 0 ? collection.symbol : 'Native'}_1.0.0</a>
      </div>
    </div>
  )
}