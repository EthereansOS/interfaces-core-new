import React, { useState } from 'react'

import { Link } from 'react-router-dom'
import { useEthosContext, useWeb3 } from 'interfaces-core'
import { all } from '../../../../logic/organization'
import Web3DependantList from '../../../../components/Global/Web3DependantList'
import ExploreOrganizations from '../../../../components/Organizations/ExploreOrganizations'

import style from '../../../../all.module.css'
import Banners from '../../../../components/Global/banners/index.js'
import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'

const SubDAOsList = ({}) => {
  const context = useEthosContext()
  const { getGlobalContract, newContract, chainId } = useWeb3()

  const [modal, setModal] = useState(true)

  return (
    <div className={style.SectionMinWidth}>
      <ScrollToTopOnMount />

      {/*<Banners bannerA="banner1" bannerB="banner2" sizeA="30%" sizeB="63%" titleA="Purely On-Chain Governance" titleB="The Next Generation of Human Coordination" linkA="https://docs.ethos.wiki/ethereansos-docs/guilds/guilds-learn" linkB="https://docs.ethos.wiki/ethereansos-docs/guilds/guilds-documentation" textA="EthOS Organizations are 100% on-chain and deeply customizable DAOs." textB="Decentralized without compromise, EthOS Organizations give you the tools you need to govern and manage your political economy in a deeply granular and entirely transparent way."/>*/}
      <ul className={style.SectionSubMenuItems}>
        <li className={style.SectionSubMenuItemsActive}>
          <Link to="/organizations">Organizations</Link>
        </li>
        <li>
          <Link to="/organizations/delegations">Delegations</Link>
        </li>
      </ul>
      <div className={style.ItemsExploreMainTitleArea}>
        <h2>Organizations</h2>
        <Link
          to="/organizations/create/organization"
          className={style.ItemsExploreMainCategoriesCreateElement}
          style={{ marginTop: '10px' }}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"></path>
            <path
              d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"></path>
            <path
              d="M2.67004 18.9501L7.60004 15.6401C8.39004 15.1101 9.53004 15.1701 10.24 15.7801L10.57 16.0701C11.35 16.7401 12.61 16.7401 13.39 16.0701L17.55 12.5001C18.33 11.8301 19.59 11.8301 20.37 12.5001L22 13.9001"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"></path>
          </svg>
          <span>Create</span>
        </Link>
        <p>A Modular and Granular Onchain Approach to DAO Tooling</p>
        <div
          className={style.ItemsExploreMainSearch}
          style={{ marginRight: '140px' }}>
          <input placeholder="Search organization..." />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"></path>
            <path
              d="M22 22L20 20"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"></path>
          </svg>
        </div>
      </div>
      <div className={style.OrganizationsExploreMain}>
        <Web3DependantList
          Renderer={ExploreOrganizations}
          rendererIsContainer
          provider={() =>
            all({
              context,
              getGlobalContract,
              newContract,
              chainId,
              factoryOfFactories: getGlobalContract('factoryOfFactories'),
            })
          }
        />
      </div>
    </div>
  )
}

SubDAOsList.menuVoice = {
  label: 'Organizations',
  path: '/organizations',
  contextualRequire: () => require.context('./', false, /.js$/),
  index: 0,
}

export default SubDAOsList
