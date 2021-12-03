import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './organizations-main-sub-sections.module.css'
import RegularMiniButton from '../../../../components/Global/RegularMiniButton'
import OrgMainThingsCard from '../../../../components/Organizations/OrgMainThingsCard'
import OrgThingsCardConnected from '../../../../components/Organizations/OrgThingsCardConnected'
import Web3DependantList from '../../../../components/Global/Web3DependantList'

const GovernanceItems = ({element}) => {
  return <Web3DependantList
    Renderer={OrgThingsCardConnected}
    rendererIsContainer
    renderedProperties={{element, title : 'Governance Items'}}
    provider={() => element.proposalsConfiguration.votingTokens}
  />
}

const Delegations = ({element}) => {
  return <Web3DependantList
    Renderer={OrgThingsCardConnected}
    rendererIsContainer
    renderedProperties={{element, title : 'Delegations'}}
    provider={() => []}
    allowEmpty
  />
}

export default ({element}) => {
  return (
    <div className={style.OrgThingsCards}>
      <GovernanceItems element={element}/>
      <Delegations element={element}/>
      <OrgMainThingsCard element={element}/>
    </div>
  )
}