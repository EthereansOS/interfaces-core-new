import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './navigation.module.css'

const Navigation = ({ menuName, isDapp }) => {
  const menuItems = usePlaceholder(menuName)

  const navItem = (item) => {
    return (
      <Link key={item.name} to={!isDapp ? item.link : item.dappLink}>
        <div className={style.item}>
          <Typography variant="body2" color="white">
            {item.label}
          </Typography>
        </div>
      </Link>
    )
  }

  return (
    <nav className={style.root}>{menuItems.map((item) => navItem(item))}</nav>
  )
}

export default Navigation
