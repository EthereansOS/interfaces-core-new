import React from 'react'

import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import AddItemToMetamask from '../../Global/AddItemToMetamask'

import { useWeb3, getNetworkElement, useEthosContext, fromDecimals } from '@ethereansos/interfaces-core'

import style from '../../../all.module.css'

const ViewBasics = ({item}) => {
  const context = useEthosContext()
  const { chainId } = useWeb3()

  return (
    <div className={style.ViewBasics}>
        <h5>{item.name} ({item.symbol})</h5>
        <p>Supply: {fromDecimals(item.totalSupply, item.decimals)}</p>
        <AddItemToMetamask item={item}/>
        <ExtLinkButton href={`${getNetworkElement({context, chainId}, "etherscanURL")}/token/${item.address}`} text="Contract"/>
        <ExtLinkButton href={item.external_url} text="Website"/>
        <ExtLinkButton href={`https://opensea.io/assets/${item.mainInterface.options.address}/${item.id}`} text="OpenSea"/>
        <ExtLinkButton href={`https://info.uniswap.org/#/tokens/${item.address}`} text="Uniswap"/>
        <ExtLinkButton href={item.discord_url} text="Share"/>
        <ExtLinkButton href={`${getNetworkElement({context, chainId}, "etherscanURL")}/address/${item.host}`} text="Mintable"/>
        <ExtLinkButton href={`${getNetworkElement({context, chainId}, "etherscanURL")}/address/${item.host}`} text="Metadata Host"/>
    </div>
  )
}

export default ViewBasics
