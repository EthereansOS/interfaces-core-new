import React, { useState, useEffect } from 'react'
import style from '../../../all.module.css'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import LogoRenderer from '../../Global/LogoRenderer'
import { HeaderOsInflationRateActiveSelection, HeaderStateManagerVariable } from './verticalizations'

export default ({element, proposal, metadata, onToggle}) => {
  var type = element.type

  const [opened, setOpened] = useState(false)

  useEffect(() => onToggle && onToggle(opened), [opened])

  var Component;

  metadata.name === 'OS Inflation Rate' && (Component = <HeaderOsInflationRateActiveSelection proposal={proposal}/>)
  metadata.name === 'FoF Fee (Transaction)' && (Component = <HeaderStateManagerVariable proposal={proposal} name="factoryOfFactoriesFeePercentageTransacted" decimals="16" suffix=" %"/>)
  metadata.name === 'FoF Fee (Token)' && (Component = <HeaderStateManagerVariable proposal={proposal} name="factoryOfFactoriesFeePercentageBurn"  decimals="16" suffix=" %"/>)
  metadata.name === 'Covenants Farming Fee (Transaction)' && (Component = <HeaderStateManagerVariable proposal={proposal} name="farmingFeePercentageTransacted" decimals="16" suffix=" %"/>)
  metadata.name === 'Covenants Farming Fee (Burn)' && (Component = <HeaderStateManagerVariable proposal={proposal} name="farmingFeeBurnOS" decimals="18" suffix=" OS"/>)
  metadata.name === 'Covenants Routine Fee (Transaction)' && (Component = <HeaderStateManagerVariable proposal={proposal} name="inflationFeePercentageTransacted" decimals="16" suffix=" %"/>)
  metadata.name === 'Covenants Farming Fee (Burn)' && (Component = <HeaderStateManagerVariable proposal={proposal} name="farmingFeeBurnOS" decimals="18" suffix=" OS"/>)
  metadata.name === 'Covenants Routine Fee (Transaction)' && (Component = <HeaderStateManagerVariable proposal={proposal} name="inflationFeePercentageTransacted" decimals="16" suffix=" %"/>)

  return (
    <div className={style.GovCardHead}>
      {type === 'delegation' ? <>
        <div className={style.GovCardHeadDelegation}>
            <LogoRenderer input={element}/>
            <span>EthOS Organization</span>
            <p><b>Grant size:</b><br></br> 40 ETH</p>
            <p><b>Supporters stake:</b><br></br> 100,000 OS</p>
            <div className={style.DelegationWalletsCardBTN}>
              <RegularButtonDuo></RegularButtonDuo>
            </div>
        </div>
      </> : <>
      <div className={style.GovCardHeadOrganization}>
        <div className={style.GovCardHeadOrganizationTitle}>
          <h6>{metadata.name}</h6>
          <ExtLinkButton></ExtLinkButton>
          <ExtLinkButton></ExtLinkButton>
          <ExtLinkButton></ExtLinkButton>
        </div>
        <div className={style.GovCardHeadOrganizationInfo}>
            <p><b>Type:</b><br></br> {proposal.isPreset ? "Surveyless" : type === 'organization' ? "Survey" : "Poll"}</p>
            {Component && <p><b>Active Selection:</b><br/> {Component}</p>}
        </div>
        <div className={style.GovernanceCardInfoOpen}>
            <RegularButtonDuo onClick={() => setOpened(!opened)}>{opened ? 'Close' : 'Open'}</RegularButtonDuo>
        </div>
      </div>
      </>}
   </div>
  )
}