import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { abi, shortenWord, formatMoney, fromDecimals, blockchainCall, useEthosContext, useWeb3, getTokenPriceInDollarsOnUniswap, getTokenPriceInDollarsOnUniswapV3, getTokenPriceInDollarsOnSushiSwap } from 'interfaces-core'
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
    !allMine && getRawField({provider : web3.currentProvider}, element.l2Address || element.address, 'totalSupply').then(val => val !== '0x' && setTotalSupply(abi.decode(["uint256"], val)[0].toString()))
    allMine && getRawField({provider : web3.currentProvider}, element.l2Address || element.address, 'balanceOf(address)', account).then(val => val !== '0x' && setBalance(abi.decode(["uint256"], val)[0].toString()))
  }, [element, account, allMine])

  const isDeck = useMemo(() => element.isDeck || loadedData?.isDeck,[element, loadedData])
  const name = useMemo(() => element.name || loadedData?.name,[element, loadedData])
  const decimals = useMemo(() => element.decimals || loadedData?.decimals,[element, loadedData])

  return (
    <div className={style.ItemSingle}>
      <Link to={`/items/${wrappedOnly === 'Deck' || isDeck ? 'decks/' : ''}${element.l2Address || element.address}`}>
        {!loadedData && <OurCircularProgress/>}
        {loadedData && <ItemImage input={loadedData}/>}
        <div className={style.ItemTitle}>
          <h6>{shortenWord({ context, charsAmount : 15}, name)}</h6>
        </div>
        <div className={style.ItemInfo}>
          {!allMine && <div className={style.ItemInfoSide}>
            <p>Supply:</p>
            <p>{shortenWord({ context, charsAmount : 5, shortenWordSuffix: '...'}, fromDecimals(totalSupply, decimals))}</p>
          </div>}
          {allMine && <div className={style.ItemInfoSide}>
            <p>Balance:</p>
            <p>{fromDecimals(balance, decimals)}</p>
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