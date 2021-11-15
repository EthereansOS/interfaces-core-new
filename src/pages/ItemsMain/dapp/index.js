import MenuCapableComponent from '../../../components/Global/MenuCapableComponent';

import { retrieveComponentsByReflection } from '../../../logic/uiUtilities';

import style from './items-main.module.css'

export default {
  pluginIndex: 10,
  addToPlugin: ({index}) =>
  ({addElement}) => {
    var contextualRequire = require.context('./', true, /index.js$/)
    retrieveComponentsByReflection(require.context('./', true, /.js$/), "menuVoice").forEach((it, i) => it.path && addElement('router', {
      ...it,
      index: index + i,
      Component: MenuCapableComponent,
      requireConnection: true,
      templateProps: {
        ...it.templateProps,
        contextualRequire,
        menuName: 'appMenu',
        isDapp: true,
        className : style.Web3PagesRoot
      },
    }))
    addElement('appMenu', {
      name: 'Items',
      label: 'Items',
      icon: '${process.env.PUBLIC_URL}/img/ethereum.png',
      link: '/dapp',
      index
    })
  }
}