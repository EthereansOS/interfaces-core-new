import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './delegation-headline.module.css'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'

const DelegationHeadline = (props) => {
  return (
    <div className={style.DelegationHeadlineCardUP}>
      <div className={style.DelegationHeadlineCard}>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
          </figure>
          <div className={style.OrgTitle}>
            <h6>BojackSwap DAO</h6>
            <ExtLinkButton></ExtLinkButton>
            <ExtLinkButton></ExtLinkButton>
            <ExtLinkButton></ExtLinkButton>
            <ExtLinkButton></ExtLinkButton>
          </div>
          <div className={style.DelegationHeadlineCardSide}>
            <p><b>Created:</b> <a>32542555</a> <b>Core:</b>v. <a>1.0</a></p>
          </div>
        </div>
        <div className={style.ViewDescription}>
        <p>Welcome to the Buidlerberg Event 2020! Tucked away deep inside the Ethereum network, a community of researchers study and experiment with DFO technology. They are developing the first genuinely on-chain organizations of the future, together with taking on the task of buidling a genuinely decentralized dApp ecosystem. All researchers are invited to share their projects at the first-ever Buidlerberg meeting. more info:</p>
      </div>
      <div className={style.DelegationMainThingsCardMainInfo}>
        <p><b>Type</b><br></br>Poll</p>
        <p><b>Grants</b><br></br>10</p>
        <p><b>Tot Funds</b><br></br>250 ETH</p>
        <p><b>Host</b><br></br><a>0x04fh93r2gf</a></p>
      </div>
    </div>
  )
}

export default DelegationHeadline
