import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './covenants-sections.module.css'
import RoutinesExplore from '../SubSections/routines-explore.js'
import RoutineView from '../SubSections/routine-view.js'




const RoutinesMain = (props) => {
  return (
  <div className={style.CovenantsMainBox}>
    <RoutinesExplore></RoutinesExplore>
  </div>
  )
}


export default RoutinesMain
