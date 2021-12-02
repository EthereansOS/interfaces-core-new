import React, { Fragment, useEffect, useState } from 'react'

import { CircularProgress } from '@ethereansos/interfaces-ui'
import { useWeb3, fromDecimals, blockchainCall, useEthosContext, abi } from '@ethereansos/interfaces-core'

import style from '../../../all.module.css'
import { readGovernanceRules, extractRules } from '../../../logic/organization'

const GovernanceRules = ({element, proposalId}) => {

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
      } else if(element.modelIndex !== undefined) {
        vals = await extractRules({provider : element.proposalsManager.currentProvider}, element.validatorsAddresses[element.votingRulesIndex], true)
        terms = await extractRules({provider : element.proposalsManager.currentProvider}, element.canTerminateAddresses[element.votingRulesIndex])
      } else {
        vals = await extractRules({provider : element.proposalsManager.currentProvider}, element.validatorsAddresses[element.votingRulesIndex], true)
        terms = await extractRules({provider : element.proposalsManager.currentProvider}, element.canTerminateAddresses[element.votingRulesIndex])
      }
      setCleanValidators(vals || [])
      setCleanCanTerminates(terms || [])
    })
  }, [])

  if(!cleanValidators) {
    return <CircularProgress/>
  }

  return (<>
    {cleanCanTerminates && cleanCanTerminates.length > 0 && <>
      <h6>Termination rules</h6>
      <div className={style.Rule}>
        {cleanCanTerminates.map((it, i) => <Fragment key={"val_" + i}>
          <p>
            <b>{it.text}</b>
            <br/>
            {it.value && <span>{it.value}</span>}
          </p>
          {i < cleanCanTerminates.length - 1 && <>
            <br/>
            <h7>Or</h7>
            <br/>
          </>}
        </Fragment>)}
      </div>
    </>}
    {cleanValidators && cleanValidators.length > 0 && <>
      <h6>Validation rules</h6>
      <div className={style.Rule}>
        {cleanValidators.map((it, i) => <Fragment key={"val_" + i}>
          <p>
            <b>{it.text}</b>
            <br/>
            {it.value && <span>{it.value}</span>}
          </p>
          {i < cleanValidators.length - 1 && <>
            <br/>
            <h7>And</h7>
            <br/>
          </>}
        </Fragment>)}
      </div>
    </>}
  </>
  )
}

export default GovernanceRules
