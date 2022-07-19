import React, { useState, useEffect } from 'react'

import style from '../../../../all.module.css'

import { getNetworkElement, useEthosContext, useWeb3, fromDecimals, shortenWord, blockchainCall } from '@ethereansos/interfaces-core'
import LogoRenderer from '../../LogoRenderer'

export default ({element, onClick, noBalance}) => {

  const context = useEthosContext()

  const web3Data = useWeb3()
  const { chainId, account, newContract } = web3Data

  const [balance, setBalance] = useState(element.balance)

  useEffect(() => {
    blockchainCall((element.contract = element.contract || newContract(context.IERC1155ABI, element.address)).methods.balanceOf, account, element.id).then(bal => setBalance(element.balance = bal))
  }, [element.address, account, element.id])

  return (
    <a className={style.TokenObject} onClick={() => onClick && onClick(element)}>
      <LogoRenderer badge input={element}/>
      <div className={style.ObjectInfo}>
        <div className={style.ObjectInfoAndLink}>
          <h5>{shortenWord({ context, charsAmount : 15}, element.name)} ({shortenWord({ context, charsAmount : 15}, element.symbol)})</h5>
          <a>Etherscan</a>
          <a className={style.LinkCool} target="_blank" href={`${getNetworkElement({context, chainId}, "etherscanURL")}/token/${element.address}`}>Item</a>
        </div>
        <div style={{"visibility" : noBalance ? "hidden" : "visible"}} className={style.ObjectInfoBalance}>
          <p>{fromDecimals(balance, element.decimals || '0')}</p>
          <span>Balance</span>
        </div>
      </div>
    </a>
  )
}