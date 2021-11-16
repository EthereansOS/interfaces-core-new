import React from 'react'

import { useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'
import {all} from '../../../../logic/organization'
import Web3DependantList from '../../../../components/Global/Web3DependantList'
import ExploreOrganizations from '../../../../components/Organizations/ExploreOrganizations'

import style from '../organizations-main-sections.module.css'

const SubDAOsList = ({}) => {

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

SubDAOsList.menuVoice = {
  label : 'Organizations',
  path : '/governances/dapp',
  contextualRequire : () => require.context('./', false, /.js$/),
  index : 0
}

export default SubDAOsList