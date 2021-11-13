import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './surveyless-open-card.module.css'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import TokenInputRegular from '../../Global/TokenInputRegular/index.js'
import ActionAWeb3Buttons from '../../Global/ActionAWeb3Buttons/index.js'
import ActionAWeb3ButtonExtraSmall from '../../Global/ActionAWeb3ButtonExtraSmall/index.js'
import RegularVoteBox from '../../Organizations/RegularVoteBox/index.js'


const SurveylessOpenCard = (props) => {
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
        <p><b>Choose from:</b></p>
        <div className={style.SurveylessOpenCardSelectionCont}>
          <label className={style.SurveylessOpenCardSelectionSingle}>
            <p>0.0001%</p>
            <span>Staked: 20000 OS</span>
            <input type="radio"></input>
          </label>
          <label className={style.SurveylessOpenCardSelectionSingle}>
            <p>0.03%</p>
            <span>Staked: 20000 OS</span>
            <input type="radio"></input>
          </label>
          <label className={style.SurveylessOpenCardSelectionSingle}>
            <p>1%</p>
            <span>Staked: 20000 OS</span>
            <input type="radio"></input>
          </label>
          <label className={style.SurveylessOpenCardSelectionSingle}>
            <p>1%</p>
            <span>Staked: 20000 OS</span>
            <input type="radio"></input>
          </label>
          <label className={style.SurveylessOpenCardSelectionSingle}>
            <p>0.004%</p>
            <span>Staked: 20000 OS</span>
            <input type="radio"></input>
          </label>
          <label className={style.SurveylessOpenCardSelectionSingle}>
            <p>1%</p>
            <span>Staked: 20000 OS</span>
            <input type="radio"></input>
          </label>
          <RegularVoteBox></RegularVoteBox>
        </div>
      </div>
    </div>
  )
}

export default SurveylessOpenCard
