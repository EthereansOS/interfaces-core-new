import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './farm-setup.module.css'
import RegularButton from '../../Global/RegularButton/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import ItemLinkButton from '../../Global/ItemLinkButton/index.js'

const FarmSetup = (props) => {
  return (
    <>
      {/*Single setup Start*/}
      <div className={style.RoutineOperation}>
        <div className={style.RoutineOperationSchedule}>
        </div>
        <div className={style.RoutineOperationTB}>
            <ExtLinkButton></ExtLinkButton>
            <ExtLinkButton></ExtLinkButton>
            <ExtLinkButton></ExtLinkButton>
            <ExtLinkButton></ExtLinkButton>
            <ExtLinkButton></ExtLinkButton>
            <ExtLinkButton></ExtLinkButton>
          </div>

          
      </div>
      {/*Single setup End*/}
    </>
  )
}

export default FarmSetup
