import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from '../../../all.module.css'
import RegularButton from '../../Global/RegularButton/index.js'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import RegularButtonDuoSmall from '../../Global/RegularButtonDuoSmall/index.js'
import RegularButtonDuoSmallWhite from '../../Global/RegularButtonDuoSmallWhite/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import ItemLinkButton from '../../Global/ItemLinkButton/index.js'
import VioletLinkButton from '../../Global/VioletLinkButton/index.js'
import ActionAWeb3ButtonSmall from '../../Global/ActionAWeb3ButtonSmall/index.js'
import RegularButtonsSmallWhite from '../../Global/RegularButtonsSmallWhite'

const PositionOpen = (props) => {
  return (
      <div className={style.YourFarmingPositionsFarmingFarmingFarmingChiFarmaViveComeUnPAsha}>
        <div className={style.FarmingYouInfoPart}>
          <span><b>Deposited</b>: 56 ETH - 3000 SOON</span>
          <span><b>Daily Earnings</b>: 200 SOON</span>
          <RegularButtonsSmallWhite></RegularButtonsSmallWhite>
        </div>
        <div className={style.FarmingYouInfoPart}>
          <span><b>Earned</b>: 56.436234 SOON</span>
          <span><b>Fees</b>: 56.436234 SOON - 1444 ETH</span>
          <ActionAWeb3ButtonSmall></ActionAWeb3ButtonSmall>
        </div>
      </div>
  )
}

export default PositionOpen
