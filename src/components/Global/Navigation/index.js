import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './navigation.module.css'

const Navigation = ({ menuName, isDapp }) => {
  const menuItems = usePlaceholder(menuName)

  const navItem = (item) => {
    return (
      <Link key={item.name} to={item.link}>
        <div className={style.item}>
            {item.label}
        </div>
      </Link>
    )
  }

  return (
    <nav className={style.Navigation}>{menuItems.map((item) => navItem(item))}</nav>
  )
}

export default Navigation
