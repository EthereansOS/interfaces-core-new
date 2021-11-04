import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './covenants-main.module.css'
import FarmMain from './Sections/farm-main.js'
import RoutinesMain from './Sections/routines-main.js'
import TradeMain from './Sections/trade-main.js'
import DoubleDappMenu from './../../../components/Global/DoubleDappMenu/index.js'
import DappBannerExpl from './../../../components/Global/DappBannerExpl/index.js'

const CovenantsMain = () => {
  return (
    <div className={style.Web3PagesRoot}>
          <DappBannerExpl></DappBannerExpl>
          <DoubleDappMenu></DoubleDappMenu>
          <FarmMain></FarmMain>
    </div>
  )
}

CovenantsMain.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/covenants/dapp',
        Component: CovenantsMain,
        exact: true,
        requireConnection: true,
        templateProps: {
          menuName: 'appMenu',
          isDapp: true,
        },
      })
    }

export default CovenantsMain
