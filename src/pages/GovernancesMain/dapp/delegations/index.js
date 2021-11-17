import React from 'react'

import { useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'
import {all} from '../../../../logic/delegation'
import Web3DependantList from '../../../../components/Global/Web3DependantList'
import ExploreOrganizations from '../../../../components/Organizations/ExploreOrganizations'

import style from '../organizations-main-sections.module.css'

const DelegationsList = ({}) => {

  const context = useEthosContext()
  const {getGlobalContract, newContract, chainId} = useWeb3()

  return (<div className={style.OrganizationsExploreMain}>
    <Web3DependantList
      Renderer={ExploreOrganizations}
      rendererIsContainer
      provider={() => all({context, getGlobalContract, newContract, chainId, factoryOfFactories : getGlobalContract('factoryOfFactories')}) }
    />
  </div>)
}

DelegationsList.menuVoice = {
  label : 'Delegations',
  path : '/governances/dapp/delegations',
  contextualRequire : () => require.context('./', false, /.js$/),
  index : 1
}

export default DelegationsList