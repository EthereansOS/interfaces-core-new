import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './organizations-main.module.css'

const OrganizationsMain = () => {
  return (
    <>
      <Typography className={style.title} variant="h3" color="black">
        Sample page 2
      </Typography>
      <Typography className={style.text} variant="body2" color="black">
        This is a sample page
      </Typography>
    </>
  )
}

OrganizationsMain.pluginIndex = 20;
OrganizationsMain.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/organizations/dapp',
        Component: OrganizationsMain,
        exact: true,
        requireConnection: true,
        templateProps: {
          menuName: 'appMenu',
          isDapp: true,
        },
      })

      addElement('appMenu', {
        name: 'Organizations',
        label: 'Organizations',
        link: '/organizations/dapp',
        index
      })
    }

export default OrganizationsMain
