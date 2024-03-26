import React from 'react'
import { Typography } from 'interfaces-ui'
import { Link } from 'react-router-dom'

import style from './factories-main.module.css'
import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'

const FactoriesMain = () => {
  return (
    <>
      <ScrollToTopOnMount />

      <Typography
        className={style.title}
        variant="h3"
        color="black"></Typography>
      <Link to="factories"></Link>
    </>
  )
}

/*FactoriesMain.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/factories',
        Component: FactoriesMain,
        exact: true,
        requireConnection: false,
        templateProps: {
          menuName: 'appMenu',
          isDapp: false,
        },
      })

      addElement('appMenu', {
        name: 'Factories',
        label: 'Factories',
        link: '/factories',
        index,
      })
    }*/

export default FactoriesMain
