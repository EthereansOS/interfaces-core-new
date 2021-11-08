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
import ActionAWeb3Button from '../../Global/ActionAWeb3Button/index.js'
import ActionInfoSectionS from '../../Global/ActionInfoSectionS/index.js'

const AddLiquidity = (props) => {
  return (
      <div className={style.TimetoFarm}>
        <div className={style.RemoveFarm}>
            <input type="range" />
            <div className={style.RemovePerch}>
              <RegularButton></RegularButton>
            </div>
            <div className={style.RemovePerch}>
              <RegularButton></RegularButton>
            </div>
            <div className={style.RemovePerch}>
              <RegularButton></RegularButton>
            </div>
            <div className={style.RemovePerch}>
              <RegularButton></RegularButton>
            </div>
            <div className={style.FarmInputActionBTN}>
              <ActionAWeb3Button></ActionAWeb3Button>
            </div>
              <div className={style.TimetoFarmOutput}>
                <div className={style.TimetoFarmOutputI}>
                  <p>Withdraw:</p>
                  <p><b>22.098 OS - 550 ETH</b></p>
                </div>
                <div className={style.FarmBoxSettings}>
                  <ActionInfoSectionS></ActionInfoSectionS>
                 </div>
              </div>
          </div>
      </div>
  )
}

export default AddLiquidity
