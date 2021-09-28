import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './trade-main.module.css'

const TradeMain = () => {
  return (
    <>
      <Typography className={style.title} variant="h3" color="black">
        Sample page 3
      </Typography>
      <Typography className={style.text} variant="body2" color="black">
        This is a sample page
      </Typography>
    </>
  )
}

TradeMain.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/trade',
        Component: TradeMain,
        exact: true,
        requireConnection: false,
        templateProps: {
          menuName: 'appMenu',
          isDapp: false,
        },
      })

      addElement('appMenu', {
        name: 'Trade',
        label: 'Trade',
        link: '/trade',
        index,
      })
    }

export default TradeMain
