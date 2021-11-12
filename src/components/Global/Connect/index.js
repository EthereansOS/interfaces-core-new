import { useState } from 'react'
import { Button, CircularProgress, Typography, Modal } from '@ethereansos/interfaces-ui'
import { useWeb3, web3States } from '@ethereansos/interfaces-core'
import { ContextualWeb3ContextWeb3Provider } from '../../../logic/frontend/contextualWeb3'

import style from './connect.module.css'

const Connect = ({ children }) => {
  const { setConnector, errorMessage, connectors, connectionStatus } = useWeb3()

  function close() {
    window.location.href = window.location.href.split('/#')[0] + '/#/'
  }

  return connectionStatus === web3States.CONNECTED ? (
    children
  ) : (
    <Modal centered visible>
      <Button text="X" onClick={close} style={{"float" : "right"}}/>
      <ConnectWidget
        title="Welcome Etherean"
        {...{connectionStatus, connectors, setConnector, errorMessage}}
      />
    </Modal>
  )
}

export default Connect

const ConnectWidget = ({
  title,
  connectionStatus,
  connectors,
  setConnector,
  errorMessage
}) => {
  const [activeConnector, setActiveConnector] = useState(null)

  const onClick = connector => {
    setConnector(connector)
    setActiveConnector(connector)
  }

  return (
    <div>
      <Typography variant="h1" color="primary">
        {title}
      </Typography>
      <br />
      {connectionStatus === web3States.CONNECTED && <div>Connected</div>}
      {connectionStatus === web3States.CONNECTING && <div>Connecting</div>}
      {connectionStatus === web3States.NOT_CONNECTED && <Typography variant="body2" align="center">
          You need a{' '}
          <a target="_blank" href="https://etherscan.io/directory/Wallet">Web3 Enabler</a> to
          use this Dapp - If you have problems connecting, refresh the page.
        </Typography>}
        <br/>
        <div>
          <Typography variant="h5">
            Connect to a wallet
          </Typography>
        </div>
        <br/>
        {(!activeConnector || errorMessage) &&
          connectors.map(connector => <>
            <Button
              key={connector.id}
              text={connector.buttonText}
              onClick={() => onClick(connector)}
            />
            <br/>
            <br/>
            </>
          )}
          <br/>
          <br/>
          {errorMessage &&
            <Typography variant="body1">{errorMessage}</Typography>
          }
          {connectionStatus === web3States.CONNECTING &&
            <Typography variant="body1">
              Connecting to {activeConnector.buttonText} <CircularProgress />
            </Typography>
          }
    </div>
  )
}