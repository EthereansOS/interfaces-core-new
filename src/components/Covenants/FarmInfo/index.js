import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './farm-info.module.css'
import BackButton from '../../Global/BackButton/index.js'
import RegularButton from '../../Global/RegularButton/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import ItemLinkButton from '../../Global/ItemLinkButton/index.js'
import ActionAWeb3Button from '../../Global/ActionAWeb3Button/index.js'
import RegularSelect from '../../Global/RegularSelect/index.js'
import FarmSetup from '../../Covenants/FarmSetup/index.js'


const FarmInfo = (props) => {
  return (
    <div className={style.FarmInfoBox}>
     <div className={style.RutineBack}>
          <BackButton></BackButton>
      </div>
      <div className={style.FarmContent}>
        <div className={style.FarmContentTitle}>
            <figure>
              <a>
                <img src={`${process.env.PUBLIC_URL}/img/os_logo.png`}></img>
              </a>
            </figure>
            <aside>
              <h6>Farm EthOS</h6>
            </aside>
        </div>
        <div className={style.FarmContentInfo}>
            <p><b>Daily Rate</b>: 2394.356009 WUSD</p>
            <p>
              <span className={style.FarmActivityA}>Active</span>
              <span className={style.VersionFarm}>Uni V3</span>
            </p>
            <p>
              <ItemLinkButton></ItemLinkButton> {/* Item - Contract Link */}
              <ExtLinkButton></ExtLinkButton> {/* Contract - Contract Link */}
              <ExtLinkButton></ExtLinkButton> {/* Host - Host Link */}
              <ExtLinkButton></ExtLinkButton> {/* Extension - Extension Link */}
            </p>
        </div>
      </div>
      <div className={style.FarmSetpsList}>
        <FarmSetup></FarmSetup>
      </div>
    </div>
  )
}

export default FarmInfo
