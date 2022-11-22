import React, { useEffect, useState } from 'react'

import { useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'
import {all} from '../../../../logic/delegation'
import Web3DependantList from '../../../../components/Global/Web3DependantList'
import ExploreOrganizations from '../../../../components/Organizations/ExploreOrganizations'
import Banners from '../../../../components/Global/banners/index.js'

import style from '../../../../all.module.css'

const DelegationsList = ({ mine, onList }) => {

  const [list, setList] = useState()

  useEffect(() => {
    list && onList && onList(list)
  }, [list])

  const context = useEthosContext()
  const {getGlobalContract, newContract, chainId, account} = useWeb3()

  return (<>
  <Banners bannerA="banner1" bannerB="banner2" sizeA="36%" sizeB="54%" titleA="Rule Together" titleB="Be a Player In the Game of Guilds" linkA="https://docs.ethos.wiki/ethereansos-docs/guilds/guilds-documentation/delegations/how-delegations-work" linkB="https://docs.ethos.wiki/ethereansos-docs/guilds/guilds-documentation/delegations" textA="Delegations are independent political parties that compete with each other for grant funding from one or more EthOS Organizations." textB="Create and lead a Delegation. Rally the support of an EthOS Organization’s token holders to win grant funding. Use that funding to govern your Delegation’s political economy with your supporters."/>
  <div className={style.OrganizationsExploreMain}>
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
  </div>
  </>)
}

DelegationsList.menuVoice = {
  label : 'Delegations',
  path : '/guilds/delegations/',
  contextualRequire : () => require.context('./', false, /.js$/),
  index : 1
}

export default DelegationsList