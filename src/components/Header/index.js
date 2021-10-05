import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'
import Navigation from '../../components/Navigation'

import style from './header.module.css'
import Web3Connect  from '../../components/Web3Connect/index.js'

const Header = (props) => {
  return (
      <header className={style.Header}>
        <div className={style.FixedHeader}>
          <a className={style.logoMain}><img src={`${process.env.PUBLIC_URL}/img/logo_main.png`}></img></a>
          <Navigation menuName={props.menuName} isDapp={props.isDapp} />
          <Web3Connect></Web3Connect>
        </div>
        <div className={style.BlurHeader}></div>
      </header>
  )
}

export default Header
