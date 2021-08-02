import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './header.module.css'

const Header = () => {
  return (
    <Link to="/">
      <header className={style.root}>
        <Typography variant="h3" color="white">
          Core new
        </Typography>
      </header>
    </Link>
  )
}

export default Header
