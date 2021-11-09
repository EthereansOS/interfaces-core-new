import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'
import { useLocation } from 'react-router'
import style from './items-main.module.css'
import CollectionView  from './Sections/collection-view'
import CollectionsExplore from './Sections/collections-explore'
import ItemView  from './Sections/item-view'
import ItemsExplore  from './Sections/items-explore'
import DappMenu from './../../../components/Global/DappMenu/index.js'
import Create from './Sections/create'

var dappMenuVoices = [{
  path: '/dapp',
  label: 'Items',
  Component: ItemsExplore,
  exact: true,
  requireConnection: true,
  templateProps: {
    menuName: 'appMenu',
    isDapp: true,
  }
}, {
  path: '/dapp/wrapped',
  label: 'Wrapped',
  Component: ItemsExplore,
  exact: true,
  requireConnection: true,
  templateProps: {
    menuName: 'appMenu',
    isDapp: true,
  }
}, {
  path: '/dapp/collections',
  label: 'Collections',
  Component: CollectionsExplore,
  exact: true,
  requireConnection: true,
  templateProps: {
    menuName: 'appMenu',
    isDapp: true,
  }
}, {
  path: '/dapp/batch',
  label: 'Batch',
  Component: ItemsExplore,
  exact: true,
  requireConnection: true,
  templateProps: {
    menuName: 'appMenu',
    isDapp: true,
  }
}, {
  path: '/dapp/create',
  label: 'Create',
  Component: Create,
  exact: true,
  requireConnection: true,
  templateProps: {
    menuName: 'appMenu',
    isDapp: true,
  }
}, {
  path: '/dapp/wrap',
  label: 'Wrap',
  Component: Create,
  exact: true,
  requireConnection: true,
  templateProps: {
    menuName: 'appMenu',
    isDapp: true,
  }
}, {
  path: '/dapp/item/:id',
  Component: ItemView,
  exact: false,
  requireConnection: true,
  templateProps: {
    menuName: 'appMenu',
    isDapp: true,
  }
}, {
  path: '/dapp/collection/:id',
  Component: CollectionView,
  exact: false,
  requireConnection: true,
  templateProps: {
    menuName: 'appMenu',
    isDapp: true,
  }
}];

const ItemsMain = (props) => {

  var location = useLocation()
  var selectedVoice = location.pathname === '/dapp' ? dappMenuVoices[0] : dappMenuVoices.slice(1).filter(it => location.pathname.indexOf(it.path.split(':')[0]) !== -1)[0]
  var Component = selectedVoice.Component

  return (
      <div className={style.Web3PagesRoot}>
        <DappMenu voices={dappMenuVoices}/>
        <Component {...props}/>
      </div>
  )
}

ItemsMain.pluginIndex = 10;
ItemsMain.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      dappMenuVoices.map(it => addElement('router', {...it, index, Component: ItemsMain}))

      addElement('appMenu', {
        name: 'Items',
        label: 'Items',
        icon: '${process.env.PUBLIC_URL}/img/ethereum.png',
        link: '/dapp',
        index
      })
    }

export default ItemsMain
