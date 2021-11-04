import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './covenants-sections.module.css'
import FarmExplore from '../SubSections/farm-explore.js'
import FarmView from '../SubSections/farm-view.js'




const FarmMain = (props) => {
  return (
  <div className={style.CovenantsMainBox}>
    <FarmView></FarmView>
  </div>
  )
}


export default FarmMain
