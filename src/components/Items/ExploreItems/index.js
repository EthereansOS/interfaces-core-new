import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  abi,
  shortenWord,
  formatMoney,
  fromDecimals,
  blockchainCall,
  useEthosContext,
  useWeb3,
  getTokenPriceInDollarsOnUniswap,
  getTokenPriceInDollarsOnUniswapV3,
  getTokenPriceInDollarsOnSushiSwap,
} from 'interfaces-core'
import style from '../../../all.module.css'
import ItemObject from '../../Global/ObjectsLists/item-object'
import ItemImage from '../ItemImage'
import { loadItemDynamicInfo, usdPrice } from '../../../logic/itemsV2'
import OurCircularProgress from '../../Global/OurCircularProgress'
import { useOpenSea } from '../../../logic/uiUtilities'
import { getRawField } from '../../../logic/generalReader'
import { loadTokenFromAddress } from '../../../logic/erc20'

const Item = ({ element, allMine, wrappedOnly }) => {
  const context = useEthosContext()

  const web3Data = useWeb3()

  const { account, web3 } = web3Data

  const seaport = useOpenSea()

  const [price, setPrice] = useState(element.price)
  const [balance, setBalance] = useState(element.balance)
  const [totalSupply, setTotalSupply] = useState(element.totalSupply)

  const [loadedData, setLoadedData] = useState()
  const [item, setItem] = useState()
  const [decimals, setDecimals] = useState(null)
  const [formattedTotalSupply, setFormattedTotalSupply] = useState(null)

  useEffect(() => {
    usdPrice(
      { ...web3Data, context, seaport },
      element.l2Address || element.address
    ).then(setPrice)
    loadItemDynamicInfo({ ...web3Data, context, seaport }, element).then(
      setLoadedData
    )
  }, [])

  useEffect(() => {
    !allMine &&
      getRawField(
        { provider: web3.currentProvider },
        element.l2Address || element.address,
        'totalSupply'
      ).then(
        (val) =>
          val !== '0x' &&
          setTotalSupply(abi.decode(['uint256'], val)[0].toString())
      )
    allMine &&
      getRawField(
        { provider: web3.currentProvider },
        element.l2Address || element.address,
        'balanceOf(address)',
        account
      ).then(
        (val) =>
          val !== '0x' && setBalance(abi.decode(['uint256'], val)[0].toString())
      )
  }, [element, account, allMine])

  const isDeck = useMemo(
    () => element.isDeck || loadedData?.isDeck,
    [element, loadedData]
  )
  const name = useMemo(
    () => element.name || loadedData?.name,
    [element, loadedData]
  )
  useEffect(async () => {
    let dec = null
    if (element && element.decimals) {
      dec = element.decimals
    } else if (loadedData && loadedData.decimals) {
      dec = loadedData.decimals
    } else if (element && element.address) {
      let current = await loadTokenFromAddress(
        { context, ...web3Data, seaport },
        element.address
      )
      setItem(current)
      dec = current?.decimals ?? 0
    } else if (loadedData && loadedData.address) {
      let current = await loadTokenFromAddress(
        { context, ...web3Data, seaport },
        loadedData.address
      )
      setItem(current)
      dec = current?.decimals ?? 0
    }
    setDecimals(dec)
  }, [element, loadedData])

  useEffect(() => {
    if (decimals) {
      setFormattedTotalSupply(fromDecimals(totalSupply, decimals))
    } else {
      setFormattedTotalSupply(null)
    }
  }, [totalSupply, decimals])

  return (
    <div className={style.ItemSingle}>
      <Link
        to={`/items/${wrappedOnly === 'Deck' || isDeck ? 'decks/' : ''}${
          element.l2Address || element.address
        }`}>
        {!loadedData && <OurCircularProgress />}
        <button className={style.ItemTitleTopZoneLikeButton}>
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z"
              stroke="currentColor"
              fill="none"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"></path>
          </svg>
        </button>

        <svg
          className={style.ItemTitleTopZone}
          viewBox="0 0 196 55"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M196 55V0H0.5V1H4.05286C12.4067 1 20.1595 5.34387 24.5214 12.4685L43.5393 43.5315C47.9012 50.6561 55.654 55 64.0078 55H196Z"
            fill="currentColor"></path>
        </svg>
        {!allMine && (
          <div className={style.ItemInfoSide}>
            <p className={style.ItemTitleTopZoneLabel}>Supply</p>
            <p className={style.ItemTitleTopZoneValue}>
              {formattedTotalSupply ?? <span>loading...</span>}
            </p>
          </div>
        )}
        {loadedData && <ItemImage input={loadedData} />}
        <div className={style.ItemTitle}>
          <h6>{shortenWord({ context, charsAmount: 15 }, name)}</h6>
          <h4>Collection name</h4>
        </div>
        <svg
          className={style.ItemTitleBottomZone}
          width="281"
          viewBox="0 0 281 99"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 0V99H258.059C248.54 99 239.92 93.3743 236.089 84.6606L205.167 14.3394C201.335 5.62568 192.716 0 183.197 0H0Z"
            fill="currentColor"></path>
        </svg>
        {/*<div className={style.ItemInfo}>

          {allMine && <div className={style.ItemInfoSide}>
            <p>Balance:</p>
            <p>{fromDecimals(balance, decimals)}</p>
          </div>}
          <div className={style.ItemInfoSide2}>
            <p>Price:</p>
            <p>{price ? ("$" + formatMoney(price, 2)) : '-'}</p>
          </div>
          </div>*/}
      </Link>
    </div>
  )
}

export default function ExploreItems(props) {
  return (
    <div className={style.ItemAllSingle}>
      <ItemObject {...{ ...props, element: props.element || Item }} />
    </div>
  )
}
