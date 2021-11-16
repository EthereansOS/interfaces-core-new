import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './delegation-wallets-card.module.css'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import DelegationWalletOpenedCard from './../DelegationWalletOpenedCard'

const DelegationWalletsCard = (props) => {
  return (
    <div className={style.DelegationWalletsCard}>
      <div className={style.DelegationWalletsCardORG}>
        <figure>
          <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
        </figure>
        <span>EthOS Organization</span>
        <p><b>Grant size:</b><br></br> 40 ETH</p>
        <p><b>Supporters stake:</b><br></br> 100,000 OS</p>
        <div className={style.DelegationWalletsCardBTN}>
          <RegularButtonDuo></RegularButtonDuo>
        </div>
      </div>
      <DelegationWalletOpenedCard></DelegationWalletOpenedCard>
    </div>
  )
}

export default DelegationWalletsCard
