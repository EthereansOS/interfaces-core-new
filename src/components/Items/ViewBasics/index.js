import React from 'react'

import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import AddItemToMetamask from '../../Global/AddItemToMetamask'

import { useWeb3, getNetworkElement, useEthosContext, fromDecimals, VOID_ETHEREUM_ADDRESS } from '@ethereansos/interfaces-core'

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
        {item.collectionData.mintOperator && item.collectionData.mintOperator !== VOID_ETHEREUM_ADDRESS && <ExtLinkButton href={getNetworkElement({context, chainId}, 'etherscanURL') + 'address/' + item.collectionData.mintOperator} text="Mintable"/>}
        <ExtLinkButton className={(!item.collectionData.metadataOperator || item.collectionData.metadataOperator === VOID_ETHEREUM_ADDRESS) && 'Disabled'} href={item.collectionData.metadataOperator && item.collectionData.metadataOperator !== VOID_ETHEREUM_ADDRESS ? (getNetworkElement({context, chainId}, 'etherscanURL') + 'address/' + item.collectionData.metadataOperator) : undefined} text={`Metadata ${item.collectionData.metadataOperator && item.collectionData.metadataOperator !== VOID_ETHEREUM_ADDRESS ? 'Host' : 'Frozen'}`}/>
    </div>
  )
}

export default ViewBasics
