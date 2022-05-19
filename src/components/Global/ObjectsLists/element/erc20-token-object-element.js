import React, { useState, useEffect, useMemo, useCallback } from 'react'

import style from '../../../../all.module.css'

import { blockchainCall, fromDecimals, getNetworkElement, useEthosContext, useWeb3, VOID_ETHEREUM_ADDRESS, formatLink, shortenWord } from '@ethereansos/interfaces-core'

import CircularProgress from '../../OurCircularProgress'
import LogoRenderer from '../../LogoRenderer'

export default ({element, onClick}) => {
  const context = useEthosContext()

  const { chainId, account, newContract } = useWeb3()

  const [balance, setBalance] = useState(element.balance)

  useEffect(() => {
    blockchainCall((element.contract = element.contract || newContract(context.ItemInteroperableInterfaceABI, element.address)).methods.balanceOf, account).then(bal => setBalance(element.balance = bal))
  }, [element.address, account])

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
            {!balance ? <CircularProgress/> : fromDecimals(balance, element.decimals)}
          </p>
          <span>Balance</span>
        </div>
      </div>
    </a>
  )
}