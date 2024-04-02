import React, { useState } from 'react'
import T from 'prop-types'
import classNames from 'classnames'
import { web3States } from 'interfaces-core'

import { Button, CircularProgress, Typography } from '../../design-system'
import { Modal } from '../../design-system'

import style from './connect-widget.module.scss'

const ConnectWidget = ({
  logo,
  onClickConnect,
  title,
  rotateLogo,
  className,
  connectionStatus,
  connectors,
  wallet,
}) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeConnector, setActiveConnector] = useState({
    name: '',
    label: '',
  })

  const onClick = () => {
    setModalOpen(true)
    onClickConnect?.()
  }

  const onConnectorClicked = async (name, label) => {
    wallet.connect(name)
    setActiveConnector({ label, name })
  }

  return (
    <div className={classNames(style['root'], className)}>
      {logo ? (
        <img
          src={logo}
          alt="logo"
          className={classNames({ [style.rotateLogo]: !!rotateLogo })}
        />
      ) : null}
      <Typography variant="h1" color="primary">
        {title}
      </Typography>
      <br />
      {connectionStatus === web3States.CONNECTED && <div>Connected</div>}
      {connectionStatus === web3States.CONNECTING && <div>Connecting</div>}
      {connectionStatus === web3States.NOT_CONNECTED && (
        <>
          <Button onClick={onClick} text="Connect" variant="primary" />
          <br />
          <Typography variant="body2" align="center">
            You need a{' '}
            <a href="https://etherscan.io/directory/Wallet">Web3 Enabler</a> to
            use this Dapp - If you have problems connecting, refresh the page.
          </Typography>
        </>
      )}
      <Modal centered visible={!!modalOpen}>
        <div className={style.modalHeader}>
          <Typography variant="h5">
            {activeConnector.label || 'Connect to a wallet'}
          </Typography>
          <Button
            text={activeConnector.name ? 'Back' : 'Close'}
            onClick={() => {
              if (activeConnector.name) {
                setActiveConnector({ name: '', label: '' })
                wallet.reset()
              } else {
                setModalOpen(false)
              }
            }}
          />
        </div>

        {activeConnector.name && (
          <>
            {wallet.status === 'connecting' && (
              <Typography variant="body1">
                Connecting to Browser Wallet <CircularProgress />
              </Typography>
            )}
            {wallet.status === 'error' && (
              <>
                <Typography variant="body1">{wallet.error?.message}</Typography>
                <Button
                  className={style.retryButton}
                  onClick={() => {
                    wallet.reset()
                    wallet.connect(activeConnector.name)
                  }}
                  text="Retry"
                />
              </>
            )}
            {wallet.status === 'connected' && (
              <Typography variant="body1">
                You've been correctly connected
              </Typography>
            )}
          </>
        )}

        {!activeConnector.name &&
          connectors.map((connector) => (
            <Button
              key={connector.id}
              className={style.button}
              text={connector.buttonText}
              onClick={() =>
                onConnectorClicked(connector.id, connector.buttonText)
              }
            />
          ))}
      </Modal>
    </div>
  )
}

ConnectWidget.propTypes = {
  logo: T.string,
  onClickConnect: T.func,
  connectionStatus: T.string.isRequired,
  title: T.string,
  className: T.string,
  connectError: T.string,
  rotateLogo: T.bool,
  wallet: T.shape({
    networkName: T.string,
    connect: T.func.isRequired,
    status: T.oneOf(['disconnected', 'connecting', 'connected', 'error'])
      .isRequired,
    error: T.shape({
      name: T.string,
      message: T.string,
    }),
    reset: T.func.isRequired,
  }).isRequired,
  connectors: T.arrayOf(
    T.shape({
      id: T.string,
      buttonText: T.string,
    })
  ),
}

ConnectWidget.defaultProps = {
  connectors: [],
}

export default ConnectWidget
