import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './governance-card.module.css'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import SurveylessOpenCard from '../../Organizations/SurveylessOpenCard/index.js'
import NotSupportedGeneralGovernanceOpenCard from '../../Organizations/NotSupportedGeneralGovernanceOpenCard/index.js'


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

    {/* Regular Unlisted */}

    <div className={style.GovernanceCard}>
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
    </div>

    </>
  )
}

export default OrgHeadline
