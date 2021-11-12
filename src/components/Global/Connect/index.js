import { useState, Fragment } from 'react'
import { Button, CircularProgress, Typography, Modal } from '@ethereansos/interfaces-ui'
import { useWeb3, web3States } from '@ethereansos/interfaces-core'

const Connect = ({ children }) => {
  const { web3, setConnector, errorMessage, connectors, connectionStatus } = useWeb3()

  function close() {
    window.location.href = window.location.href.split('/#')[0] + '/#/'
  }

  return connectionStatus === web3States.CONNECTED
     ? web3
      ? children
      : <CircularProgress/>
   : <Modal centered visible>
      <Button text="X" onClick={close} style={{"float" : "right"}}/>
      <ConnectWidget
        title="Welcome Etherean"
        {...{connectionStatus, connectors, setConnector, errorMessage}}
      />
    </Modal>
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
      {!errorMessage && connectionStatus === web3States.CONNECTING && <div>Connecting to {activeConnector.buttonText} <CircularProgress/></div>}
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
          connectors.map(connector => (
            <Fragment key={connector.id}>
              <Button
                text={connector.buttonText}
                onClick={() => onClick(connector)}
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