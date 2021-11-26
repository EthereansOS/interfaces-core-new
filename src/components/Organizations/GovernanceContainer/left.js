import React, { useState } from 'react'
import style from './governance-container.module.css'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import Upshots from '../../Organizations/Upshots/index.js'
import VotingPowersList from '../../Organizations/VotingPowersList/index.js'
import GovernanceRules from '../../Organizations/GovernanceRules/index.js'
import ActionAWeb3Button from '../../Global/ActionAWeb3Button'
import TokenBuyOrSell from "./tokenBuyOrSell"

export default ({element, proposal, metadata, }) => {

  const [create, setCreate] = useState(false)

  var proposalType = proposal.isPreset ? 'surveyless' : 'poll'
  var type = element.type

  var buyOrSell = metadata.name === 'Investment Fund Routine Buy' ? true : metadata.name === 'Investment Fund Routine Sell' ? false : null

  return (
    <div className={style.GovLeft}>
      {buyOrSell !== null && <ActionAWeb3Button onClick={() => setCreate(true)}>Create</ActionAWeb3Button>}
      {create && <TokenBuyOrSell {...{proposal, buyOrSell, close : () => setCreate(false)}}/>}
      {proposalType === 'surveyless' || proposalType  === 'poll' &&
        <div className={style.Upshots}>
          <p>upshot</p>
          <Upshots/>
        </div>
      }

      {type === 'delegation' && <>
        <div className={style.DelegationWrap}>
          <div className={style.DelegationWrapBox}>
          <p>Wrap your OS token to support and vote.</p>
            <RegularButtonDuo></RegularButtonDuo>
          </div>
          <div className={style.DelegationWrapBox}>
            <p>Withdraw your OS token to stop supporting and voting.</p>
            <RegularButtonDuo></RegularButtonDuo>
          </div>
        </div>
      </>}

      <div className={style.VotingPowersList}>
        <p><b>Voting Powers:</b></p>
        <VotingPowersList votingTokens={proposal.organization.proposalsConfiguration.votingTokens}/>
      </div>
      {proposalType !== 'poll' && <>
        <div className={style.Rules}>
          <p><b>Governance Rules:</b></p>
          <GovernanceRules proposal={proposal}/>
        </div>
      </>}
    </div>
  )
}