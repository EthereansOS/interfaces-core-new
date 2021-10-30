import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './covenants-sections.module.css'
import FarmExplore from '../SubSections/farm-explore.js'




const FarmMain = (props) => {
  return (
  <div className={style.CovenantsMainBox}>
    <FarmExplore></FarmExplore>
  </div>
  )
}


export default FarmMain
