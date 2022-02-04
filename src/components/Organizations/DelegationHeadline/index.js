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
      <div className={style.OrgHeadline}>
          <LogoRenderer input={element}/>
          <div className={style.OrgTitle}>
            <h6>{element.name}</h6>
            <Description description={element.description}/>
          </div>
          <div className={style.OrgLinks}>
          <ExtLinkButton text="Website" href={element.external_url}/>
          <ExtLinkButton text="Discussion" href={element.discord_url}/>
          <ExtLinkButton text="News" href={element.twitter_url}/>
          <ExtLinkButton text="Address" href={`${getNetworkElement({context, chainId}, 'etherscanURL')}/address/${element.address}`}/>
          <ExtLinkButton text="Host" href={`${getNetworkElement({context, chainId}, "etherscanURL")}/address/${element.host}`}/>
          <ExtLinkButton text="Host"/>
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
