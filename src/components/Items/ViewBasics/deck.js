import React, { useState, useEffect } from 'react'

import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import AddItemToMetamask from '../../Global/AddItemToMetamask'

import { abi, useWeb3, getNetworkElement, useEthosContext, shortenWord, fromDecimals, formatMoney, getTokenPriceInDollarsOnUniswap, getTokenPriceInDollarsOnSushiSwap, getTokenPriceInDollarsOnUniswapV3, blockchainCall } from 'interfaces-core'

import style from '../../../all.module.css'

import SendToLayer from '../../Global/SendToLayer/index.js'
import { getRawField } from '../../../logic/generalReader.js'
import { usdPrice } from '../../../logic/itemsV2.js'

export default ({item}) => {
  const context = useEthosContext()

  const web3Data = useWeb3()

  const { chainId, web3, dualChainId } = web3Data

  const [price, setPrice] = useState(item.price)
  const [totalSupply, setTotalSupply] = useState(item.totalSupply)

  useEffect(() => {
    var address = item.l2Address || item.address

    getRawField({ provider : web3.currentProvider }, address, 'totalSupply').then(it => setTotalSupply(it === '0x' ? '0' : abi.decode(["uint256"], it)[0].toString()))

    usdPrice({...web3Data, context }, address, item.decimals).then(setPrice)
  }, [])

  return (
    <div className={style.ViewBasics}>
        <h5>{shortenWord({ context, charsAmount : 15}, item.name)} ({shortenWord({ context, charsAmount : 15}, item.symbol)})</h5>
        <p>Supply: {fromDecimals(totalSupply, item.decimals)}</p>
        <p>{price ? ("Price: $" + formatMoney(price, 2)) : '-'}</p>
        <SendToLayer item={item}/>
        <AddItemToMetamask item={item}/>
        <ExtLinkButton href={`${getNetworkElement({context, chainId : item.l2Address ? dualChainId : chainId}, "etherscanURL")}/${dualChainId && !item.l2Address ? 'address' : 'token'}/${item.address}`} text="Contract"/>
        {item.collectionData && item.collectionData.slug && <ExtLinkButton href={`https://${(dualChainId || chainId) === 1 ? '' : 'testnets.'}opensea.io/collection/${item.collectionData.slug}`} text="Original"/>}
        <ExtLinkButton href={item.external_url} text="Website"/>
        {(!dualChainId || item.l2Address) && <ExtLinkButton href={`https://${(dualChainId || chainId) === 1 ? '' : 'testnets.'}opensea.io/assets/${item.mainInterface.options.address}/${item.id}`} text="OpenSea"/>}
        {!dualChainId && <ExtLinkButton href={`https://info.uniswap.org/#/tokens/${item.address}`} text="Uniswap"/>}
        <ExtLinkButton href={item.discord_url} text="Share"/>
    </div>
  )
}