import React from 'react'

import LogoRenderer from '../../Global/LogoRenderer'

import style from '../../../all.module.css'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import Description from '../GovernanceContainer/description'

import { useEthosContext, useWeb3, getNetworkElement } from 'interfaces-core'

const OrgHeadline = ({element}) => {

  const context = useEthosContext()

  const { chainId } = useWeb3()

  return (

   <div className={style.OrgHeadline}>
      <LogoRenderer input={element}/>
      <div className={style.OrgTitle}>
        <h6><span className={style.GuildTagO}>Organization</span> {element.name}</h6>
        <Description description={element.description} modal/>
      </div>
      <div className={style.OrgLinks}>
       <ExtLinkButton text="Website" href={element.external_url}/>
       <ExtLinkButton text="Discussion" href={element.discussion_url || element.discord_url}/>
       <ExtLinkButton text="News" href={element.twitter_url}/>
       <ExtLinkButton text="Address" href={`${getNetworkElement({context, chainId}, 'etherscanURL')}/address/${element.address}`}/>
      </div>

      <div className={style.OrgHeadlineSide}>
        <p><b>Created:</b> <a target="_blank" href={`${getNetworkElement({context, chainId}, 'etherscanURL')}/block/${parseInt(element.creationBlock)}`}>{parseInt(element.creationBlock)}</a> <b>Core:</b>v. {parseInt(element.version || 0) + 1}.0</p>
      </div>
    </div>
  )
}

export default OrgHeadline
