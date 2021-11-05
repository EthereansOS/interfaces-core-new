import { useEffect } from 'react'
import { useWeb3, webs3States, usePrevious, useEthosContext } from '@ethereansos/interfaces-core'
import { ConnectWidget } from '@ethereansos/interfaces-ui'
import style from './connect.module.css'
import ModalStandard from '../ModalStandard'

const Connect = ({ children }) => {
  const context = useEthosContext()
  const { wallet, connectionStatus } = useWeb3();
  const previousConnectionStatus = usePrevious(connectionStatus)

  useEffect(() => {
    if (
      connectionStatus === webs3States.CONNECTED &&
      previousConnectionStatus === webs3States.CONNECTING
    ) {
      console.log('Connected')
    }
  }, [connectionStatus, previousConnectionStatus])

  return connectionStatus === webs3States.CONNECTED ? (
    children
  ) : (
    <ModalStandard>
      <ConnectWidget
        title="Welcome Etherean"
        wallet={wallet}
        connectionStatus={connectionStatus}
        connectors={context.connectors}
      />
    </ModalStandard>
  )
}

export default Connect
