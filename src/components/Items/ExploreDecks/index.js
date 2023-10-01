import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { blockchainCall, formatMoney, fromDecimals, useEthosContext, useWeb3, getTokenPriceInDollarsOnUniswapV3 } from 'interfaces-core'
import style from '../../../all.module.css'
import ItemObject from '../../Global/ObjectsLists/item-object'
import ItemImage from '../ItemImage'

const Item = ({element, allMine}) => {

  const context = useEthosContext()

  const web3Data = useWeb3()

  const { account } = web3Data

  const [price, setPrice] = useState(element.price)
  const [balance, setBalance] = useState(element.balance)
  const [totalSupply, setTotalSupply] = useState(element.totalSupply)

  useEffect(() => {
    blockchainCall(element.mainInterface.methods.balanceOf, account, element.id).then(setBalance)
    blockchainCall(element.mainInterface.methods.totalSupply, element.id).then(setTotalSupply)
    getTokenPriceInDollarsOnUniswapV3({ context, ...web3Data}, element.address, element.decimals).then(setPrice)
  }, [])

  return (
    <div className={style.DeckSingle}>
      <Link to={`/items/${element.address}`}>
        <ItemImage input={element}/>
        <div className={style.ItemTitle}>
          <h6>{element.name}</h6>
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

export default function ExploreDecks(props) {
  return (
    <div className={style.ItemAllSingle}>
      <ItemObject {...{...props, element : props.element || Item}}/>
    </div>
  )
}