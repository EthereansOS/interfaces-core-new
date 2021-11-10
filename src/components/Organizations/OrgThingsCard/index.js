import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './org-things-card.module.css'
import RegularMiniButton from '../../Global/RegularMiniButton/index.js'

const OrgThingsCard = (props) => {
  return (
    <div className={style.OrgThingsCard}>
        <div className={style.OrgThingsTitle}>
          <h6>Treasury</h6>
          <RegularMiniButton></RegularMiniButton>
        </div>
        <div className={style.OrgThingsInfoContent}>
          
        </div>
      </div>
  )
}

export default OrgThingsCard
