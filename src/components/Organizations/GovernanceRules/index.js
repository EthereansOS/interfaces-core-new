import React, { useEffect, useState } from 'react'

import { CircularProgress } from '@ethereansos/interfaces-ui'
import { useWeb3, fromDecimals, blockchainCall, useEthosContext, abi } from '@ethereansos/interfaces-core'

import style from '../../../all.module.css'
import { readGovernanceRules, extractRules } from '../../../logic/organization'

const GovernanceRules = ({element, proposalId, validators, terminates}) => {

  const [cleanValidators, setCleanValidators] = useState(null)
  const [cleanCanTerminates, setCleanCanTerminates] = useState(null)

  useEffect(() => {
    setTimeout(async () => {
      var terms;
      var vals;
      if(proposalId) {
        var retrievedData = await readGovernanceRules({}, element, proposalId)
        vals = retrievedData.validators
        terms = retrievedData.terminates
      } else {
        vals = await extractRules({provider : element.proposalsManager.currentProvider}, validators, true)
        terms = await extractRules({provider : element.proposalsManager.currentProvider}, terminates)
      }
      setCleanValidators(vals || [])
      setCleanCanTerminates(terms || [])
    })
  }, [])

  if(!cleanValidators) {
    return <CircularProgress/>
  }

  return (
    <div className={style.Rule}>
      {cleanValidators && cleanValidators.map((it, i) => <p key={"val_" + i}>
        <b>{it.text}</b>
        <br/>
        <span>{it.value}</span>
      </p>)}
      {cleanCanTerminates && cleanCanTerminates.map((it, i) => <p key={"term_" + i}>
        <b>Quorum</b>
        <br/>
        <span>2,000</span>
      </p>)}
    </div>
  )
}

export default GovernanceRules
