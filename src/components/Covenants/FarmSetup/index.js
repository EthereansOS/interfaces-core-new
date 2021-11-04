import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './farm-setup.module.css'
import RegularButton from '../../Global/RegularButton/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import ItemLinkButton from '../../Global/ItemLinkButton/index.js'
import VioletLinkButton from '../../Global/VioletLinkButton/index.js'

const FarmSetup = (props) => {
  return (
    <>
      {/*Single setup Start*/}
      <div className={style.FarmSetup}>
        <div className={style.FarmMain}>
          <div className={style.FarmInstructions}>
            <div className={style.FarmToken}>
              <figure>
                <a target="_blank" href="https://etherscan.io/token/0x6100dd79fCAA88420750DceE3F735d168aBcB771">
                  <img src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6100dd79fCAA88420750DceE3F735d168aBcB771/logo.png"></img>
                </a>     
              </figure>
              <span>50%</span>
            </div>
            <div className={style.FarmToken}>
              <figure>
                <a target="_blank" href="https://etherscan.io/token/0x6100dd79fCAA88420750DceE3F735d168aBcB771">
                  <img src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6100dd79fCAA88420750DceE3F735d168aBcB771/logo.png"></img>
                </a>
              </figure>
              <span>50%</span>
            </div>
            <p className={style.FarmInfoDetail}>
              <span class={style.FarmActivityA}>Active</span>
              <b>APR:</b> 500%
            </p>
            <p className={style.FarmInfoDetailS}>
              <b>Daily Rate:</b> 50000 OS
            </p>
            <p className={style.FarmInfoDetailS}>
              <b>End:</b> <a>31467951397</a>
            </p>
          </div>
          
          <div className={style.farmInfoCurve}>
            <p className={style.farmInfoCurveL}>
              <p className={style.MAinTokensel}>
                <a>
                  <img src={`${process.env.PUBLIC_URL}/img/switch.png`}></img>
                </a> 
                OS per ETH
              </p>
            </p>
            <p className={style.farmInfoCurveR}>
              <p className={style.PriceRangeInfoFarm}>
                <VioletLinkButton></VioletLinkButton>
                <VioletLinkButton></VioletLinkButton>
              </p>
            </p>
          </div>
        </div>


      </div>
      {/*Single setup End*/}
    </>
  )
}

export default FarmSetup
