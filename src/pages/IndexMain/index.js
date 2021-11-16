import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'
import { Link } from 'react-router-dom'

import style from './index.module.css'

const IndexMain = () => {
  return (
    <div className={style.IndexPage}>
      <div className={style.IndexHeader}>
        <a className={style.IndexHeaderLogo}>
          <img src={`${process.env.PUBLIC_URL}/img/logo_main_v.png`}></img>
        </a>
        <div className={style.IndexHeaderMenu}>
          <a target="_blank">Products</a>
          <a target="_blank">Documentation</a>
          <a target="_blank">Governance</a>
          <a target="_blank">Community</a>
          <a className={style.IndexHeaderDapp} target="_blank">Launch App</a>
        </div>
      </div>
    </div>
  )
}

IndexMain.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/',
        Component: IndexMain,
        exact: true,
        requireConnection: false,
        templateProps: {
          menuName: 'appMenu',
          isDapp: false,
          componentOnly: true,
        },
      })
    }

export default IndexMain