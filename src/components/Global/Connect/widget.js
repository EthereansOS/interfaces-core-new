import React, { useState, Fragment, useEffect } from 'react'

import { Button, Typography } from '@ethereansos/interfaces-ui'

import OurCircularProgress from '../OurCircularProgress'

import { web3States } from '@ethereansos/interfaces-core'

export default ({
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
        {!errorMessage && connectionStatus === web3States.CONNECTING && <div>Connecting to {activeConnector.buttonText} <OurCircularProgress/></div>}
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