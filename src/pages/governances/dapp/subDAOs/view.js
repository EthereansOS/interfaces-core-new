import React, {useState} from 'react'

import style from '../organizations-main-sections.module.css'
import OrgHeadline from '../../../../components/Organizations/OrgHeadline'
import MainSectionView from '../SubSections/main-section-view.js'
import GovernanceSectionView from '../SubSections/governance-section-view.js'
import DappSubMenu from '../../../../components/Global/DappSubMenu/index.js'
import GovernanceContainer from '../../../../components/Organizations/GovernanceContainer'

const SubDAOView = (props) => {
  const type = 'organization'
  const proposalType = 'gigi'

  const [currentView, setCurrentView] = useState('overview')

  const menuVoices = [{
    label : 'Overview',
    onClick : () => setCurrentView('overview')
  }, {
    label : 'Statements',
  }, {
    label : 'DeFi',
  }, {
    label : 'Root',
  }, {
    label : 'Governance',
    onClick : () => setCurrentView('governance')
  }, {
    label : 'Poll',
  }]

  return (
    <>
      <div className={style.SingleContentPage}>
        <OrgHeadline/>
        <DappSubMenu voices={menuVoices}/>
        {currentView === 'overview' && <MainSectionView/>}
        {currentView === 'governance' && <GovernanceContainer
          headProperties={{type, proposalType}}
          leftProperties={{type, proposalType}}
          rightProperties={{type, proposalType}}
        />}
      </div>
    </>
  )
}

SubDAOView.menuVoice = {
  path : '/governances/dapp/organizations/:id'
}

export default SubDAOView
