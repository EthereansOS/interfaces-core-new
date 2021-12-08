import React from 'react'
import DappMenu from '../../../components/Global/DappMenu'

import { OpenSeaContextProvider } from '../../../logic/uiUtilities'
import Trade from '../../../components/Global/Trade'

const TradeComponent = () => {
  return (<OpenSeaContextProvider>
    <Trade/>
  </OpenSeaContextProvider>)
}

const CovenantsMain = () => {
  return (
    <>
      <DappMenu voices={[{label : "Bazar", path : "/covenants/dapp"}]} selected={0}/>
      <br/>
      <TradeComponent/>
    </>
  )
}

CovenantsMain.pluginIndex = 30;
CovenantsMain.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/covenants/dapp',
        Component: CovenantsMain,
        exact: true,
        requireConnection: true,
        templateProps: {
          menuName: 'appMenu',
          isDapp: true,
          link: '/covenants/dapp'
        },
      })

      addElement('appMenu', {
        name: 'covenants',
        label: 'Covenants',
        link: '/covenants/dapp',
        index,
        image : `${process.env.PUBLIC_URL}/img/is3.png`,
      })
    }

export default CovenantsMain
