import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './trade.module.css'
import Market from './market.js'
import OTC from './otc.js'

const Trade = (props) => {

    return (
      <div className={style.TradeMain}>
        <Market></Market>
        <OTC></OTC>
      </div>
    )
  }

export default Trade
