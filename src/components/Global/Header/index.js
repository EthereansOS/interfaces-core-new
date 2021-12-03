import React from 'react'
import { Link } from 'react-router-dom'
import Navigation from '../Navigation'

import style from '../../../all.module.css'
import Web3Connect  from '../Web3Connect'

import { useThemeSelector } from '../../../logic/uiUtilities'

const Header = (props) => {

  const { themes, theme, setTheme } = useThemeSelector()

  return (
      <header className={style.Header}>
        <div className={style.FixedHeader}>
          <Link to="/dapp" className={style.logoMain}><img src={`${process.env.PUBLIC_URL}/img/logo_main.png`}/></Link>

          <Navigation menuName={props.menuName} isDapp={props.isDapp} selected={props.link}/>
          <Web3Connect/>
          <div className={style.ThemeSelect}>
            <select value={theme} onChange={e => setTheme(e.currentTarget.value)}>
              {themes.map(it => <option key={it.value} value={it.value}>{it.name}</option>)}
            </select>
          </div>
        </div>
        <div className={style.BlurHeader}></div>
      </header>
  )
}

export default Header