import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { shortenWord, formatMoney, fromDecimals, blockchainCall, useEthosContext, useWeb3, getTokenPriceInDollarsOnUniswap, getTokenPriceInDollarsOnUniswapV3, getTokenPriceInDollarsOnSushiSwap } from '@ethereansos/interfaces-core'
import style from '../../../all.module.css'
import ItemObject from '../../Global/ObjectsLists/item-object'
import ItemImage from '../ItemImage'
import { loadAsset } from '../../../logic/opensea'
import { loadItemDynamicInfo } from '../../../logic/itemsV2'
import OurCircularProgress from '../../Global/OurCircularProgress'
import { useOpenSea } from '../../../logic/uiUtilities'

const Item = ({element, allMine, wrappedOnly}) => {

  const context = useEthosContext()

  const web3Data = useWeb3()

  const { account } = web3Data

  const seaport = useOpenSea()

  const [price, setPrice] = useState(element.price)
  const [balance, setBalance] = useState(element.balance)
  const [totalSupply, setTotalSupply] = useState(element.totalSupply)

  const [loadedData, setLoadedData] = useState()

  useEffect(() => {
    blockchainCall(element.mainInterface.methods.balanceOf, account, element.id).then(setBalance)
    blockchainCall(element.mainInterface.methods.totalSupply, element.id).then(setTotalSupply)

    Promise.all([
      getTokenPriceInDollarsOnUniswapV3({ context, ...web3Data}, element.address, element.decimals),
      getTokenPriceInDollarsOnUniswap({ context, ...web3Data}, element.address, element.decimals),
      getTokenPriceInDollarsOnSushiSwap({ context, ...web3Data}, element.address, element.decimals)
    ]).then(prices => setPrice(Math.max.apply(window, prices)))

    const loadedAsset = loadAsset(element.mainInterfaceAddress, element.id)
    if(loadedAsset) {
      setLoadedData(loadedAsset)
    } else {
      loadItemDynamicInfo({...web3Data, context, seaport}, element).then(setLoadedData)
    }
  }, [])

  return (
    <div className={style.ItemSingle}>
      <Link to={`/items/dapp/${wrappedOnly === 'Deck' || element.isDeck ? 'decks/' : ''}${element.address}`}>
        {!loadedData && <OurCircularProgress/>}
        {loadedData && <ItemImage input={{...element, ...loadedData}}/>}
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