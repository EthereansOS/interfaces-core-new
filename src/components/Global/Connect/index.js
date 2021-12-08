import React from 'react'

import OurCircularProgress from '../OurCircularProgress'
import RegularModal from '../../Global/RegularModal'
import ConnectWidget from './widget'

import { useWeb3, web3States } from '@ethereansos/interfaces-core'

const Connect = ({ children }) => {
  const { web3, setConnector, errorMessage, connectors, connectionStatus } = useWeb3()

  return connectionStatus === web3States.CONNECTED
     ? web3
      ? children
      : <OurCircularProgress/>
   : <RegularModal>
      <ConnectWidget
        title="Welcome Etherean"
        {...{connectionStatus, connectors, setConnector, errorMessage}}
      />
    </RegularModal>
}

export default Connect
