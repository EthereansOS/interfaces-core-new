import React from 'react'
import { Link } from 'react-router-dom'
import Navigation from '../Navigation'

import style from '../../../all.module.css'
import Web3Connect  from '../Web3Connect'

const Header = (props) => {
  return (
      <header className={style.Header}>
        <div className={style.FixedHeader}>
          <Link to="/dapp" className={style.logoMain}><img src={`${process.env.PUBLIC_URL}/img/logo_main.png`}/></Link>
          <Web3Connect/>
          <Navigation menuName={props.menuName} isDapp={props.isDapp}/>
        </div>
        <div className={style.BlurHeader}></div>
      </header>
  )
}

export default Header
