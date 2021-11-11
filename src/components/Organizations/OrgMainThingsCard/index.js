import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './org-main-things-card.module.css'
import RegularMiniButton from '../../Global/RegularMiniButton/index.js'

const OrgMainThingsCard = (props) => {
  return (
    <div className={style.OrgMainThingsCard}>
      <div className={style.OrgThingsTitle}>
        <h6>Earnings</h6>
        <div className={style.OpenBTN}>
          <RegularMiniButton></RegularMiniButton>
        </div>
      </div>
      <div className={style.OrgThingsInfoContent}>
        <b>Current Period</b>
        <p>35 ETH</p>
      </div>
      <div className={style.OrgThingsInfoContent}>
        <b>Rebalance</b>
        <p>3 Months</p>
      </div>
      <div className={style.OrgThingsInfoContent}>
        <b>Next</b>
        <p><a>252345312</a></p>
      </div>
      
      <div className={style.OrgThingsTitle}>
        <h6>Distribution</h6>
      </div>
      <div className={style.OrgThingsInfoContent}>
        <b>Dividends</b>
        <p>27%</p>
      </div>
      <div className={style.OrgThingsInfoContent}>
        <b>Investments Fund</b>
        <p>25%</p>
      </div>
      <div className={style.OrgThingsInfoContent}>
        <b>Delegations Grants</b>
        <p>40%</p>
      </div>
      <div className={style.OrgThingsInfoContent}>
        <b>Emergency Fund</b>
        <p>8%</p>
      </div>
    </div>
  )
}

export default OrgMainThingsCard
