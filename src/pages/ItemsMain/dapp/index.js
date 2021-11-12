import React from 'react'

import { useLocation } from 'react-router'

import DappMenu from './../../../components/Global/DappMenu/index.js'

import CollectionsExplore from './Sections/collections-explore'
import ItemsExplore  from './Sections/items-explore'
import CollectionView  from './Sections/collection-view'
import ItemView  from './Sections/item-view'
import Create from './Sections/create/'
import Wrap from './Sections/wrap/'

import style from './items-main.module.css'

var dappMenuVoices = [
  {
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
    path: '/dapp/items/:id',
    Component: ItemView,
    exact: false,
    requireConnection: true,
    templateProps: {
      menuName: 'appMenu',
      isDapp: true,
    }
  }, {
    path: '/dapp/items/wrapped',
    label: 'Wrapped',
    Component: ItemsExplore,
    exact: true,
    requireConnection: true,
    templateProps: {
      menuName: 'appMenu',
      isDapp: true,
      wrappedOnly : true
    }
  }, {
    path: '/dapp/items/collections',
    label: 'Collections',
    Component: CollectionsExplore,
    exact: true,
    requireConnection: true,
    templateProps: {
      menuName: 'appMenu',
      isDapp: true,
    }
  }, {
    path: '/dapp/items/collections/:id',
    Component: CollectionView,
    exact: false,
    requireConnection: true,
    templateProps: {
      menuName: 'appMenu',
      isDapp: true,
    }
  }, {
    path: '/dapp/items/batch',
    label: 'Batch',
    Component: ItemsExplore,
    exact: true,
    requireConnection: true,
    templateProps: {
      menuName: 'appMenu',
      isDapp: true,
    }
  }, {
    path: '/dapp/items/create',
    label: 'Create',
    Component: Create,
    exact: true,
    requireConnection: true,
    templateProps: {
      menuName: 'appMenu',
      isDapp: true,
    }
  }, {
    path: '/dapp/items/wrap',
    label: 'Wrap',
    Component: Wrap,
    exact: true,
    requireConnection: true,
    templateProps: {
      menuName: 'appMenu',
      isDapp: true,
    }
  }
];

const ItemsMain = (props) => {

  var location = useLocation()
  var selectedVoice = dappMenuVoices.filter(it => it.path.toLowerCase() === location.pathname.toLowerCase())[0]
    || dappMenuVoices.filter(it => it.path.toLowerCase() !== location.pathname.toLowerCase() && location.pathname.toLowerCase().indexOf(it.path.split(':')[0].toLowerCase()) !== -1 && it.path.split('/').length === location.pathname.split('/').length)[0]

  var Component = (selectedVoice || dappMenuVoices[0]).Component

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
