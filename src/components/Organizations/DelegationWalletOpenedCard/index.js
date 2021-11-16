import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './delegation-wallet-opened-card.module.css'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import TokenInputRegular from '../../Global/TokenInputRegular/index.js'
import ActionAWeb3Buttons from '../../Global/ActionAWeb3Buttons/index.js'
import ActionAWeb3ButtonExtraSmall from '../../Global/ActionAWeb3ButtonExtraSmall/index.js'
import RegularVoteBox from '../../Organizations/RegularVoteBox/index.js'
import RegularButtonDuoXSmall from '../../Global/RegularButtonDuoXSmall/index.js'


const DelegationWalletOpenedCard = (props) => {
  return (
    <div className={style.DelegationWalletOpenedCard}>
      <div className={style.DelegationWalletOpenedCardWrap}>
        <div className={style.DelegationWalletOpenedCardWrapBox}>
        <p>Wrap your OS token to support and vote.</p>
          <RegularButtonDuo></RegularButtonDuo>
        </div>
        <div className={style.DelegationWalletOpenedCardWrapBox}>
          <p>Withdraw your OS token to stop supporting and voting.</p>
          <RegularButtonDuo></RegularButtonDuo>
        </div>
      </div>
      <div className={style.DelegationWalletOpenedCardProposals}>
        <p><b>Active:</b></p>
        <div className={style.DelegationWalletOpenedCardProposalBox}>
          <div className={style.DelegationWalletOpenedCardProposalBoxTitle}>
          <h6>Proposal Title</h6>
          <p>Welcome to the Buidlerberg Event 2020! Tucked away deep inside the Ethereum network, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology...</p>
          </div>
          <div className={style.TokenProposalVotesCount}>
            <span>Status: <b>Pending</b> - End Block: <a>234314323</a> - Votes: 200,000</span>
            <div className={style.TokenProposalOpenClose}>
            <RegularButtonDuoXSmall></RegularButtonDuoXSmall>
          </div>
          </div>
        </div>
        <p><b>Past:</b></p>
      </div>
    </div>
  )
}

export default DelegationWalletOpenedCard
