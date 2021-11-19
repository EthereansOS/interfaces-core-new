import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './vote-selections.module.css'



const VoteSelections = (props) => {
  return (
    
    <label className={style.CardSelectionSingle}>
        <p>0.0001%</p>
        <span>Staked: 20000 OS</span>
        <input type="radio"></input>
    </label>
  )
}

export default VoteSelections
