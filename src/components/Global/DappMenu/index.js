import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'
import Navigation from '../Navigation'
import style from './dapp-menu.module.css'

const DappMenu = (props) => {
  return (
      <ul className={style.Dapp_Menu}>

        {/* ITEMS MENU START 
        <li><a>Items</a></li>
        <li><a>Wrapped</a></li>
        <li><a>Collections</a></li>
        <li><a>Batch</a></li>
        <li><a>Create</a></li>
        <li><a>Wrap</a></li>
         ITEMS MENU END */}

        {/* Covenants MENU START */}
        <li><a>Farm</a></li>
        <li><a>Inflation</a></li>
        <li><a>Crafting</a></li>
        <li><a>WUSD</a></li>
        {/*Covenants MENU END */}
      </ul>
  )
}

export default DappMenu
