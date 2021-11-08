import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './token-input-small.module.css'

const TokenInputSmall  = (props) => {
    return (
        <div className={style.TradeMarketTokenAll}>
            <div className={style.TradeMarketToken}>
                <a className={style.TradeMarketTokenSelector}>
                    <figure>
                        <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
                    </figure>
                </a>
                <div className={style.TradeMarketTokenAmount}>
                    <input type="number" placeholder="0.0"></input>
                </div>
            </div>
            <a className={style.TradeMarketTokenBalance}>Balance: 19453453.354345</a>
        </div>

        )
    }

export default TokenInputSmall