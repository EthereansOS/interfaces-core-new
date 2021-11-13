import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './not-supported-general-open-card.module.css'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import TokenInputRegular from '../../Global/TokenInputRegular/index.js'
import ActionAWeb3Buttons from '../../Global/ActionAWeb3Buttons/index.js'
import ActionAWeb3ButtonExtraSmall from '../../Global/ActionAWeb3ButtonExtraSmall/index.js'

const NotSupportedGeneralGovernanceOpenCard = (props) => {
  return (
    <div className={style.NotSupportedOpenCard}>
      <div className={style.NotSupportedOpenCardTokens}>
        <p><b>Voting Powers:</b></p>
        <div className={style.NotSupportedOpenCardTokensList}>
          <a>
            <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
            <div className={style.NotSupportedOpenCardTokensVotingPower}>
             <span>+1</span>
            </div>
          </a>
          <a>
            <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
            <div className={style.NotSupportedOpenCardTokensVotingPower}>
             <span>+10</span>
            </div>
          </a>
          <a>
            <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
            <div className={style.NotSupportedOpenCardTokensVotingPower}>
             <span>+3</span>
            </div>
          </a>
        </div>
      </div> 
      <div className={style.NotSupportedOpenCardSelectionAll}>
        <div className={style.NotSupportedOpenCardSelection}>
          <p><b>Active Proposals:</b></p>
        </div>
        <div className={style.NotSupportedOpenCardSelection}>
          <p><b>Old Proposals:</b></p>
        </div>
      </div>
      
    </div>
  )
}

export default NotSupportedGeneralGovernanceOpenCard
