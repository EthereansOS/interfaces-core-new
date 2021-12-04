import React, { useEffect, useState } from 'react'
import style from '../../../all.module.css'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import Upshots from '../../Organizations/Upshots/index.js'
import VotingPowersList from '../../Organizations/VotingPowersList/index.js'
import GovernanceRules from '../../Organizations/GovernanceRules/index.js'
import ActionAWeb3Button from '../../Global/ActionAWeb3Button'
import TokenBuyOrSell from "./tokenBuyOrSell"
import { useWeb3, fromDecimals, blockchainCall, numberToString } from '@ethereansos/interfaces-core'
import CircularProgress from '../../Global/OurCircularProgress'
import { getData } from '../../../logic/generalReader'

export default ({element}) => {

  const [create, setCreate] = useState(false)

  const { block } = useWeb3()

  var proposalType = element.isSurveyless ? 'surveyless' : 'survey'
  var type = element.type

  var buyOrSell = element.name === 'Investment Fund Routine Buy' ? true : element.name === 'Investment Fund Routine Sell' ? false : null

  const [upshots, setUpshots] = useState(null)

  useEffect(() => {
    if(!element?.isSurveyless) {
      return
    }
    setTimeout(async () => {
      try {
        var data = await getData({provider : element.proposalsManager.currentProvider}, element.validatorsAddresses[0][0])
        var percentage = parseFloat(fromDecimals(data.valueUint256, 18))
        var votingToken = element.proposalsConfiguration.votingTokens[0]
        var total = parseFloat(await blockchainCall((votingToken.interoperableInterface || votingToken.contract).methods.totalSupply))
        total *= percentage
        total = numberToString(total).split('.')[0]

        var proposalData = await blockchainCall(element.proposalsManager.methods.list, element.presetProposals)

        setUpshots(proposalData.map((it, i) => ({
          label : element.subProposals[i].label,
          value : it.accept,
          total
        })))
      } catch(e) {
        setUpshots([])
      }
    })
  }, [block, element?.isSurveyless])

  return (
    <div className={style.GovLeft}>
      {buyOrSell !== null && <ActionAWeb3Button onClick={() => setCreate(true)}>Create</ActionAWeb3Button>}
      {create && <TokenBuyOrSell {...{element, buyOrSell, close : () => setCreate(false)}}/>}
      {(proposalType === 'surveyless' || proposalType  === 'poll') && !upshots && <CircularProgress/>}
      {(proposalType === 'surveyless' || proposalType  === 'poll') && upshots &&
        <div className={style.Upshots}>
          <p>Upshots</p>
          {upshots.map(it => <Upshots key={it.label} title={it.label} value={it.value} total={it.total}/>)}
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

      {element.organization.proposalsConfiguration.votingTokens.length > 0 && <div className={style.VotingPowersList}>
        <p><b>Voting Powers:</b></p>
        <VotingPowersList votingTokens={element.organization.proposalsConfiguration.votingTokens}/>
      </div>}
      {proposalType !== 'poll' && <div className={style.Rules}>
        <p><b>Governance Rules:</b></p>
        <GovernanceRules element={element}/>
      </div>}
    </div>
  )
}