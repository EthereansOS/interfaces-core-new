import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { abi, shortenWord, formatMoney, fromDecimals, blockchainCall, useEthosContext, useWeb3, getTokenPriceInDollarsOnUniswap, getTokenPriceInDollarsOnUniswapV3, getTokenPriceInDollarsOnSushiSwap } from '@ethereansos/interfaces-core'
import style from '../../../all.module.css'
import ItemObject from '../../Global/ObjectsLists/item-object'
import ItemImage from '../ItemImage'
import { loadItemDynamicInfo, usdPrice } from '../../../logic/itemsV2'
import OurCircularProgress from '../../Global/OurCircularProgress'
import { useOpenSea } from '../../../logic/uiUtilities'
import { getRawField } from '../../../logic/generalReader'

const Item = ({element, allMine, wrappedOnly}) => {

  const context = useEthosContext()

  const web3Data = useWeb3()

  const { account, web3 } = web3Data

  const seaport = useOpenSea()

  const [price, setPrice] = useState(element.price)
  const [balance, setBalance] = useState(element.balance)
  const [totalSupply, setTotalSupply] = useState(element.totalSupply)

  const [loadedData, setLoadedData] = useState()

  useEffect(() => {
    usdPrice({...web3Data, context, seaport}, element.l2Address || element.address).then(setPrice)
    loadItemDynamicInfo({...web3Data, context, seaport}, element).then(setLoadedData)
  }, [element])

  useEffect(() => {
    !allMine && getRawField({provider : web3.currentProvider}, element.l2Address || element.address, 'totalSupply').then(val => val !== '0x' && setTotalSupply(abi.decode(["address"], val)[0].toString()))
    allMine && getRawField({provider : web3.currentProvider}, element.l2Address || element.address, 'balanceOf(address)', account).then(val => val !== '0x' && setBalance(abi.decode(["address"], val)[0].toString()))
  }, [element, account, allMine])

  return (
    <div className={style.ItemSingle}>
      <Link to={`/items/dapp/${wrappedOnly === 'Deck' || element.isDeck ? 'decks/' : ''}${element.address}`}>
        {!loadedData && <OurCircularProgress/>}
        {loadedData && <ItemImage input={loadedData}/>}
        <div className={style.ItemTitle}>
          <h6>{shortenWord({ context, charsAmount : 15}, element.name)}</h6>
        </div>
        <div className={style.ItemInfo}>
          {!allMine && <div className={style.ItemInfoSide}>
            <p>Supply:</p>
            <p>{fromDecimals(totalSupply, element.decimals)}</p>
          </div>}
          {allMine && <div className={style.ItemInfoSide}>
            <p>Balance:</p>
            <p>{fromDecimals(balance, element.decimals)}</p>
          </div>}
          <div className={style.ItemInfoSide2}>
            <p>Price:</p>
            <p>{price ? ("$" + formatMoney(price, 2)) : '-'}</p>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default function ExploreItems(props) {
  return (
    <div className={style.ItemAllSingle}>
      <ItemObject {...{...props, element : props.element || Item}}/>
    </div>
  )
}