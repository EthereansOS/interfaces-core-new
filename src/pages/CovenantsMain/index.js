import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './covenants-main.module.css'
import FarmMain from './Sections/farm-main.js'
import RoutinesMain from './Sections/routines-main.js'
import TradeMain from './Sections/trade-main.js'
import DoubleDappMenu from './../../components/Global/DoubleDappMenu/index.js'
import DappBannerExpl from './../../components/Global/DappBannerExpl/index.js'

const CovenantsMain = () => {
  return (
    <div className={style.Web3PagesRoot}>
          <DappBannerExpl></DappBannerExpl>
          <DoubleDappMenu></DoubleDappMenu>
          <RoutinesMain></RoutinesMain>
    </div>
  )
}

CovenantsMain.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/covenants',
        Component: CovenantsMain,
        exact: true,
        requireConnection: false,
        templateProps: {
          menuName: 'appMenu',
          isDapp: false,
        },
      })

      addElement('appMenu', {
        name: 'covenants',
        label: 'Covenants',
        link: '/covenants',
        index,
      })
    }

export default CovenantsMain
