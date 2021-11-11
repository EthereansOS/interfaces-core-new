import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './org-things-card-text.module.css'
import RegularMiniButton from '../../Global/RegularMiniButton/index.js'

const OrgThingsCardText = (props) => {
  return (
    <div className={style.OrgThingsCardText}>
      <div className={style.OrgThingsRegularTitle}>
        <h6>Earnings</h6>
        <div className={style.OpenBTN}>
          <RegularMiniButton></RegularMiniButton>
        </div>
      </div>
      <div className={style.OrgThingsRegularInfoContent}>
        <b>Root</b>
        <p><a>Active</a></p>
      </div>
      <div className={style.OrgThingsRegularInfoContent}>
        <b>DAOs</b>
        <p>10</p>
      </div>
      <div className={style.OrgThingsRegularInfoContent}>
        <b>Delegations</b>
        <p><a>13</a></p>
      </div>
    </div>
  )
}

export default OrgThingsCardText
