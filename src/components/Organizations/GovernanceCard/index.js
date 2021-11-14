import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './governance-card.module.css'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import SurveylessOpenCard from '../../Organizations/SurveylessOpenCard/index.js'
import NotSupportedGeneralGovernanceOpenCard from '../../Organizations/NotSupportedGeneralGovernanceOpenCard/index.js'
import FundOpenCard from '../../Organizations/FundOpenCard/index.js'


const OrgHeadline = (props) => {
  return (
    <>
  
    {/* Surveyless   */}
    <div className={style.GovernanceCard}>
      <div className={style.GovernanceCardTitle}>
        <h6>Factories OF Factories (FOF) Protocol Fees</h6>
        <ExtLinkButton></ExtLinkButton>
        <ExtLinkButton></ExtLinkButton>
        <ExtLinkButton></ExtLinkButton>
        <p>This is a Surveyless Governance to let $OS holders decide the amount of fees the EthereansOS Organization earns from the Factory Of Factories usage. You can find more information about the FOF and surveyless Governances at https://ethos.eth.link. <a>More</a></p>
      </div>
      <div className={style.GovernanceCardInfo}>
          <div className={style.GovernanceCardInfoText}>
           <p><b>Type:</b><br></br> Surveyless</p>
          </div>
          <div className={style.GovernanceCardInfoText}>
           <p><b>Active Selection:</b><br></br> 0.04%</p>
          </div>
          <div className={style.GovernanceCardInfoText}>
           <p><b>Treshold:</b><br></br> 2,000,000 Votes</p>
          </div>
          <div className={style.GovernanceCardInfoOpen}>
            <RegularButtonDuo></RegularButtonDuo>
          </div>
      </div>
      <SurveylessOpenCard></SurveylessOpenCard>
    </div>

    {/* NotSupported Unlisted */}

   {/*  <div className={style.GovernanceCard}>
      <div className={style.GovernanceCardTitle}>
        <h6>A regular not standard voting system in a DAO</h6>
        <ExtLinkButton></ExtLinkButton>
        <ExtLinkButton></ExtLinkButton>
        <ExtLinkButton></ExtLinkButton>
        <p>This A regular not standard voting system in a DAO Governance to let $OS holders decide something that the website is not ready to  <a>More</a></p>
      </div>
      <div className={style.GovernanceCardInfo}>
          <div className={style.GovernanceCardInfoText}>
           <p><b>Type:</b><br></br> Regular</p>
          </div>
          <div className={style.GovernanceCardInfoText}>
           <p><b>Treshold:</b><br></br> 2,000,000 Votes</p>
          </div>
          <div className={style.GovernanceCardInfoText}>
           <p><b>Survey Duration:</b><br></br> 1 Week</p>
          </div>
          <div className={style.GovernanceCardInfoOpen}>
            <RegularButtonDuo></RegularButtonDuo>
          </div>
      </div>
      <NotSupportedGeneralGovernanceOpenCard></NotSupportedGeneralGovernanceOpenCard>
    </div> */}

    {/* NotSupported Unlisted */}

    {/* Fund Buy  */}

    <div className={style.GovernanceCard}>
      <div className={style.GovernanceCardTitle}>
        <h6>Quarter Ling Term Fund - Buy</h6>
        <ExtLinkButton></ExtLinkButton>
        <ExtLinkButton></ExtLinkButton>
        <ExtLinkButton></ExtLinkButton>
        <p>With the Ethereum received from the Organization earnings. The EthOS Organization buy 4 Tokens every Quorter (3 months) and send them to the Fund Treasury + The Organization buy a 20% of OS and burn them. In this governance section OS holders can decide the 4 tokens to buy.<a>More</a></p>
      </div>
      <div className={style.GovernanceCardInfo}>
          <div className={style.GovernanceCardInfoText}>
           <p><b>Active Selection:</b><br></br> Buy <a>USDC</a>, <a>DAI</a>, <a>UNI</a>, <a>ENS</a> to hold.<br></br> Buy <a>OS</a> to burn</p>
          </div>
          <div className={style.GovernanceCardInfoText}>
           <p><b>Next Buy:</b><br></br> <a>4572t5722</a></p>
          </div>
          <div className={style.GovernanceCardInfoText}>
           <p><b>Current Funding:</b><br></br> 200 ETH</p>
          </div>
          <div className={style.GovernanceCardInfoOpen}>
            <RegularButtonDuo></RegularButtonDuo>
          </div>
      </div>
      <FundOpenCard></FundOpenCard>
    </div>

    {/* Fund Buy  END*/}
    </>
  )
}

export default OrgHeadline
