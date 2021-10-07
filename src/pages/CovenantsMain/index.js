import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './covenants-main.module.css'
import FarmMain from './Sections/farm-main.js'

const CovenantsMain = () => {
  return (
    <div className={style.Web3PagesRoot}>
        <div className={style.CovenantsMainBox}>
          <FarmMain></FarmMain>
      </div>
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
