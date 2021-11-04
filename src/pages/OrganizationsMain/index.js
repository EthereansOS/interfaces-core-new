import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './organizations-main.module.css'
import { Link } from 'react-router-dom'

const OrganizationsMain = () => {
  return (
    <>
      <Typography className={style.title} variant="h3" color="black">
        Qua ci scrivo le zozzerie offiCéin di Organizations
      </Typography>
      <Link to="organizations/dapp">
        Andiamo Onnicéin che è meglio valà
      </Link>
    </>
  )
}

OrganizationsMain.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/organizations',
        Component: OrganizationsMain,
        exact: true,
        requireConnection: false,
        templateProps: {
          menuName: 'appMenu',
          isDapp: false,
        },
      })

      addElement('appMenu', {
        name: 'Organizations',
        label: 'Organizations',
        link: '/organizations',
        index
      })
    }

export default OrganizationsMain
