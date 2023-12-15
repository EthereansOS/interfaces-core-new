import React, { useState, useEffect, useMemo, useCallback } from 'react'

import style from '../../../../all.module.css'

import { blockchainCall, fromDecimals, getNetworkElement, useEthosContext, useWeb3, VOID_ETHEREUM_ADDRESS, formatLink, shortenWord } from 'interfaces-core'

import CircularProgress from '../../OurCircularProgress'
import LogoRenderer from '../../LogoRenderer'

export default ({element, onClick}) => {
  const context = useEthosContext()

  const { web3, chainId, account, newContract } = useWeb3()

  return (
    <a className={style.TokenObject} onClick={() => onClick({
      ...element,
      decimals : element.decimals + "",
      image : formatLink({ context }, element.image || element.logoURI),
      contract : element.contract || newContract(context.ItemInteroperableInterfaceABI, element.address),
      balance : "0"
    })}>
      <LogoRenderer input={element}/>
      <div className={style.ObjectInfo}>
        <div className={style.ObjectInfoAndLink}>
          <h5>{shortenWord({ context, charsAmount : 15}, element.name)} ({shortenWord({ context, charsAmount : 15}, element.symbol)})</h5>
          {false && element.address !== VOID_ETHEREUM_ADDRESS && <a href={`${getNetworkElement({context, chainId}, "etherscanURL")}/token/${element.address}`} target="blank">Etherscan</a>}
        </div>
        <div className={style.ObjectInfoBalance}>
          <p>
            {'\u00a0'}
          </p>
        </div>
      </div>
    </a>
  )
}