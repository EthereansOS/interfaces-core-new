import React from 'react'

import LogoRenderer from '../../Global/LogoRenderer'

import style from '../../../all.module.css'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import Description from '../GovernanceContainer/description'

import { useEthosContext, useWeb3, getNetworkElement, shortenWord } from 'interfaces-core'

const DelegationHeadline = ({element}) => {

  const context = useEthosContext()
  const { chainId } = useWeb3()

  return (
      <div className={style.OrgHeadline}>
      <LogoRenderer input={element}/>
      <div className={style.OrgTitle}>
        <h6><span className={style.GuildTagD}>Delegation</span> {element.name}</h6>
        <Description description={element.description} modal/>
      </div>
      <div className={style.OrgLinks}>
       {element.external_url && <ExtLinkButton text="Website" href={element.external_url}/>}
       {element.community_url && <ExtLinkButton text="Community" href={element.community_url}/>}
       {element.news_url && <ExtLinkButton text="News" href={element.news_url}/>}
       {element.blog_url && <ExtLinkButton text="Blog" href={element.blog_url}/>}
       <ExtLinkButton text="Address" href={`${getNetworkElement({context, chainId}, 'etherscanURL')}/address/${element.address}`}/>
       <ExtLinkButton text="Host" href={`${getNetworkElement({context, chainId}, 'etherscanURL')}/address/${element.host || element.deployer}`}/>
      </div>
          <div className={style.OrgHeadlineSide}>
            <p><b>Created:</b> <a target="_blank" href={`${getNetworkElement({ chainId, context}, "etherscanURL")}/block/${parseInt(element.creationBlock)}`}>#{parseInt(element.creationBlock)}</a> <b>Core:</b>v. <a>2.0</a></p>
          </div>
      </div>
  )
}

export default DelegationHeadline
