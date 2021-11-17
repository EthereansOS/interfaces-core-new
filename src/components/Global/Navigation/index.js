import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './navigation.module.css'

const Navigation = ({ menuName, isDapp }) => {
  const menuItems = usePlaceholder(menuName)

  const navItem = (item) => {
    return (
      <Link  className={style.item} key={item.name} to={item.link}>
        <span>
           <img src={item.image}></img> <p>{item.label}</p>
        </span>
      </Link>
    )
  }

  return (
    <nav className={style.Navigation}>{menuItems.map((item) => navItem(item))}</nav>
  )
}

export default Navigation
