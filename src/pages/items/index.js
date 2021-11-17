import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'
import { Link } from 'react-router-dom'

import style from './items-main.module.css'

const ItemsMain = (props) => {
  return (
      <div className={style.Web3PagesRoot}>
        <Typography className={style.title} variant="h3" color="black">
          Qua ci scrivo le zozzerie offiCéin di Items
        </Typography>
        <Link to="dapp">
          Andiamo Onnicéin che è meglio valà
        </Link>
      </div>
  )
}

/*ItemsMain.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/',
        Component: ItemsMain,
        exact: true,
        requireConnection: false,
        templateProps: {
          menuName: 'appMenu',
          isDapp: false,
        },
      })

      addElement('appMenu', {
        name: 'Items',
        label: 'Items',
        icon: '${process.env.PUBLIC_URL}/img/ethereum.png',
        link: '/',
        index,
      })
    }*/

export default ItemsMain
