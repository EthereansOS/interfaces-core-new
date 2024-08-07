import React, { useEffect, useState } from 'react'

import style from '../../../../all.module.css'
import OrgHeadline from '../../../../components/Organizations/OrgHeadline'
import MainSectionView from '../SubSections/main-section-view.js'
import GovernanceSectionView from '../SubSections/governance-section-view.js'

import GovernanceContainer from '../../../../components/Organizations/GovernanceContainer'
import { useLocation } from 'react-router'
import CircularProgress from '../../../../components/Global/OurCircularProgress'

import { getOrganization } from '../../../../logic/organization'

import { useEthosContext, useWeb3, web3Utils } from 'interfaces-core'

import DappMenu from '../../../../components/Global/DappMenu'
import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'

const SubDAOView = () => {
  const location = useLocation()
  const context = useEthosContext()
  const web3Data = useWeb3()

  const [organization, setOrganization] = useState(null)

  useEffect(() => {
    setOrganization(null)
    var organizationAddress = location.pathname.split('/')
    organizationAddress = organizationAddress[organizationAddress.length - 1]
    try {
      getOrganization(
        { ...web3Data, context },
        web3Utils.toChecksumAddress(organizationAddress)
      ).then(setOrganization)
    } catch (e) {}
  }, [location.pathname])

  const [currentView, setCurrentView] = useState('overview')

  const menuVoices = [
    {
      label: 'Overview',
      view: 'overview',
      component: MainSectionView,
    } /*, {
    label : 'Statements',
  }, {
    label : 'DeFi',
  }, {
    label : 'Root',
  }*/,
    {
      label: 'Governance',
      view: 'governance',
      component: GovernanceContainer,
    } /*, {
    label : 'Poll',
  }*/,
  ]

  if (organization === null) {
    return <CircularProgress />
  }

  var Component = menuVoices.filter((it) => currentView === it.view)[0]
    .component

  return (
    <>
      <ScrollToTopOnMount />

      <div className={style.SingleContentPage}>
        <OrgHeadline element={organization} onMetadata={setOrganization}  currentView={currentView} menuVoices={menuVoices} onSetCurrentView={setCurrentView} />
       
        <Component element={organization} />
      </div>
    </>
  )
}

SubDAOView.menuVoice = {
  path: '/organizations/:id',
}

export default SubDAOView
