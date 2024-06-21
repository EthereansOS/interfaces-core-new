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
    <>
      <div className={style.OrgHeadline}>
        <div className={style.OrgHeadlineDelegation} style={{}}>
          <LogoRenderer input={metadata}/>
        </div>
      <div className={style.OrgTitle}>
        <div class={style.ItemsExploreMainTitleArea} style={{margin: "0px 0px 10px", paddingBottom: "5px"}}><h2>Delegation</h2></div>
        <h1> {metadata.name}</h1>
        <div className={style.OrgLinks}>
        {metadata.external_url && <ExtLinkButton text="Website" href={metadata.external_url}/>}
        {metadata.community_url && <ExtLinkButton text="Community" href={metadata.community_url}/>}
        {metadata.news_url && <ExtLinkButton text="News" href={metadata.news_url}/>}
        {metadata.blog_url && <ExtLinkButton text="Blog" href={metadata.blog_url}/>}
        <ExtLinkButton text="Address" href={`${getNetworkElement({context, chainId}, 'etherscanURL')}/address/${metadata.address}`}/>
        <ExtLinkButton text="Host" href={`${getNetworkElement({context, chainId}, 'etherscanURL')}/address/${metadata.host || metadata.deployer}`}/>
        </div>
        <Description description={metadata.description} modal/>
      </div>
      
          <div className={style.CreatedDelegationLabel}>
            <p><b>Created:</b> <a target="_blank" href={`${getNetworkElement({ chainId, context}, "etherscanURL")}/block/${parseInt(metadata.creationBlock)}`}>#{parseInt(metadata.creationBlock)}</a> <b>Core:</b>v. <a>2.0</a></p>
          </div>
      </div>
      <div className={style.ItemsExploreMainTitleArea}>
      <h2>Delegation Details</h2>
      </div>
      </>
  )
}

export default DelegationHeadline
