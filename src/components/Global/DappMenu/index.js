import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'
import Navigation from '../Navigation'
import style from './dapp-menu.module.css'

const DappMenu = ({voices}) => {
  return (
      <ul className={style.Dapp_Menu}>
        {voices.filter(it => it.label).map(voice => <li key={voice.path || voice.id}>
          {voice.path && <Link to={voice.path}>{voice.label}</Link>}
          {!voice.path && <a href="javascript:;" onClick={voice.onClick}>{voice.label}</a>}
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
