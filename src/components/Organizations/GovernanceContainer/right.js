import React from 'react'

import SurveyLess from './survey-less'
import Survey from './survey'

import style from '../../../all.module.css'
import OurCircularProgress from '../../Global/OurCircularProgress'

export default ({element, refreshElements, forDelegationVote}) => {

  return (
    <div className={style.Govright}>
      {!element.subProposals && <OurCircularProgress/>}
      {element.subProposals && element.subProposals.length === 0 && 
      <div className={style.NothingToSee}>
      <h4>There are no Proposals right now. To learn more about and follow this project, visit the official links at the top of this page.</h4>
      </div>
      }
      {element.subProposals && element.subProposals.length > 0 && <>
        {element.isSurveyless
          ? <SurveyLess {...{element, refreshElements, forDelegationVote}}/>
          : <Survey {...{element, refreshElements, forDelegationVote}}/>
        }
      </>}
    </div>
  )
}
