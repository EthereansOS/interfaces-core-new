import React, { useEffect } from 'react'
import style from './web3-connect.module.css'
import { useWeb3, webs3States, shortenWord, useEthosContext } from '@ethereansos/interfaces-core'

const Web3Connect = () => {
  const context = useEthosContext()
  const { walletAddress, connectionStatus, disconnect, wallet } = useWeb3();
  function triggerConnect() {
    var location = window.location.href.toString();
    connectionStatus === webs3States.NOT_CONNECTED && (window.location.href = (location.lastIndexOf('/') === location.length - 1 ? location.substring(0, location.length - 1) : location) + '/dapp');
    connectionStatus === webs3States.CONNECTED && disconnect();
  }

  wallet && console.log("wallet", wallet);

  useEffect(() => {
    wallet && !wallet.ethereum && disconnect();
  }, [wallet]);
  return (
      <div className={style.Web3Connect}>
        {/* Ready for Layer 2 selection 
        <a className={style.Web3ConnectChain}>
          <img src={`${process.env.PUBLIC_URL}/img/ethereum.png`}></img>
          <p>Ethereum <span>▼</span></p>
        </a>*/}
        <a href="javascript:;" onClick={triggerConnect} className={style.Web3ConnectWallet}>
          <img src={`${process.env.PUBLIC_URL}/img/ethereum.png`}></img>
          <p>{connectionStatus === webs3States.NOT_CONNECTED ? "Connect" : shortenWord({context, charsAmount : 9 }, wallet.account)}</p>
        </a>
      </div>
  )
}

export default Web3Connect
