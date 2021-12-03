import React from 'react'

import LogoRenderer from '../../Global/LogoRenderer'

import style from '../../../all.module.css'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import Description from '../GovernanceContainer/description'

import { useEthosContext, useWeb3, getNetworkElement, shortenWord } from '@ethereansos/interfaces-core'

const DelegationHeadline = ({element}) => {

  const context = useEthosContext()
  const { chainId } = useWeb3()

  return (
    <div className={style.DelegationHeadlineCardUPD}>
      <div className={style.DelegationMainThingsCardD}>
          <LogoRenderer input={element}/>
          <div className={style.DelLinks}>
            <h6>{element.name}</h6>
            <ExtLinkButton></ExtLinkButton>
            <ExtLinkButton></ExtLinkButton>
          </div>
          <div className={style.DelegationHeadlineCardSideD}>
            <p><b>Created:</b> <a>32542555</a> <b>Core:</b>v. <a>1.0</a></p>
          </div>
      </div>
      <Description className={style.ViewDescriptionD} description={element.description}/>
      <div className={style.DelegationMainThingsCardMainInfoD}>
        <p><b>Type</b><br></br>Poll</p>
        <p><b>Grants</b><br></br>10</p>
        <p><b>Tot Funds</b><br></br>250 ETH</p>
        <p><b>Host</b><br></br><a href={`${getNetworkElement({context, chainId}, "etherscanURL")}/address/${element.host}`} target="_blank">{shortenWord({ context, charsAmount : 20}, element.host)}</a></p>
      </div>
    </div>
  )
}

export default DelegationHeadline
