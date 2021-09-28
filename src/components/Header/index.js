import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'
import Navigation from '../../components/Navigation'

import style from './header.module.css'

const Header = (props) => {
  return (
    <>
      <header className={style.root}>
        <a className={style.logoMain}><img src={`${process.env.PUBLIC_URL}/img/logo_main.png`}></img></a>
      </header>
      <Navigation menuName={props.menuName} isDapp={props.isDapp} />
    </>
  )
}

export default Header
