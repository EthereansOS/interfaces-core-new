import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from '../../../all.module.css'
import TokenInputRegular from './../../Global/TokenInputRegular/index.js'
import MarketSwap from './market-swap.js'

const Market  = (props) => {
    return (
        <div className={style.TradeMarketBox}>
            <h5>Market</h5>
            <div className={style.TradeMarketType}>
                <a className={style.selected}>Swap</a>
                <a>Range Order</a>
            </div>
            <MarketSwap></MarketSwap>
        </div>
    )
  }

export default Market