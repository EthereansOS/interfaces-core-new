import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'
import Navigation from '../Navigation'
import style from './dapp-sub-menu.module.css'

const DappSubMenu = (props) => {
  return (
      /* ---For Items Collections View---
        
      <ul className={style.DappSubMenu}>
        <li><a>Items</a></li>
        <li><a>Metadata</a></li>
        <li><a>Code</a></li>
        <li><a>Trade</a></li>
        <li><a>Farm</a></li>
        <li><a>Organizations</a></li>
      </ul> */
      
      /* ---For Items View---
        
      <ul className={style.DappSubMenu}>
        <li><a>Metadata</a></li>
        <li><a>Code</a></li>
        <li><a>Farm</a></li>
        <li><a>Organizations</a></li>
      </ul> */

      <ul className={style.DappSubMenu}>
        <li><a>Collection</a></li>
        <li><a>Metadata</a></li>
        <li><a>Code</a></li>
        <li><a>Farm</a></li>
        <li><a>Organizations</a></li>
      </ul>
  )
}

export default DappSubMenu
