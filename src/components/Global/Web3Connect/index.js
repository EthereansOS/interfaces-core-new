import React, { useEffect } from 'react'
import style from './web3-connect.module.css'
import { useWeb3, web3States, truncatedWord, useEthosContext } from '@ethereansos/interfaces-core'

const Web3Connect = () => {
  const context = useEthosContext()
  const { account, connectionStatus, setConnector } = useWeb3();
  function triggerConnect() {
    var location = window.location.href.toString();
    connectionStatus === web3States.NOT_CONNECTED && (window.location.href = (location.lastIndexOf('/') === location.length - 1 ? location.substring(0, location.length - 1) : location) + '/dapp');
    connectionStatus === web3States.CONNECTED && void((window.location.href = window.location.href.split('/#')[0] + '/#/'), setTimeout(() => setConnector(null)));
  }

  return (
      <div className={style.Web3Connect}>
        {/* Ready for Layer 2 selection
        <a className={style.Web3ConnectChain}>
          <img src={`${process.env.PUBLIC_URL}/img/ethereum.png`}></img>
          <p>Ethereum <span>▼</span></p>
        </a>*/}
        <a href="javascript:;" onClick={triggerConnect} className={style.Web3ConnectWallet}>
          <img src={`${process.env.PUBLIC_URL}/img/ethereum.png`}></img>
          <p>{connectionStatus === web3States.NOT_CONNECTED ? "Connect" : truncatedWord({context, charsAmount : 5 }, account)}</p>
        </a>
      </div>
  )
}

export default Web3Connect
