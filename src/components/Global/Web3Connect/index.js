import React from 'react'
import style from './web3-connect.module.css'
import { useWeb3, webs3States } from '@ethereansos/interfaces-core'

const Web3Connect = () => {
  var web3 = useWeb3();
  function triggerConnect() {
    var location = window.location.toString();
    web3.connectionStatus === webs3States.NOT_CONNECTED && (window.location = (location.lastIndexOf('/') === location.length - 1 ? location.substring(0, location.length - 1) : location) + '/dapp');
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
          <p>{web3.connectionStatus === webs3States.NOT_CONNECTED ? "Connect" : web3.walletAddress}</p>
        </a>
      </div>
  )
}

export default Web3Connect
