import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'
import Navigation from '../Navigation'
import style from './double-dapp-menu.module.css'

const DoubleDappMenu = (props) => {
  return (
    <div className={style.DDapp_Menu}>
      <ul className={style.DDapp_Menu1}>
        <li><a>Farm</a></li>
        <li><a>Routines</a></li>
        <li><a>Trade</a></li>
        <li><a>WUSD</a></li>
      </ul>
      <ul className={style.DDapp_Menu2}>
        <li><a>Explore</a></li>
        <li><a>Positions</a></li>
        <li><a>Hosted</a></li>
        <li><a>Create</a></li>
      </ul>
    </div>
  )
}

export default DoubleDappMenu
