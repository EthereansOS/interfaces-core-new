import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from '../../../all.module.css'
import OTCBuy from './otc-buy.js'
import OTCSell from './otc-sell.js'

const OTC  = (props) => {
    return (
        <div className={style.TradeOTCBox}>
            <h4>OTC</h4>
            <div className={style.TradeOTCBoxOrdersBuy}>
                <h6>Buy Orders</h6>
                <div className={style.TradeOTCBoxOrders}>
                <OTCBuy></OTCBuy>
                </div>
            </div>
            <div className={style.TradeOTCBoxOrdersSell}>
                <h6>Sell Orders</h6>
                <div className={style.TradeOTCBoxOrders}>
                <OTCSell></OTCSell>
                </div>
            </div>
        </div>
    )
  }

export default OTC