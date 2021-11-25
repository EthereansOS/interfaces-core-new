import React, { useState, useEffect } from 'react'

import { useWeb3, abi, fromDecimals, blockchainCall, VOID_BYTES32 } from '@ethereansos/interfaces-core'
import { CircularProgress } from '@ethereansos/interfaces-ui'


import style from './vote-selections.module.css'

const VoteSelections = ({proposal, discriminator, value, decimals, isPercentage, checked, onSelect}) => {

  const { block } = useWeb3()

  const [votes, setVotes] = useState(null)

  useEffect(() => {
      if(!proposal) {
        return
      }
      async function ask() {
          var proposalId;
          try {
            proposalId = proposal.presetProposals[proposal.presetValues.indexOf(value)]
          } catch(e) {}
          if(!proposalId || proposalId === VOID_BYTES32) {
            setVotes('0')
          }
          var data = await blockchainCall(proposal.proposalsManager.contract.methods.list, [proposalId])
          data = data[0].accept
          data = fromDecimals(data, 18)
          setVotes(data)
      }
      ask()
  }, [proposal, block])

  var plainValue = '0'
  try {
    plainValue = abi.decode(["uint256"], value)[0].toString()
  } catch(e) {
    try {
      plainValue = abi.decode(["string", "uint256"], value)[1].toString()
    } catch(e) {
    }
  }
  plainValue = fromDecimals(plainValue, isPercentage ? 16 : 18
    , true)

  var printedValue = plainValue + (isPercentage ? ' %' : '')

  return (
    <label className={style.CardSelectionSingle}>
      <p>{printedValue}</p>
      {!votes && <CircularProgress/>}
      {votes && <span>Staked: {votes} Votes</span>}
      <input name={discriminator} type="radio" checked={checked} value={value} onClick={() => onSelect && onSelect(value, printedValue)}/>
    </label>
  )
}

export default VoteSelections
