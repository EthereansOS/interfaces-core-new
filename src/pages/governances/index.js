import React from 'react'
import { Typography } from 'interfaces-ui'

import style from './organizations-main.module.css'
import { Link } from 'react-router-dom'
import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'

const OrganizationsMain = () => {
  return (
    <>
      <ScrollToTopOnMount />

      <Typography className={style.title} variant="h3" color="black">
        Qua ci scrivo le zozzerie offiCéin di Organizations
      </Typography>
      <Link to="governances">Andiamo Onnicéin che è meglio valà</Link>
    </>
  )
}

/*OrganizationsMain.addToPlugin =
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
    }*/

export default OrganizationsMain
