import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './factories-main.module.css'

const FactoriesMain = () => {
  return (
    <>
      <Typography className={style.title} variant="h3" color="black">
        Sample page 3
      </Typography>
      <Typography className={style.text} variant="body2" color="black">
        This is a sample page
      </Typography>
    </>
  )
}

FactoriesMain.pluginIndex = 40;
FactoriesMain.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/factories/dapp',
        Component: FactoriesMain,
        exact: true,
        requireConnection: true,
        templateProps: {
          menuName: 'appMenu',
          isDapp: true,
        },
      })

      addElement('appMenu', {
        name: 'Factories',
        label: 'Factories',
        link: '/factories/dapp',
        index,
      })
    }

export default FactoriesMain
