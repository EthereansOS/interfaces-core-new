import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './org-main-things-card.module.css'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import Upshots from '../../Organizations/Upshots/index.js'

const OrgMainThingsCard = (props) => {
  return (
    <>
      <div className={style.OrgMainThingsCard}>
        <div className={style.OrgThingsTitle}>
          <h6>Earnings Splitter</h6>
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
      <div className={style.OrgPartViewF}>
        <div className={style.OrgPartFarm}>
          <a><img src={`${process.env.PUBLIC_URL}/img/eth_logo.png`}></img></a>
          <p><b>Dividends</b><br></br>APR: 20%<br></br>Daily reward rate: 19,000 ETH</p>
        </div>
        <div className={style.OrgPartFarm}>
          <a><img src={`${process.env.PUBLIC_URL}/img/tokentest/os.png`}></img></a>
          <p><b>Farm OS</b><br></br>APR: 100%<br></br>Daily reward rate: 66,000 OS</p>
        </div>
      </div>

      <div className={style.OrgPartView}>
        <div className={style.OrgPartTitle}>
          <h6>Investments Fund</h6>
          <ExtLinkButton/>
          <ExtLinkButton/>
        </div>
        <div className={style.OrgPartInfo}>
          <p><b>Estimated Next buy</b><br></br>$40,000</p>
        </div>
        <div className={style.OrgPartInfo}>
          <p><b>Fund Size</b><br></br>$400,000,000</p>
        </div>
        <div className={style.OrgPartInfo}>
          <p><b>Routines</b><br></br>2</p>
        </div>
        <div className={style.InvestmentsSection}>
          <div className={style.InvestmentsSectionBuySell}>
            <p>Estimated <b>50</b><a><img src={`${process.env.PUBLIC_URL}/img/eth_logo.png`}></img></a> <b>swap </b> for <a><img src={`${process.env.PUBLIC_URL}/img/tokentest/cro.png`}></img></a><a><img src={`${process.env.PUBLIC_URL}/img/tokentest/cro.png`}></img></a><a><img src={`${process.env.PUBLIC_URL}/img/tokentest/cro.png`}></img></a><a><img src={`${process.env.PUBLIC_URL}/img/tokentest/cro.png`}></img></a><a><img src={`${process.env.PUBLIC_URL}/img/tokentest/os.png`}></img><span>&#128293;</span></a></p>
            <p>Every 3 months</p>
            <ExtLinkButton/>
            <ExtLinkButton/>
          </div>
          <div className={style.InvestmentsSectionBuySell}>
            <p><b>Swap:</b> <a><img src={`${process.env.PUBLIC_URL}/img/tokentest/cro.png`}></img></a><a><img src={`${process.env.PUBLIC_URL}/img/tokentest/cro.png`}></img></a><a><img src={`${process.env.PUBLIC_URL}/img/tokentest/cro.png`}></img></a><a><img src={`${process.env.PUBLIC_URL}/img/tokentest/os.png`}></img></a><a><img src={`${process.env.PUBLIC_URL}/img/tokentest/os.png`}></img></a> for <a><img src={`${process.env.PUBLIC_URL}/img/eth_logo.png`}></img></a></p>
            <p>Weekly</p>
            <ExtLinkButton/>
            <ExtLinkButton/>
          </div>
        </div>
      </div>
      <div className={style.OrgPartView}>
        <div className={style.OrgPartTitle}>
          <h6>Delegations grants</h6>
          <ExtLinkButton/>
          <ExtLinkButton/>
        </div>
        <div className={style.OrgPartInfo}>
          <p><b>Estimated Next grant</b><br></br>$50,000</p>
        </div>
        <div className={style.OrgPartInfo}>
          <p><b>Active Delegations</b><br></br>5</p>
        </div>
        <div className={style.OrgPartInfo}>
          <p><b>Supporters stake</b><br></br>500,000</p>
        </div>
        <div className={style.DelegationsSection}>
         <h6>Grant chart</h6>
          <div className={style.DelegationsSectionOne}>
            <figure><img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img></figure>
            <Upshots/>
          </div>
          <div className={style.DelegationsSectionOne}>
            <figure><img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img></figure>
            <Upshots/>
          </div>
          <div className={style.DelegationsSectionOne}>
            <figure><img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img></figure>
            <Upshots/>
          </div>
          <div className={style.DelegationsSectionOne}>
            <figure><img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img></figure>
            <Upshots/>
          </div>
        </div>
      </div>
    </>
  )
}

export default OrgMainThingsCard
