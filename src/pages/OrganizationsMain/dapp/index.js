import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './organizations-main.module.css'
import DappMenu from './../../../components/Global/DappMenu/index.js'
import OrganizationsExplore  from './sections/organizations-explore'

const OrganizationsMain = () => {
  return (
    <div className={style.Web3PagesRoot}>
      <DappMenu></DappMenu>
      <OrganizationsExplore></OrganizationsExplore>
    </div>
  )
}

OrganizationsMain.pluginIndex = 20;
OrganizationsMain.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/organizations/dapp',
        Component: OrganizationsMain,
        exact: true,
        requireConnection: true,
        templateProps: {
          menuName: 'appMenu',
          isDapp: true,
        },
      })

      addElement('appMenu', {
        name: 'Organizations',
        label: 'Organizations',
        link: '/organizations/dapp',
        index
      })
    }

export default OrganizationsMain
