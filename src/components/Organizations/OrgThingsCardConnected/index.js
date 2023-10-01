import React from 'react'

import style from '../../../all.module.css'
import LogoRenderer from '../../Global/LogoRenderer'

import { useEthosContext, useWeb3, getNetworkElement } from 'interfaces-core'

const OrgThingsCardTokens = ({title, elements}) => {

  const context = useEthosContext()

  const { chainId } = useWeb3()

  return (
    <div className={style.OrgThingsCardPics}>
      <div className={style.OrgThingsRegularTitle}>
        <h6>{title}</h6>
      </div>
      <div className={style.OrgThingsRegularInfoPictureCarousel}>
        {elements.map(it => <a key={it.address} target="_blank" href={`${getNetworkElement({context, chainId}, 'etherscanURL')}/token/${it.interoperableInterface?.options.address || it.address}`}>
          <LogoRenderer input={it}/>
        </a>)}
      </div>
    </div>
  )
}

export default OrgThingsCardTokens
