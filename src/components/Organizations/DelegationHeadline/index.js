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
        <div className={style.DelegationHeadlineCardConnected}>
          <p>Active in:</p>
          <div className={style.DelegationHeadlineCardConnectedBox}>
            <a>
              <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
            </a>
            <a>
              <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
            </a>
            <a>
              <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
            </a>
            <a>
              <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
            </a>
            <a>
              <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
            </a>
            <a>
              <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
            </a>
          </div>
        </div>
    </div>
  )
}

export default DelegationHeadline
