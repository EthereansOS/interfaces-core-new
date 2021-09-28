import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './items-main.module.css'
import ItemView  from './Sections/item-view'

const ItemsMain = (props) => {
  return (
    <>
      <div className={style.Web3PagesRoot}>
        <ItemView></ItemView>
      </div>
    </>
  )
}

ItemsMain.addToPlugin =
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
        link: '/',
        index,
      })
    }

export default ItemsMain
