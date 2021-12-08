import React from 'react'

import LogoRenderer from '../../Global/LogoRenderer'

import style from '../../../all.module.css'
import { Link } from 'react-router-dom'
import { getNetworkElement, useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'

const VotingPowersList = ({votingTokens}) => {

  const context = useEthosContext()

  const { chainId } = useWeb3()

  return votingTokens.map(it => {
    const children = (<>
      <LogoRenderer noFigure input={it}/>
      <div className={style.VotingPowersAmount}>
        <span>+{it.weight}</span>
      </div>
    </>)
    if(it.mainInterface) {
      return (<Link key={it.address} className={style.VotingPowersObject} to={`/items/dapp/${it.interoperableInterface?.options.address || it.address}`}>
        {children}
      </Link>)
    }
    return (<a key={it.address} className={style.VotingPowersObject} target="_blank" href={`${getNetworkElement({ context, chainId }, "etherscanURL")}token/${it.address}`}>
      {children}
    </a>)
  })
}

export default VotingPowersList