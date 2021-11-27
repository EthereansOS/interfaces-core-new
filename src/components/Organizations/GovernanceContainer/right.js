import React from 'react'

import SurveyLess from './survey-less'
import Survey from './survey'

import style from '../../../all.module.css'

export default ({element, proposal, metadata}) => {

  var proposalType = proposal.isPreset ? 'surveyless' : proposal.proposalType

  return (
    <div className={style.Govright}>
      {proposalType !== 'surveyless' && proposalType !== 'poll' ?
        <Survey {...{element, proposal, metadata}}/> : <SurveyLess {...{element, proposal, metadata}}/>
      }
    </div>
  )
}
