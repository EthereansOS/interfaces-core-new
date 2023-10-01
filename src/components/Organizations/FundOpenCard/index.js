import React from 'react'
import { Link } from 'react-router-dom'


import style from './fund-open-card.module.css'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import TokenInputRegular from '../../Global/TokenInputRegular/index.js'
import ActionAWeb3Buttons from '../../Global/ActionAWeb3Buttons/index.js'
import ActionAWeb3ButtonExtraSmall from '../../Global/ActionAWeb3ButtonExtraSmall/index.js'
import RegularVoteBox from '../RegularVoteBox/index.js'
import TokenProposalCard from '../TokenProposalCard/index.js'


const FundOpenCard = (props) => {
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
        <p><b>Rules:</b></p>
        <div className={style.OpenCardGovernanceRules}>
          <p><b>Quorum:</b><br></br>3,000,000 Votes</p>
          <p><b>Duration:</b><br></br>a Weeks</p>
          <p><b>Quorum:</b><br></br>3,000,000 Votes</p>
          <p><b>Quorum:</b><br></br>3,000,000 Votes</p>
        </div>
      </div>
      <div className={style.SurveylessOpenCardSelection}>
        <p><b>Active Proposals:</b></p>
        <div className={style.SurveylessOpenCardSelectionCont}>
          <div className={style.ProposalCardClosed}>
            <TokenProposalCard></TokenProposalCard>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FundOpenCard
