import React, { useState, useEffect } from 'react'
import style from '../../../all.module.css'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import LogoRenderer from '../../Global/LogoRenderer'
import { HeaderOsInflationRateActiveSelection, HeaderStateManagerVariable } from './verticalizations'
import { useEthosContext, useWeb3, getNetworkElement, fromDecimals, blockchainCall } from '@ethereansos/interfaces-core'

export default ({element, onToggle}) => {

  const context = useEthosContext()

  const { web3, newContract, chainId, block } = useWeb3()

  var type = element.organization.type

  const [opened, setOpened] = useState(false)

  useEffect(() => onToggle && onToggle(opened), [opened])

  useEffect(() => {
    updateDelegationValues()
  }, [block, element?.delegationsManager?.wrappedToken])

  const [grantSize, setGrantSize] = useState()
  const [supportersStake, setSupportersStake] = useState()

  async function updateDelegationValues() {
    if(type !== 'delegation' || !element.delegationsManager) {
      return
    }
    setGrantSize(await web3.eth.getBalance(element.delegationsManager.treasuryManagerAddress))
    element.delegationsManager.wrappedToken && setSupportersStake(await blockchainCall(element.delegationsManager.wrappedToken.mainInterface.methods.totalSupply, element.delegationsManager.wrappedToken.id))
  }

  var Component;

  element.name === 'OS Inflation Rate' && (Component = <HeaderOsInflationRateActiveSelection element={element}/>)
  element.name === 'FoF Fee (Transaction)' && (Component = <HeaderStateManagerVariable element={element} name="factoryOfFactoriesFeePercentageTransacted" decimals="16" suffix=" %"/>)
  element.name === 'FoF Fee (Token)' && (Component = <HeaderStateManagerVariable element={element} name="factoryOfFactoriesFeePercentageBurn"  decimals="16" suffix=" %"/>)
  element.name === 'Covenants Farming Fee (Transaction)' && (Component = <HeaderStateManagerVariable element={element} name="farmingFeePercentageTransacted" decimals="16" suffix=" %"/>)
  element.name === 'Covenants Farming Fee (Burn)' && (Component = <HeaderStateManagerVariable element={element} name="farmingFeeBurnOS" decimals="18" suffix=" OS"/>)
  element.name === 'Covenants Routine Fee (Transaction)' && (Component = <HeaderStateManagerVariable element={element} name="inflationFeePercentageTransacted" decimals="16" suffix=" %"/>)
  element.name === 'Delegations Grants Insurance' && (Component = <HeaderStateManagerVariable element={element} name="delegationsAttachInsurance" decimals="18" suffix=" OS"/>)

  return (
    <div className={style.GovCardHead}>
      {type === 'delegation' ? <>
        <div className={style.GovCardHeadDelegation}>
          {element.delegationsManager && <LogoRenderer input={element}/>}
          <span>{element.name}</span>
          {element.delegationsManager && <p><b>Grant size:</b><br></br> <a href={`${getNetworkElement({context, chainId}, "etherscanURL")}tokenholdings?a=${element.delegationsManager.treasuryManagerAddress}`} target="_blank">{fromDecimals(grantSize, 18, true)} ETH</a></p>}
          {element.delegationsManager && <p><b>Supporters stake:</b><br></br> {fromDecimals(supportersStake, 18, true)} {element.delegationsManager.supportedToken.symbol}</p>}
          <div className={style.DelegationWalletsCardBTN}>
            <RegularButtonDuo onClick={() => setOpened(!opened)}>{opened ? 'Close' : 'Open'}</RegularButtonDuo>
          </div>
        </div>
      </> : <>
        <div className={style.GovCardHeadOrganization}>
          <div className={style.GovCardHeadOrganizationTitle}>
            <h6>{element.name}</h6>
            <ExtLinkButton text="Etherscan" href={`${getNetworkElement({context, chainId}, 'etherscanURL')}/tokenholdings?a=${element.organization.address}`}/>
            <ExtLinkButton text="Discussion" href={element.discord_url}/>
          </div>
          <div className={style.GovCardHeadOrganizationInfo}>
              <p><b>Type:</b><br></br> {element.isSurveyless ? "Surveyless" : type === 'organization' ? "Survey" : "Poll"}</p>
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