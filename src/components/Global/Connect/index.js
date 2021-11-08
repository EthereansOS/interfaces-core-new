import { useState } from 'react'
import { Button, CircularProgress, Typography, Modal } from '@ethereansos/interfaces-ui'
import { useWeb3, web3States, usePrevious, useEthosContext } from '@ethereansos/interfaces-core'
import style from './connect.module.css'

const Connect = ({ children }) => {
  const context = useEthosContext()
  const { wallet, connectionStatus } = useWeb3();

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
        wallet={wallet}
        connectionStatus={connectionStatus}
        connectors={context.useWalletSettings}
      />
    </Modal>
  )
}

export default Connect

const ConnectWidget = ({
  title,
  connectionStatus,
  connectors,
  wallet
}) => {
  const [activeConnector, setActiveConnector] = useState({
    name: '',
    label: '',
  })

  const onConnectorClicked = async (name, label) => {
    wallet.connect(name)
    setActiveConnector({ label, name })
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
        {(!activeConnector.name || wallet.status === 'error') &&
          connectors.map(connector => <>
            <Button
              key={connector.id}
              text={connector.buttonText}
              onClick={() =>
                onConnectorClicked(connector.id, connector.buttonText)
              }
            />
            <br/>
            <br/>
            </>
          )}
          <br/>
          <br/>
          {wallet.status === 'error' &&
            <Typography variant="body1">{wallet.error?.message}</Typography>
          }
          {wallet.status === 'connecting' &&
            <Typography variant="body1">
              Connecting to {activeConnector.label} <CircularProgress />
            </Typography>
          }
    </div>
  )
}