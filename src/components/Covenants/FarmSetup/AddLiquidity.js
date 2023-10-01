import React from 'react'
import { Link } from 'react-router-dom'


import style from '../../../all.module.css'
import RegularButton from '../../Global/RegularButton/index.js'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import RegularButtonDuoSmall from '../../Global/RegularButtonDuoSmall/index.js'
import RegularButtonDuoSmallWhite from '../../Global/RegularButtonDuoSmallWhite/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import ItemLinkButton from '../../Global/ItemLinkButton/index.js'
import VioletLinkButton from '../../Global/VioletLinkButton/index.js'
import ActionAWeb3ButtonSmall from '../../Global/ActionAWeb3ButtonSmall/index.js'
import TokenInputSmall from '../../Global/TokenInputSmall/index.js'
import ActionAWeb3Buttons from '../../Global/ActionAWeb3Buttons/index.js'
import ActionInfoSectionS from '../../Global/ActionInfoSectionS/index.js'

const AddLiquidity = (props) => {
  return (
      <div className={style.TimetoFarm}>
        <div className={style.TimetoFarmI}>
          <TokenInputSmall></TokenInputSmall>
        </div>
        <div className={style.TimetoFarmI}>
          <TokenInputSmall></TokenInputSmall>
        </div>
        <div className={style.FarmInputActionBTN}>
          <ActionAWeb3Buttons></ActionAWeb3Buttons>
        </div>
        <div className={style.TimetoFarmOutput}>
          <div className={style.TimetoFarmOutputI}>
            <p>Estimated reward per day</p>
            <p><b>22.098 OS</b></p>
          </div>
          <div className={style.FarmBoxSettings}>
            <ActionInfoSectionS></ActionInfoSectionS>
          </div>
        </div>
      </div>
  )
}

export default AddLiquidity
