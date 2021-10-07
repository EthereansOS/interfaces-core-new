import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './items-main.module.css'
import CollectionView  from './Sections/collection-view'

const ItemsMain = (props) => {
  return (
      <div className={style.Web3PagesRoot}>
        <CollectionView></CollectionView>
      </div>
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
        icon: '${process.env.PUBLIC_URL}/img/ethereum.png',
        link: '/',
        index,
      })
    }

export default ItemsMain
