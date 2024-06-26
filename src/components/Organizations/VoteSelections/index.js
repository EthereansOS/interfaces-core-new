import React, { useState, useEffect } from 'react'

import { useWeb3, useEthosContext } from 'interfaces-core'

import { surveyIsTerminable, surveylessIsTerminable, terminateProposal } from '../../../logic/organization'

import style from '../../../all.module.css'
import ActionAWeb3Button from '../../Global/ActionAWeb3Button'

const VoteSelections = ({element, discriminator, value, votes, label, checked, proposalId, onSelect, forDelegationVote}) => {

  const web3Data = useWeb3()

  const { block, account, newContract } = web3Data

  const context = useEthosContext()

  const [terminable, setTerminable] = useState(false)

  async function refreshPositionInfo() {
    setTerminable(element.isSurveyless ? await surveylessIsTerminable({...web3Data, context}, element, proposalId) : await surveyIsTerminable({...web3Data, context}, element, proposalId))
  }

  useEffect(() => {
    refreshPositionInfo()
  }, [proposalId, block])

  return (
    <label className={style.CardSelectionSingle}>
      <p>{label}</p>
      {votes && <span>Staked: {votes} Votes</span>}
      {forDelegationVote && <ActionAWeb3Button onClick={() => forDelegationVote(element, proposalId, value)}>Select</ActionAWeb3Button>}
      {!forDelegationVote && !terminable && <input name={discriminator} type="radio" checked={checked} value={value} onClick={() => onSelect && onSelect(value)}/>}
      {element.isSurveyless && !forDelegationVote && terminable && element.isPreset && <ActionAWeb3Button onClick={() => terminateProposal({}, element, proposalId)}>Terminate</ActionAWeb3Button>}
    </label>
  )
}

export default VoteSelections