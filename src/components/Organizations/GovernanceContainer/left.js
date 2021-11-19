import React from 'react'
import style from './governance-container.module.css'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import Upshots from '../../Organizations/Upshots/index.js'
import VotingPowersList from '../../Organizations/VotingPowersList/index.js'
import GovernanceRules from '../../Organizations/GovernanceRules/index.js'

export default ({type, proposalType}) => {
  return (
    <div className={style.GovLeft}>
      {proposalType === 'surveyless' || proposalType  === 'poll' && <>
      <div className={style.Upshots}>
        <p>upshot</p>
        <Upshots/>
      </div>
      </>}

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
        <VotingPowersList/>
      </div>
      {proposalType !== 'poll' && <>
      <div className={style.Rules}>
        <p><b>Governance Rules:</b></p>
        <GovernanceRules/>
      </div>
      </>}
    </div>
  )
}