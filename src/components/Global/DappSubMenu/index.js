import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'
import style from '../../../all.module.css'

const DappSubMenu = ({voices, isSelected}) => {
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
        <li><a>Collection</a></li>
        <li><a>Metadata</a></li>
        <li><a>Code</a></li>
        <li><a>Farm</a></li>
        <li><a>Organizations</a></li>
      </ul> */

      /* ---For Covenants Farm View---

      <ul className={style.DappSubMenu}>
        <li><a>Collection</a></li>
        <li><a>Metadata</a></li>
        <li><a>Code</a></li>
        <li><a>Farm</a></li>
        <li><a>Organizations</a></li>
      </ul> */

      <ul className={style.DappSubMenu}>
        {voices && voices.map(it => <li key={it.label}>
          <a className={it.label + (isSelected(it) ? (" " + style.selected) : '')} onClick={it.onClick}>{it.label}</a>
        </li>)}
        {!voices && <>
          <li><a>Collection</a></li>
          <li><a>Metadata</a></li>
          <li><a>Code</a></li>
          <li><a>Farm</a></li>
          <li><a>Organizations</a></li>
        </>}
      </ul>
  )
}

export default DappSubMenu
