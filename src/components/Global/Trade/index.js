import React, { useState } from 'react'

import Market from './market.js'
import OTC from './otc.js'

import style from '../../../all.module.css'

export default ({item}) => {

  const [otcItem, setOtcItem] = useState(item)

  function onTokens(input, output) {
    const inputToken = input?.token
    const outputToken = output?.token
    if(!inputToken && !outputToken) {
      return
    }

    if(!inputToken || inputToken.symbol === 'ETH' || inputToken.symbol === 'USDC' || inputToken.symbol === 'iUSDC' || inputToken.symbol === 'WETH' || inputToken.symbol === 'iETH') {
      return setOtcItem(outputToken)
    }

    return setOtcItem(inputToken)
  }

  return (
    <div className={style.BazarExchangeArea}>
      <div className={style.TradeMain}>
        <Market item={item} onTokens={onTokens}/>
        <OTC item={otcItem}/>
      </div>
    </div>
   
  )
}