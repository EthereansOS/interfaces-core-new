import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './factories-main.module.css'

const FactoriesMain = () => {
  return (
    <>
      <div className={style.ComingSoon}>
        <img src={`${process.env.PUBLIC_URL}/img/fact.png`}></img>
        <h6>Coming Soon. In the meantime you can play with contracts using the <a target="_blank" href="https://docs.ethos.wiki/ethereansos-docs/">documentation</a></h6>
      </div>
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
          link: '/factories/dapp'
        },
      })

      addElement('appMenu', {
        name: 'Factories',
        label: 'Factories',
        link: '/factories/dapp',
        index,
        image : `${process.env.PUBLIC_URL}/img/is4.png`,
      })
    }



export default FactoriesMain
