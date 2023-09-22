import React, { Fragment, useEffect, useState } from 'react'

import CircularProgress from '../../Global/OurCircularProgress'

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
        vals = await extractRules({provider : element.proposalsManager.currentProvider}, element.validatorsAddresses[element.votingRulesIndex], element)
        terms = await extractRules({provider : element.proposalsManager.currentProvider}, element.canTerminateAddresses[element.votingRulesIndex], element)
      } else {
        vals = await extractRules({provider : element.proposalsManager.currentProvider}, element.validatorsAddresses && (element.validatorsAddresses[element.votingRulesIndex] || element.validatorsAddresses) || element.proposalsConfiguration.validatorsAddresses, element.validatorsAddresses ? element : element.proposalsConfiguration)
        terms = await extractRules({provider : element.proposalsManager.currentProvider}, element.canTerminateAddresses && (element.canTerminateAddresses[element.votingRulesIndex] || element.canTerminateAddresses) || element.proposalsConfiguration.canTerminateAddresses, element.canTerminateAddresses ? element : element.proposalsConfiguration)
      }
      setCleanValidators(vals || [])
      setCleanCanTerminates(terms || [])
    })
  }, [])

  if(!cleanValidators) {
    return <CircularProgress/>
  }

  return (<>
    {cleanCanTerminates && cleanCanTerminates.map(it => <div key={it.label} className={style.Rule}>
      <p>
        <b>{it.text}</b>
        <br/>
        {it.value && <span>{it.value}</span>}
      </p>
    </div>)}
    {cleanValidators && cleanValidators.map(it => <div key={it.label} className={style.Rule}>
      <p>
        <b>{it.text}</b>
        <br/>
        {it.value && <span>{it.value}</span>}
      </p>
    </div>)}
  </>
  )
}

export default GovernanceRules
