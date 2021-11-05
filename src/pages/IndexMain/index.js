import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'
import { Link } from 'react-router-dom'

import style from './index.module.css'

const IndexMain = () => {
  return (
      <div className={style.Web3PagesRoot}>
        <Typography className={style.title} variant="h3" color="black">
          Qua ci scrivo le zozzerie offiCéin
        </Typography>
        <Link to="dapp">
          Andiamo Onnicéin che è meglio valà
        </Link>
      </div>
  )
}

IndexMain.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/',
        Component: IndexMain,
        exact: true,
        requireConnection: false,
        templateProps: {
          menuName: 'appMenu',
          isDapp: false,
        },
      })
    }

export default IndexMain