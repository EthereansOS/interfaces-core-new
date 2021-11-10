import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './org-headline.module.css'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'

const OrgHeadline = (props) => {
  return (
    <div className={style.OrgHeadline}>
      <figure>
        <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
      </figure>
      <div className={style.OrgTitle}>
        <h6>BojackSwap DAO</h6>
        <p>Welcome to the Buidlerberg Event 2020! Tucked away deep inside the Ethereum network, a community of researchers study and experiment with DFO technology. They are developing the first genuinely on-chain organizations of the future, together with taking on the task of buidling a genuinely decentralized dApp ecosystem. </p>
      </div>
      <div className={style.OrgLinks}>
       <ExtLinkButton></ExtLinkButton>
       <ExtLinkButton></ExtLinkButton>
       <ExtLinkButton></ExtLinkButton>
       <ExtLinkButton></ExtLinkButton>
      </div>

      <div className={style.OrgHeadlineSide}>
        <p><b>Created:</b> <a>32542555</a> <b>Core:</b>v. <a>1.0</a></p>
      </div>
    </div>
  )
}

export default OrgHeadline
