import React, {useState} from 'react'

import { useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'
import {all} from '../../../../logic/organization'
import Web3DependantList from '../../../../components/Global/Web3DependantList'
import ExploreOrganizations from '../../../../components/Organizations/ExploreOrganizations'

import style from '../../../../all.module.css'
import Banners from '../../../../components/Global/banners/index.js'

const SubDAOsList = ({}) => {

  const context = useEthosContext()
  const {getGlobalContract, newContract, chainId} = useWeb3()

  const [modal, setModal] = useState(true)

  return (<>
    <Banners bannerA="banner1" bannerB="banner2" sizeA="30%" sizeB="63%" titleA="Purely On-Chain Governance" titleB="The Next Generation of Human Coordination" linkA="https://docs.ethos.wiki/ethereansos-docs/guilds/guilds-learn" linkB="https://docs.ethos.wiki/ethereansos-docs/guilds/guilds-documentation" textA="EthOS Organizations are 100% on-chain and deeply customizable DAOs." textB="Decentralized without compromise, EthOS Organizations give you the tools you need to govern and manage your political economy in a deeply granular and entirely transparent way."/>
    <div className={style.OrganizationsExploreMain}>
      <Web3DependantList
        Renderer={ExploreOrganizations}
        rendererIsContainer
        provider={() => all({context, getGlobalContract, newContract, chainId, factoryOfFactories : getGlobalContract('factoryOfFactories')}) }
      />
    </div>
  </>)
}

SubDAOsList.menuVoice = {
  label : 'Organizations',
  path : '/guilds/dapp',
  contextualRequire : () => require.context('./', false, /.js$/),
  index : 0
}

export default SubDAOsList