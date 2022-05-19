import React, { useState, useEffect } from 'react'

import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import AddItemToMetamask from '../../Global/AddItemToMetamask'

import { useWeb3, getNetworkElement, useEthosContext, shortenWord, fromDecimals, formatMoney, getTokenPriceInDollarsOnUniswap, getTokenPriceInDollarsOnSushiSwap, getTokenPriceInDollarsOnUniswapV3, blockchainCall } from '@ethereansos/interfaces-core'

import style from '../../../all.module.css'

export default ({item}) => {
  const context = useEthosContext()

  const web3Data = useWeb3()

  const { chainId } = web3Data

  const [price, setPrice] = useState(item.price)
  const [totalSupply, setTotalSupply] = useState(item.totalSupply)

  useEffect(() => {
    blockchainCall(item.mainInterface.methods.totalSupply, item.id).then(setTotalSupply)

    Promise.all([
      getTokenPriceInDollarsOnUniswapV3({ context, ...web3Data}, item.address, item.decimals),
      getTokenPriceInDollarsOnUniswap({ context, ...web3Data}, item.address, item.decimals),
      getTokenPriceInDollarsOnSushiSwap({ context, ...web3Data}, item.address, item.decimals)
    ]).then(prices => setPrice(Math.max.apply(window, prices)))
  }, [])

  return (
    <div className={style.ViewBasics}>
        <h5>{shortenWord({ context, charsAmount : 15}, item.name)} ({shortenWord({ context, charsAmount : 15}, item.symbol)})</h5>
        <p>Supply: {fromDecimals(totalSupply, item.decimals)}</p>
        <p>{price ? ("Price: $" + formatMoney(price, 2)) : '-'}</p>
        <AddItemToMetamask item={item}/>
        <ExtLinkButton href={`${getNetworkElement({context, chainId}, "etherscanURL")}/token/${item.address}`} text="Contract"/>
        {item.collectionData && item.collectionData.slug && <ExtLinkButton href={`https://${chainId === 1 ? '' : 'testnets.'}opensea.io/collection/${item.collectionData.slug}`} text="Original"/>}
        <ExtLinkButton href={item.external_url} text="Website"/>
        <ExtLinkButton href={`https://${chainId === 1 ? '' : 'testnets.'}opensea.io/assets/${item.mainInterface.options.address}/${item.id}`} text="OpenSea"/>
        <ExtLinkButton href={`https://info.uniswap.org/#/tokens/${item.address}`} text="Uniswap"/>
        <ExtLinkButton href={item.discord_url} text="Share"/>
    </div>
  )
}