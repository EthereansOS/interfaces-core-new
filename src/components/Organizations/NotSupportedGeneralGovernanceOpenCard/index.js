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
    <div className={style.SurveylessOpenCard}>
      <div className={style.SurveylessOpenCardTokens}>
        <p><b>Voting Powers:</b></p>
        <div className={style.SurveylessOpenCardTokensList}>
          <a>
            <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
            <div className={style.SurveylessOpenCardTokensVotingPower}>
             <span>+1</span>
            </div>
          </a>
          <a>
            <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
            <div className={style.SurveylessOpenCardTokensVotingPower}>
             <span>+10</span>
            </div>
          </a>
          <a>
            <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
            <div className={style.SurveylessOpenCardTokensVotingPower}>
             <span>+3</span>
            </div>
          </a>
        </div>
      </div> 
      <div className={style.SurveylessOpenCardSelection}>
        <p><b>Active Proposals:</b></p>



        <div className={style.SurveylessOpenCardSelectionCont}>
          
          <div className={style.SurveylessOpenCardSelectionSingleQuantity}>
          <TokenInputRegular></TokenInputRegular>
          </div>
          <div>
            <ActionAWeb3Buttons></ActionAWeb3Buttons>
          </div>
          <div className={style.SurveylessOpenCardSelectionSingleOpenStaked}>
              <p>0.01% - 2000 OS staked</p>
              <ActionAWeb3ButtonExtraSmall></ActionAWeb3ButtonExtraSmall>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotSupportedGeneralGovernanceOpenCard
