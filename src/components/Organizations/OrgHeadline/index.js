import React, { useState, useEffect } from 'react'

import LogoRenderer from '../../Global/LogoRenderer'

import style from '../../../all.module.css'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import Description from '../GovernanceContainer/description'
import { getOrganizationMetadata } from 'logic/organization'

import { useEthosContext, useWeb3, getNetworkElement } from 'interfaces-core'
import OurCircularProgress from 'components/Global/OurCircularProgress'

const OrgHeadline = ({element, onMetadata}) => {

  const context = useEthosContext()
  const web3Data = useWeb3()
  const { chainId } = web3Data

  const [metadata, setMetadata] = useState()

  useEffect(() => getOrganizationMetadata({ ...web3Data, context }, element, true).then(setMetadata), [element.address])

  useEffect(() => metadata && onMetadata && onMetadata(metadata), [metadata])

  if(!metadata) {
    return <OurCircularProgress/>
  }

  return (

   <div className={style.OrgHeadline}>
      <LogoRenderer input={metadata}/>
      <div className={style.OrgTitle}>
        <h6><span className={style.GuildTagO}>Organization</span> {metadata.name}</h6>
        <Description description={metadata.description} modal/>
      </div>
      <div className={style.OrgLinks}>
       <ExtLinkButton text="Website" href={metadata.external_url}/>
       <ExtLinkButton text="Discussion" href={metadata.discussion_url || metadata.discord_url}/>
       <ExtLinkButton text="News" href={metadata.twitter_url}/>
       <ExtLinkButton text="Address" href={`${getNetworkElement({context, chainId}, 'etherscanURL')}/address/${metadata.address}`}/>
      </div>

      <div className={style.OrgHeadlineSide}>
        <p><b>Created:</b> <a target="_blank" href={`${getNetworkElement({context, chainId}, 'etherscanURL')}/block/${parseInt(metadata.creationBlock)}`}>{parseInt(metadata.creationBlock)}</a> <b>Core:</b>v. {parseInt(metadata.version || 0) + 1}.0</p>
      </div>
    </div>
  )
}

export default OrgHeadline
