import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './proposals-list.module.css'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'



const ProposalsList = (props) => {
  return (
        <div className={style.Proposal}>
          <div className={style.ProposalTitle}>
          <h6>Proposal Title</h6>
            <ExtLinkButton/>
            <ExtLinkButton/>
            <div className={style.ProposalResult}>
              <p className={style.PendingTagGreen}>Succeding</p>
             {/*
              <p className={style.PendingTagBlue}>Pending</p>
              <p className={style.PendingTagGreen}>Succed</p>
              <p className={style.PendingTagGreen}>Executed</p>
              <p className={style.PendingTagRed}>Defeated</p> 
              */} 
            </div>
          </div>
          <div className={style.ProposalVotesCount}>
            <span>Votes: 200,000</span>
            <RegularButtonDuo/>
          </div>
          <div className={style.ProposalOpen}>
            
          </div>
        </div>
  )
}

export default ProposalsList
