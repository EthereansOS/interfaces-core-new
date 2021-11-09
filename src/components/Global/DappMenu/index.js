import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'
import Navigation from '../Navigation'
import style from './dapp-menu.module.css'

const DappMenu = ({voices}) => {
  return (
      <ul className={style.Dapp_Menu}>
        {voices.map(voice => <li key={voice.linkTo}>
          <Link to={voice.linkTo}>{voice.label}</Link>
        </li>)}
        {/* Covenants MENU START}
        <li><a>Farm</a></li>
        <li><a>Inflation</a></li>
        <li><a>Crafting</a></li>
        <li><a>WUSD</a></li>
        {Covenants MENU END */}
      </ul>
  )
}

export default DappMenu
