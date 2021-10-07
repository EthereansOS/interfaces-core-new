import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'
import style from './web3-connect.module.css'

const Web3Connect = (props) => {
  return (
      <div className={style.Web3Connect}>
        {/* Ready for Layer 2 selection 
        <a className={style.Web3ConnectChain}>
          <img src={`${process.env.PUBLIC_URL}/img/ethereum.png`}></img>
          <p>Ethereum <span>▼</span></p>
        </a>*/}
        <a className={style.Web3ConnectWallet}>
          <img src={`${process.env.PUBLIC_URL}/img/ethereum.png`}></img>
          <p>Connect</p>
        </a>
      </div>
  )
}

export default Web3Connect
