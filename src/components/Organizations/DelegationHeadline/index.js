import React, {useState} from 'react'

import LogoRenderer from '../../Global/LogoRenderer'

import style from '../../../all.module.css'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import Description from '../GovernanceContainer/description'
import { getOrganizationMetadata } from 'logic/organization'

import { useEthosContext, useWeb3, getNetworkElement, shortenWord } from 'interfaces-core'
import { useEffect } from 'react'
import OurCircularProgress from 'components/Global/OurCircularProgress'

const DelegationHeadline = ({element, onMetadata}) => {

  const context = useEthosContext()
  const web3Data = useWeb3()
  const { chainId } = web3Data

  const [metadata, setMetadata] = useState()

  useEffect(() => getOrganizationMetadata({ ...web3Data, context }, element, true).then(setMetadata), [])

  useEffect(() => metadata && onMetadata && onMetadata(metadata), [metadata])

  if(!metadata) {
    return <OurCircularProgress/>
  }

  return (
      <div className={style.OrgHeadline}>
      <LogoRenderer input={metadata}/>
      <div className={style.OrgTitle}>
        <h6><span className={style.GuildTagD}>Delegation</span> {metadata.name}</h6>
        <Description description={metadata.description} modal/>
      </div>
      <div className={style.OrgLinks}>
       {metadata.external_url && <ExtLinkButton text="Website" href={metadata.external_url}/>}
       {metadata.community_url && <ExtLinkButton text="Community" href={metadata.community_url}/>}
       {metadata.news_url && <ExtLinkButton text="News" href={metadata.news_url}/>}
       {metadata.blog_url && <ExtLinkButton text="Blog" href={metadata.blog_url}/>}
       <ExtLinkButton text="Address" href={`${getNetworkElement({context, chainId}, 'etherscanURL')}/address/${metadata.address}`}/>
       <ExtLinkButton text="Host" href={`${getNetworkElement({context, chainId}, 'etherscanURL')}/address/${metadata.host || metadata.deployer}`}/>
      </div>
          <div className={style.OrgHeadlineSide}>
            <p><b>Created:</b> <a target="_blank" href={`${getNetworkElement({ chainId, context}, "etherscanURL")}/block/${parseInt(metadata.creationBlock)}`}>#{parseInt(metadata.creationBlock)}</a> <b>Core:</b>v. <a>2.0</a></p>
          </div>
      </div>
  )
}

export default DelegationHeadline
