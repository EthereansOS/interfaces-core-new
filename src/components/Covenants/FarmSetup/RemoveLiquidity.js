import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './farm-setup.module.css'
import RegularButton from '../../Global/RegularButton/index.js'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import RegularButtonDuoSmall from '../../Global/RegularButtonDuoSmall/index.js'
import RegularButtonDuoSmallWhite from '../../Global/RegularButtonDuoSmallWhite/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import ItemLinkButton from '../../Global/ItemLinkButton/index.js'
import VioletLinkButton from '../../Global/VioletLinkButton/index.js'
import ActionAWeb3ButtonSmall from '../../Global/ActionAWeb3ButtonSmall/index.js'
import TokenInputRegular from '../../Global/TokenInputRegular/index.js'
import ActionAWeb3Buttons from '../../Global/ActionAWeb3Buttons/index.js'

const AddLiquidity = (props) => {
  return (
      <div className={style.TimetoFarm}>
        <div className={style.TimetoFarmI}>
          <TokenInputRegular></TokenInputRegular>
        </div>
        <div className={style.TimetoFarmI}>
          <TokenInputRegular></TokenInputRegular>
        </div>
        <div className={style.TimetoFarmOutput}>
          <p>Estimated reward per day</p>
          <b>22.098 OS</b>
        </div>
        <div className={style.FarmInputActionBTN}>
          <ActionAWeb3Buttons></ActionAWeb3Buttons>
        </div>
      </div>
  )
}

export default AddLiquidity
