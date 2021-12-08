import React from 'react'

import {useWeb3, useEthosContext, fromDecimals } from '@ethereansos/interfaces-core'

import Web3DependantList from '../Web3DependantList'
import { useOpenSea } from '../../../logic/uiUtilities'
import { getOwnedTokens } from '../../../logic/opensea'
import { OpenSeaContextProvider } from '../../../logic/uiUtilities'
import style from '../../../all.module.css'

import LogoRenderer from '../LogoRenderer'

const SingleOpenseaElement = ({element, onClick}) => {
  const context = useEthosContext()
  const { chainId } = useWeb3()
  return (
    <a className={style.TokenObject} onClick={() => onClick && onClick(element)}>
      <LogoRenderer input={element}/>
      <div className={style.ObjectInfo}>
        <div className={style.ObjectInfoAndLink}>
          <h5>{element.name}</h5>
          <a target="_blank" href={`https://${chainId === 4 ? 'testnets.' : ''}opensea.io/assets/${element.tokenAddress}/${element.tokenId}`}>Opensea</a>
          <a className={style.LinkCool}>{element.assetContract.schemaName.split('ERC').join('ERC-')}</a>
        </div>
        <div style={{"visibility" : "visible"}} className={style.ObjectInfoBalance}>
          <p>{fromDecimals(element.balance, element.decimals)}</p>
          <span>Balance</span>
        </div>
      </div>
    </a>
  )
}

const NFTS = ({type, renderedProperties}) => {

    const context = useEthosContext()
    const seaport  = useOpenSea()
    const { web3, account, newContract, chainId, getGlobalContract } = useWeb3()

    return <Web3DependantList
      Renderer={SingleOpenseaElement}
      renderedProperties={renderedProperties}
      provider={() => getOwnedTokens({context, seaport, getGlobalContract, chainId, account, web3, newContract}, type)}
      discriminant={account}
    />
  }

export default (props) => (
    <OpenSeaContextProvider>
        <NFTS {...props}/>
    </OpenSeaContextProvider>
)