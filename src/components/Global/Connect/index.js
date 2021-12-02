import { useState, Fragment, useEffect } from 'react'
import { Button, CircularProgress, Typography } from '@ethereansos/interfaces-ui'
import { useWeb3, web3States } from '@ethereansos/interfaces-core'

import style from '../../../all.module.css'

import RegularModal from '../../Global/RegularModal'

const Connect = ({ children }) => {
  const { web3, setConnector, errorMessage, connectors, connectionStatus } = useWeb3()

  function close() {
    window.location.href = window.location.href.split('/#')[0] + '/#/'
  }

  return connectionStatus === web3States.CONNECTED
     ? web3
      ? children
      : <CircularProgress/>
   : <RegularModal type="medium">
      <ConnectWidget
        title="Welcome Etherean"
        {...{connectionStatus, connectors, setConnector, errorMessage}}
      />
    </RegularModal>
}

export default Connect

const ConnectWidget = ({
  title,
  connectionStatus,
  connectors,
  setConnector,
  errorMessage
}) => {

  var previousConnector = null;

  try {
    var connectorId = window.localStorage.connector
    previousConnector = connectors.filter(it => it.id === connectorId)[0]
  } catch(e) {
  }

  const [activeConnector, setActiveConnector] = useState(previousConnector)

  useEffect(() => {
    setConnector(activeConnector)
    try {
      window.localStorage.setItem("connector", null)
      window.localStorage.setItem("connector", activeConnector.id)
    } catch(e) {}
  }, [activeConnector])

  return (
    <div>
      <Typography variant="h1" color="primary">
        {title}
      </Typography>
      <br />
      {connectionStatus === web3States.CONNECTED && <div>Connected</div>}
      {!errorMessage && connectionStatus === web3States.CONNECTING && <div>Connecting to {activeConnector.buttonText} <CircularProgress/></div>}
      {connectionStatus === web3States.NOT_CONNECTED &&
        <p> Connect to Ethereum to use this Dapp</p>}
        <br/>
        {(!activeConnector || errorMessage) &&
          connectors.map(connector => (
            <Fragment key={connector.id}>
              <Button
                text={connector.buttonText}
                onClick={() => setActiveConnector(connector)}
              />
              <br/>
              <br/>
            </Fragment>
          ))}
          <br/>
          <br/>
          {errorMessage &&
            <Typography variant="body1">{errorMessage}</Typography>
          }
    </div>
  )
}