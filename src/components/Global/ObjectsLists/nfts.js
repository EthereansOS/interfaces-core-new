import React, { useCallback, useMemo } from 'react'

import {useWeb3, useEthosContext, fromDecimals, isEthereumAddress, shortenWord } from '@ethereansos/interfaces-core'

import Web3DependantList from '../Web3DependantList'
import { useOpenSea } from '../../../logic/uiUtilities'
import { getOwnedTokens } from '../../../logic/opensea'
import { loadNFTItemsFromAddress } from '../../../logic/itemsV2'
import style from '../../../all.module.css'

import LogoRenderer from '../LogoRenderer'

const SingleOpenseaElement = ({element, onClick}) => {
  const context = useEthosContext()
  const { chainId } = useWeb3()
  return (
    <a className={style.TokenObject} onClick={() => onClick && onClick(element)}>
      <LogoRenderer badge input={element}/>
      <div className={style.ObjectInfo}>
        <div className={style.ObjectInfoAndLink}>
          <h5>{shortenWord({ context, charsAmount : 15}, element.name)}</h5>
          <a target="_blank" onClick={e => e.stopPropagation()} href={`https://${chainId === 4 ? 'testnets.' : ''}opensea.io/assets/${element.tokenAddress}/${element.tokenId}`}>Opensea</a>
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

export default ({type, renderedProperties, searchText}) => {

    const context = useEthosContext()
    const seaport  = useOpenSea()
    const web3Data = useWeb3()
    const { web3, account, newContract, chainId, getGlobalContract } = web3Data

    const tokenAddress = useMemo(() => searchText && isEthereumAddress(searchText) ? searchText : '', [searchText])

    const filter = useCallback(it => !tokenAddress && searchText ? it.name?.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 : it, [searchText, tokenAddress])

    return <Web3DependantList
      Renderer={SingleOpenseaElement}
      renderedProperties={renderedProperties}
      provider={() => tokenAddress ? loadNFTItemsFromAddress({ context, seaport, ...web3Data}, tokenAddress, type) : getOwnedTokens({ context, seaport, ...web3Data}, type)}
      discriminant={account + tokenAddress}
      filter={filter}
      fixedList
    />
}