import React from 'react'

import LogoRenderer from '../../Global/LogoRenderer'

import style from './voting-powers-list.module.css'

const VotingPowersList = ({votingTokens}) => {
  return votingTokens.map(it =>
    <a key={it.address} className={style.VotingPowersObject}>
      <LogoRenderer noFigure input={it}/>
      <div className={style.VotingPowersAmount}>
        <span>+{it.weight}</span>
      </div>
    </a>
  )
}

export default VotingPowersList