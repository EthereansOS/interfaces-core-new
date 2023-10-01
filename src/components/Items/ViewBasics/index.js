import React, { useState, useEffect } from 'react'

import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import AddItemToMetamask from '../../Global/AddItemToMetamask'

import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import RegularModal from '../../Global/RegularModal/index.js'

import ViewFarmings from '../../../pages/covenants/dapp/farming/index'

import { abi, useWeb3, getNetworkElement, useEthosContext, fromDecimals, VOID_ETHEREUM_ADDRESS, formatMoney, getTokenPriceInDollarsOnUniswap, getTokenPriceInDollarsOnSushiSwap, getTokenPriceInDollarsOnUniswapV3, blockchainCall } from 'interfaces-core'

import { allFarmings } from '../../../logic/farming.js'
import { getRawField } from '../../../logic/generalReader'

import style from '../../../all.module.css'
import OurCircularProgress from '../../Global/OurCircularProgress/index.js'
import SendToLayer from '../../Global/SendToLayer/index.js'
import { usdPrice } from '../../../logic/itemsV2.js'

export default ({item}) => {
  const context = useEthosContext()

  const web3Data = useWeb3()

  const { chainId, web3, dualChainId } = web3Data

  const [farming, setFarming] = useState()

  const [hasFarming, setHasFarming] = useState(null)

  const [price, setPrice] = useState(item.price)
  const [totalSupply, setTotalSupply] = useState(item.totalSupply)

  useEffect(() => {
    var address = item.l2Address || item.address

    getRawField({ provider : web3.currentProvider }, address, 'totalSupply').then(it => setTotalSupply(it === '0x' ? '0' : abi.decode(["uint256"], it)[0].toString()))

    usdPrice({...web3Data, context }, address, item.decimals).then(setPrice)
  }, [])

  useEffect(() => allFarmings({ context, ...web3Data, rewardTokenAddress : item.address, lightweight : true }).then(farmings => setHasFarming(farmings.length > 0)), [])

  return (
    <div className={style.ViewBasics}>
        {farming && <RegularModal close={() => setFarming()}>
          <ViewFarmings rewardTokenAddress={item.address}/>
        </RegularModal>}
        <h5>{item.name} ({item.symbol})</h5>
        <p>Supply: {fromDecimals(totalSupply, item.decimals)}</p>
        <p>{price ? ("Price: $" + formatMoney(price, 2)) : '-'}</p>
        <SendToLayer item={item}/>
        <AddItemToMetamask item={item}/>
        <ExtLinkButton href={`${getNetworkElement({context, chainId : item.l2Address ? dualChainId : chainId}, "etherscanURL")}/${dualChainId && !item.l2Address ? 'address' : 'token'}/${item.address}`} text="Contract"/>
        <ExtLinkButton href={item.external_url} text="Website"/>
        {(!dualChainId || item.l2Address) && <ExtLinkButton href={`https://${(dualChainId || chainId) === 1 ? '' : 'testnets.'}opensea.io/assets/${(item.mainInterface || item.l1Data.mainInterface).options.address}/${item.id || item.l1Data.id}`} text="OpenSea"/>}
        <ExtLinkButton href={`https://info.uniswap.org/#/tokens/${item.l1Address || item.address}`} text="Uniswap"/>
        <ExtLinkButton href={item.discussion_url || item.discord_url} text="Share"/>
        {item.collectionData.mintOperator && item.collectionData.mintOperator !== VOID_ETHEREUM_ADDRESS && <ExtLinkButton href={getNetworkElement({context, chainId : dualChainId || chainId}, 'etherscanURL') + 'address/' + item.collectionData.mintOperator} text="Mintable"/>}
        <ExtLinkButton className={(!item.collectionData.metadataOperator || item.collectionData.metadataOperator === VOID_ETHEREUM_ADDRESS) && 'Disabled'} href={item.collectionData.metadataOperator && item.collectionData.metadataOperator !== VOID_ETHEREUM_ADDRESS ? (getNetworkElement({context, chainId : dualChainId || chainId }, 'etherscanURL') + 'address/' + item.collectionData.metadataOperator) : undefined} text={`Metadata ${item.collectionData.metadataOperator && item.collectionData.metadataOperator !== VOID_ETHEREUM_ADDRESS ? 'Host' : 'Frozen'}`}/>
        {false && hasFarming === null && <OurCircularProgress/>}
        {false && hasFarming !== null && <RegularButtonDuo onClick={() => setFarming(true)}>Farming Contracts</RegularButtonDuo>}
    </div>
  )
}