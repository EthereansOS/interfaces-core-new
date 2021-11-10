import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './explore-delegations.module.css'

const ExploreDelegations = (props) => {
  return (
    <div className={style.OrgAllSingle}>
      {/*Single Item Start*/}
     <div className={style.OrgSingle}>
        <figure>
          <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
        </figure>
        <div className={style.OrgTitle}>
          <h6>BojackSwap DAO</h6>
          <div className={style.OrgTitleAside}>
            <p>Functions:</p>
            <p>26</p>
          </div>
          <div className={style.OrgTitleAsideB}>
            <p>Governance:</p>
            <p>10</p>
          </div>
        </div>
        
     </div>
     {/*Single Item End*/}
     <div className={style.OrgSingle}>
        <figure>
          <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
        </figure>
        <div className={style.OrgTitle}>
          <h6>BojackSwap DAO</h6>
          <div className={style.OrgTitleAside}>
            <p>Functions:</p>
            <p>26</p>
          </div>
          <div className={style.OrgTitleAsideB}>
            <p>Governance:</p>
            <p>10</p>
          </div>
        </div>
        
     </div><div className={style.OrgSingle}>
        <figure>
          <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
        </figure>
        <div className={style.OrgTitle}>
          <h6>BojackSwap DAO</h6>
          <div className={style.OrgTitleAside}>
            <p>Functions:</p>
            <p>26</p>
          </div>
          <div className={style.OrgTitleAsideB}>
            <p>Governance:</p>
            <p>10</p>
          </div>
        </div>
        
     </div><div className={style.OrgSingle}>
        <figure>
          <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
        </figure>
        <div className={style.OrgTitle}>
          <h6>BojackSwap DAO</h6>
          <div className={style.OrgTitleAside}>
            <p>ETH:</p>
            <p>26</p>
          </div>
          <div className={style.OrgTitleAsideB}>
            <p>Participations:</p>
            <p>10</p>
          </div>
        </div>
        
     </div>
     </div>
  )
}

export default ExploreDelegations
