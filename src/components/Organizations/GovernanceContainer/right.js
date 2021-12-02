import React from 'react'

import SurveyLess from './survey-less'
import Survey from './survey'

import style from '../../../all.module.css'

export default ({element, refreshElements}) => {

  return (
    <div className={style.Govright}>
      {element.isSurveyless ?
        <SurveyLess {...{element, refreshElements}}/> :
        <Survey {...{element, refreshElements}}/>
      }
    </div>
  )
}
