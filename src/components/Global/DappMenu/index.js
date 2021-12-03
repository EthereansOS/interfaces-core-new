import React from 'react'

import { Link } from 'react-router-dom'

import style from '../../../all.module.css'

export default ({voices, selected}) => (
  <ul className={style.Dapp_Menu}>
    {voices.filter(it => it.label).map((voice, i) => <li key={voice.path || voice.id}>
      {voice.path && <Link className={voice.label + (selected === i ? ' selected' : '')} to={voice.path}>{voice.label}</Link>}
      {!voice.path && <a href="javascript:;" className={selected === i ? 'selected' : ''} onClick={voice.onClick}>{voice.label}</a>}
    </li>)}
  </ul>
)

        {/* Covenants MENU START}
        <li><a>Farm</a></li>
        <li><a>Inflation</a></li>
        <li><a>Crafting</a></li>
        <li><a>WUSD</a></li>
        {Covenants MENU END */}