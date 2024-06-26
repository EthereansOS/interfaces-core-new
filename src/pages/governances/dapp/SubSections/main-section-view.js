import React from 'react'
import { Link } from 'react-router-dom'

import style from '../../../../all.module.css'
import RegularMiniButton from '../../../../components/Global/RegularMiniButton'
import OrgMainThingsCardOld from '../../../../components/Organizations/OrgMainThingsCardOld'
import OrgMainThingsCard from '../../../../components/Organizations/OrgMainThingsCard'
import OrgThingsCardConnected from '../../../../components/Organizations/OrgThingsCardConnected'
import Web3DependantList from '../../../../components/Global/Web3DependantList'
import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'

const GovernanceItems = ({ element }) => {
  return (
    <Web3DependantList
      Renderer={OrgThingsCardConnected}
      rendererIsContainer
      renderedProperties={{ element, title: 'Governance Items' }}
      provider={() => element.proposalsConfiguration.votingTokens}
    />
  )
}

const Delegations = ({ element }) => {
  return <Web3DependantList provider={() => []} allowEmpty />
}

export default ({ element }) => {
  return (
    <div className={style.OrgThingsCards}>
      <ScrollToTopOnMount />

      <GovernanceItems element={element} />
      <Delegations element={element} />
      {element.old && <OrgMainThingsCardOld element={element} />}
      {!element.old && <OrgMainThingsCard element={element} />}
    </div>
  )
}
