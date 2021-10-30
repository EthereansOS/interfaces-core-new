import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './routine-info.module.css'
import BackButton from '../../Global/BackButton/index.js'
import RegularButton from '../../Global/RegularButton/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'

const RoutineInfo = (props) => {
  return (
    <div className={style.RutineBox}>
      <div className={style.RutineTitle}>
        <h2>EthOS Fixed Inflation - OS token daily</h2>
        <div className={style.RutineBack}>
          <BackButton></BackButton>
        </div>
      </div>
    </div>
  )
}

export default RoutineInfo
