import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './regular-vote-box.module.css'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import TokenInputRegular from '../../Global/TokenInputRegular/index.js'
import ActionAWeb3Buttons from '../../Global/ActionAWeb3Buttons/index.js'
import ActionAWeb3ButtonExtraSmall from '../../Global/ActionAWeb3ButtonExtraSmall/index.js'


const RegularVoteBox = (props) => {
  return (
   <>
    <div className={style.RegularVoteBoxQuantity}>
      <TokenInputRegular></TokenInputRegular>
    </div>
    <div>
      <ActionAWeb3Buttons></ActionAWeb3Buttons>
    </div>
    <div className={style.RegularVoteBoxStaked}>
      <p>0.01% - 2000 OS staked</p>
      <ActionAWeb3ButtonExtraSmall></ActionAWeb3ButtonExtraSmall>
    </div>
   </>
  )
}

export default RegularVoteBox
