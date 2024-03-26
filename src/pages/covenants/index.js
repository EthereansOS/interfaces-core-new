import React from 'react'
import { Typography } from 'interfaces-ui'
import { Link } from 'react-router-dom'

import style from './covenants-main.module.css'
import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'

const CovenantsMain = () => {
  return (
    <div className={style.Web3PagesRoot}>
      <ScrollToTopOnMount />

      <Typography className={style.title} variant="h3" color="black">
        Qua ci scrivo le zozzerie offiCéin di Covenants
      </Typography>
      <Link to="covenants">Andiamo Onnicéin che è meglio valà</Link>
    </div>
  )
}

/*CovenantsMain.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/covenants',
        Component: CovenantsMain,
        exact: true,
        requireConnection: false,
        templateProps: {
          menuName: 'appMenu',
          isDapp: false,
        },
      })

      addElement('appMenu', {
        name: 'covenants',
        label: 'Covenants',
        link: '/covenants',
        index,
      })
    }*/

export default CovenantsMain
