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
    <>
      <div className={style.ComingSoon}>
        <img src={`${process.env.PUBLIC_URL}/img/cov.png`}></img>
        <h6>Covenants will be implemented soon! In the meantime, you can use it via the <a target="_blank" href="https://covenants.eth.link">Covenants Interface</a></h6>
      </div>
    </>
  )
}

CovenantsMain.pluginIndex = 30;
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
          link: '/covenants/dapp'
        },
      })

      addElement('appMenu', {
        name: 'covenants',
        label: 'Covenants',
        link: '/covenants/dapp',
        index,
        image : `${process.env.PUBLIC_URL}/img/is3.png`,
      })
    }

export default CovenantsMain
