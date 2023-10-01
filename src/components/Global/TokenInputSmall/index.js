import React from 'react'
import { usePlaceholder } from 'interfaces-core'
import { Link } from 'react-router-dom'


import style from '../../../all.module.css'

const TokenInputSmall  = (props) => {
    return (
        <div className={style.TradeMarketTokenAllS}>
            <div className={style.TradeMarketTokenS}>
                <a className={style.TradeMarketTokenSelectorS}>
                    <figure>
                        <img src={`${process.env.PUBLIC_URL}/img/default.png`}></img>
                    </figure>
                </a>
                <div className={style.TradeMarketTokenAmountS}>
                    <input type="number" placeholder="0.0"></input>
                </div>
            </div>
            <a className={style.TradeMarketTokenBalanceS}>Balance: 19453453.354345</a>
        </div>

        )
    }

export default TokenInputSmall