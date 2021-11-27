import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from '../../../all.module.css'

const OTCSell  = (props) => {
    return (
        <>
            <div className={style.TradeOTCBoxOrder}>
                <p className={style.TradeOTCBoxOrderQ}><b>500</b></p>
                <p className={style.TradeOTCBoxOrderP}>Price:<br></br>0.0005 ETH</p>
                <button>Sell</button>
            </div>
            <div className={style.TradeOTCBoxOrder}>
                <p className={style.TradeOTCBoxOrderQ}><b>500</b></p>
                <p className={style.TradeOTCBoxOrderP}>Price:<br></br>0.0005 ETH</p>
                <button>Sell</button>
            </div>
            <div className={style.TradeOTCBoxOrder}>
                <p className={style.TradeOTCBoxOrderQ}><b>500</b></p>
                <p className={style.TradeOTCBoxOrderP}>Price:<br></br>0.0005 ETH</p>
                <button>Sell</button>
            </div>
            <div className={style.TradeOTCBoxOrder}>
                <p className={style.TradeOTCBoxOrderQ}><b>500</b></p>
                <p className={style.TradeOTCBoxOrderP}>Price:<br></br>0.0005 ETH</p>
                <button>Sell</button>
            </div>
            <div className={style.TradeOTCBoxOrder}>
                <p className={style.TradeOTCBoxOrderQ}><b>500</b></p>
                <p className={style.TradeOTCBoxOrderP}>Price:<br></br>0.0005 ETH</p>
                <button>Sell</button>
            </div>
            <div className={style.TradeOTCBoxOrder}>
                <p className={style.TradeOTCBoxOrderQ}><b>500</b></p>
                <p className={style.TradeOTCBoxOrderP}>Price:<br></br>0.0005 ETH</p>
                <button>Sell</button>
            </div>
        </>
    )
  }

export default OTCSell