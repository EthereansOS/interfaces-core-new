import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './voting-powers-list.module.css'



const VotingPowersList = (props) => {
  return (
        <a className={style.VotingPowersObject}>
          <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
          <div className={style.VotingPowersAmount}>
          <span>+1</span>
          </div>
        </a>
  )
}

export default VotingPowersList
