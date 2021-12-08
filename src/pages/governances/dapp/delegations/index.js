import React, { useEffect, useState } from 'react'

import { useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'
import {all} from '../../../../logic/delegation'
import Web3DependantList from '../../../../components/Global/Web3DependantList'
import ExploreOrganizations from '../../../../components/Organizations/ExploreOrganizations'

import style from '../organizations-main-sections.module.css'

const DelegationsList = ({ mine, onList }) => {

  const [list, setList] = useState()

  useEffect(() => {
    list && onList && onList(list)
  }, [list])

  const context = useEthosContext()
  const {getGlobalContract, newContract, chainId, account} = useWeb3()

  return (<div className={style.OrganizationsExploreMain}>
    <Web3DependantList
      Renderer={ExploreOrganizations}
      rendererIsContainer
      emptyMessage={mine ? "" : undefined}
      discriminant={mine && account}
      provider={() => list || all({context, getGlobalContract, newContract, chainId, account, mine, factoryOfFactories : getGlobalContract('factoryOfFactories')}).then(l => {
        setList(l)
        return l
      }) }
    />
  </div>)
}

DelegationsList.menuVoice = {
  label : 'Delegations',
  path : '/guilds/dapp/delegations/',
  contextualRequire : () => require.context('./', false, /.js$/),
  index : 1
}

export default DelegationsList