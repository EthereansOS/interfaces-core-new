import React from 'react'

import style from '../../../all.module.css'
import LogoRenderer from '../../Global/LogoRenderer'

import { useEthosContext, useWeb3, getNetworkElement, abi } from 'interfaces-core'

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
          <LogoRenderer input={{...it, address : !it.passedAsERC20 ? abi.decode(["address"], abi.encode(["uint256"], [it.id]))[0] : it.address}}/>
        </a>)}
      </div>
    </div>
  )
}

export default OrgThingsCardTokens
