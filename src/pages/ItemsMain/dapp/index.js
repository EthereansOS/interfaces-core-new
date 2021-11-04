import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './items-main.module.css'
import CollectionView  from './Sections/collection-view'
import ItemView  from './Sections/item-view'
import ItemsExplore  from './Sections/items-explore'
import DappMenu from './../../../components/Global/DappMenu/index.js'

const ItemsMain = (props) => {
  return (
      <div className={style.Web3PagesRoot}>
        
        <DappMenu></DappMenu>
        <ItemView></ItemView>
      </div>
  )
}

ItemsMain.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/dapp',
        Component: ItemsMain,
        exact: true,
        requireConnection: true,
        templateProps: {
          menuName: 'appMenu',
          isDapp: true,
        },
      })
    }

export default ItemsMain
