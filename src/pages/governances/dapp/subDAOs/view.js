import React, {useEffect, useState} from 'react'

import style from '../organizations-main-sections.module.css'
import OrgHeadline from '../../../../components/Organizations/OrgHeadline'
import MainSectionView from '../SubSections/main-section-view.js'
import GovernanceSectionView from '../SubSections/governance-section-view.js'
import DappSubMenu from '../../../../components/Global/DappSubMenu/index.js'
import GovernanceContainer from '../../../../components/Organizations/GovernanceContainer'
import { useLocation } from 'react-router'
import CircularProgress from '../../../../components/Global/OurCircularProgress'

import { getOrganization } from '../../../../logic/organization'

import { useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'

const SubDAOView = () => {

  const location = useLocation()
  const context = useEthosContext()
  const {account, newContract, web3, blockchainCall} = useWeb3()

  const [organization, setOrganization] = useState(null)

  useEffect(() => {
    setOrganization(null)
    var organizationAddress= location.pathname.split('/')
    organizationAddress = organizationAddress[organizationAddress.length -1]
    organizationAddress.indexOf("0x") === 0 && getOrganization({context, account, newContract, blockchainCall, web3}, organizationAddress).then(setOrganization)
  }, [location.pathname])

  const [currentView, setCurrentView] = useState('overview')

  const menuVoices = [{
    label : 'Overview',
    view : 'overview',
    component : MainSectionView
  }/*, {
    label : 'Statements',
  }, {
    label : 'DeFi',
  }, {
    label : 'Root',
  }*/, {
    label : 'Governance',
    view : 'governance',
    component : GovernanceContainer
  }/*, {
    label : 'Poll',
  }*/]

  if(organization === null) {
    return <CircularProgress/>
  }

  var Component = menuVoices.filter(it => currentView === it.view)[0].component

  return (
    <div className={style.SingleContentPage}>
      <OrgHeadline element={organization}/>
      <DappSubMenu isSelected={ it => it.view === currentView } voices={menuVoices.map(it => ({...it, onClick : () => it.view && setCurrentView(it.view)}))}/>
      <Component element={organization}/>
    </div>
  )
}

SubDAOView.menuVoice = {
  path : '/governances/dapp/organizations/:id'
}

export default SubDAOView
