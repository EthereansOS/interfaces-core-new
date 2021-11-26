import React, { useState, useEffect } from 'react'

import { useWeb3, abi, fromDecimals, blockchainCall, VOID_BYTES32, useEthosContext } from '@ethereansos/interfaces-core'
import { CircularProgress } from '@ethereansos/interfaces-ui'

import { surveylessIsTerminable, terminateProposal } from '../../../logic/organization'

import style from './vote-selections.module.css'
import ActionAWeb3Button from '../../Global/ActionAWeb3Button'

const VoteSelections = ({proposal, discriminator, value, metadata, checked, onSelect}) => {

  const { block, account, newContract } = useWeb3()

  const context = useEthosContext()

  const [votes, setVotes] = useState(null)

  const [terminable, setTerminable] = useState(false)

  var proposalId;
  try {
    proposalId = proposal.presetProposals[proposal.presetValues.indexOf(value)]
  } catch(e) {}

  async function refreshPositionInfo() {
    if(!proposalId || proposalId === VOID_BYTES32) {
      setVotes('0')
    }
    var data = await blockchainCall(proposal.proposalsManager.contract.methods.list, [proposalId])
    data = data[0].accept
    data = fromDecimals(data, 18)
    setVotes(data)
    setTerminable(await surveylessIsTerminable({account, newContract, context}, proposal, proposalId))
  }

  useEffect(() => {
    refreshPositionInfo()
  }, [proposalId, block])

  var prettifiedValue = metadata?.prettifiedValues[proposal.presetValues.indexOf(value)]

  return (
    <label className={style.CardSelectionSingle}>
      <p>{prettifiedValue}</p>
      {!votes && <CircularProgress/>}
      {votes && <span>Staked: {votes} Votes</span>}
      {!terminable && <input name={discriminator} type="radio" checked={checked} value={value} onClick={() => onSelect && onSelect(value, prettifiedValue)}/>}
      {terminable && <ActionAWeb3Button onClick={() => terminateProposal({}, proposal, proposalId)}>Terminate</ActionAWeb3Button>}
    </label>
  )
}

export default VoteSelections