import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './token-proposal-card.module.css'
import RegularButtonDuoXSmall from '../../Global/RegularButtonDuoXSmall/index.js'
import ActionAWeb3Buttons from '../../Global/ActionAWeb3Buttons/index.js'
import ActionAWeb3ButtonExtraSmall from '../../Global/ActionAWeb3ButtonExtraSmall/index.js'
import RegularVoteBox from '../RegularVoteBox/index.js'


const TokenProposalCard = (props) => {
  return (
    <div className={style.TokenProposalCard}>
      <div className={style.TokenProposalCardX}>
        <p><b>New Selection:</b></p>
        <p><a><img src={`${process.env.PUBLIC_URL}/img/tokentest/cro.png`}></img></a></p>
        <p><a><img src={`${process.env.PUBLIC_URL}/img/tokentest/ens.jpg`}></img></a></p>
        <p><a><img src={`${process.env.PUBLIC_URL}/img/tokentest/shib.png`}></img></a></p>
        <p><a><img src={`${process.env.PUBLIC_URL}/img/tokentest/gods.png`}></img></a></p>
        <div className={style.TokenProposalOpenClose}>
          <RegularButtonDuoXSmall></RegularButtonDuoXSmall>
        </div>
        <div className={style.TokenProposalVotesCount}>
          <span>Status: <b>Pending</b> - End Block: <a>234314323</a> - Votes: 200,000</span>
        </div>
      </div>
      <RegularVoteBox></RegularVoteBox>
    </div>
  )
}

export default TokenProposalCard
