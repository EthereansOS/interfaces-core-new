import React, { useState, useEffect } from 'react'

import LogoRenderer from '../../Global/LogoRenderer'
import DappSubMenu from '../../../components/Global/DappSubMenu/index.js'
import style from '../../../all.module.css'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import Description from '../GovernanceContainer/description'
import { getOrganizationMetadata } from 'logic/organization'

import { useEthosContext, useWeb3, getNetworkElement } from 'interfaces-core'
import OurCircularProgress from 'components/Global/OurCircularProgress'

const OrgHeadline = ({element, onMetadata, onSetCurrentView, menuVoices, currentView}) => {

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
    <>
    <div className={style.DetailHeaderArea}>
      <div className={style.DetailHeaderAreaImage}>
      <LogoRenderer input={metadata}/>
      </div>
      <div className={style.DetailHeaderAreaDescription}>
        <div className={style.ItemsExploreMainTitleArea} style={{margin: '0px', paddingBottom: '5px', marginBottom: '10px'}}>
          <h2>Organization</h2>
         
        </div>
        <h1 style={{marginBottom:'10px'}}>{metadata.name}</h1>
        <div style={{marginBottom:'30px'}}>
          <ExtLinkButton text="Website" href={metadata.external_url}/>
          <ExtLinkButton text="Discussion" href={metadata.discussion_url || metadata.discord_url}/>
          <ExtLinkButton text="News" href={metadata.twitter_url}/>
          <ExtLinkButton text="Address" href={`${getNetworkElement({context, chainId}, 'etherscanURL')}/address/${metadata.address}`}/>
        </div>
        <p className={style.DetailsLabelDescription}><Description description={metadata.description} modal/></p>
        <p className={style.DetailsLabelCreated}><b>Created:</b> <a target="_blank" href={`${getNetworkElement({context, chainId}, 'etherscanURL')}/block/${parseInt(metadata.creationBlock)}`}>{parseInt(metadata.creationBlock)}</a> <b>Core:</b> v. {parseInt(metadata.version || 0) + 1}.0</p>
      </div>
    </div>

    <div className={style.ItemsExploreMainTitleArea}>
        <h2>Overview</h2>
        <div className={style.overviewSection}><DappSubMenu
              isSelected={(it) => it.view === currentView}
              voices={menuVoices.map((it) => ({
                ...it,
                onClick: () => it.view && onSetCurrentView(it.view),
              }))}
            />
          </div>
        <div
          className={style.ItemsExploreMainSearch}
          style={{ marginRight: '140px' }}>
          <input placeholder="Search organization..." />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"></path>
            <path
              d="M22 22L20 20"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"></path>
          </svg>
        </div>
      </div>

   <div className={style.OrgHeadline} style={{display: 'none'}}>
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
    </>
  )
}

export default OrgHeadline
