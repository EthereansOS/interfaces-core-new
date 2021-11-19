import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from '../organizations-main-sections.module.css'
import OrgHeadline from '../../../../components/Organizations/OrgHeadline'
import DelegationHeadline from '../../../../components/Organizations/DelegationHeadline'
import DelegationsMainSectionView from '../SubSections/delegations-main-section-view.js'
import GovernanceSectionView from '../SubSections/governance-section-view.js'
import DappSubMenu from '../../../../components/Global/DappSubMenu/index.js'
import GovernanceContainer from '../../../../components/Organizations/GovernanceContainer'


const DelegationView = (props) => {
  const type = 'delegation'
  const proposalType = 'gigi'
  return (
    <>
      <div className={style.SingleContentPage}>
        <DelegationHeadline></DelegationHeadline>
        {<GovernanceContainer
          headProperties={{type, proposalType}}
          leftProperties={{type, proposalType}}
          rightProperties={{type, proposalType}}
        />}

      </div>
    </>
  )
}

DelegationView.menuVoice = {
  path : '/governances/dapp/delegations/:id'
}

export default DelegationView
