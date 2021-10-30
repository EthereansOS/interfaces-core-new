import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './trade.module.css'
import TokenInputRegular from '../TokenInputRegular/index.js'
import ActionAWeb3Buttons from '../ActionAWeb3Buttons/index.js'
import ActionInfoSection from '../ActionInfoSection/index.js'

const MarketSwap  = (props) => {
    return (
        <>
            <TokenInputRegular></TokenInputRegular>
            <a className={style.TradeMarketBoxSwitch}>&#xFFEC;</a>
            <TokenInputRegular></TokenInputRegular>
            <ActionAWeb3Buttons></ActionAWeb3Buttons>
            <ActionInfoSection></ActionInfoSection>
        </>
    )
  }

export default MarketSwap