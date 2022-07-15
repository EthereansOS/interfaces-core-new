import React from 'react'

import MarketSwap from './market-swap.js'

import style from '../../../all.module.css'

export default ({item, onTokens}) => {
    return (
        <div className={style.TradeMarketBox}>
            {false && <div className={style.TradeMarketType}>
                <a className={style.selected}>Swap</a>
                {false && <a>Range Order</a>}
            </div>}
            <MarketSwap item={item} onTokens={onTokens}/>
        </div>
    )
}