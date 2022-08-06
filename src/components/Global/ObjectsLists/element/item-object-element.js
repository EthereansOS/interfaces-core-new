import React, { useState, useEffect } from 'react'

import style from '../../../../all.module.css'

import { getNetworkElement, useEthosContext, useWeb3, fromDecimals, shortenWord, blockchainCall } from '@ethereansos/interfaces-core'
import LogoRenderer from '../../LogoRenderer'
import { Link } from 'react-router-dom'
import { loadItemDynamicInfo } from '../../../../logic/itemsV2'
import { useOpenSea } from '../../../../logic/uiUtilities'
import OurCircularProgress from '../../OurCircularProgress'

export default ({element, onClick, noBalance}) => {

  const seaport = useOpenSea()

  const context = useEthosContext()

  const web3Data = useWeb3()
  const { chainId, account, newContract } = web3Data

  const [balance, setBalance] = useState(element.balance)

  const [loadedData, setLoadedData] = useState()

  useEffect(() => {
    blockchainCall((element.contract = element.contract || newContract(context.IERC1155ABI, element.address)).methods.balanceOf, account, element.id).then(bal => setBalance(element.balance = bal))
    loadItemDynamicInfo({...web3Data, context, seaport}, element).then(setLoadedData)
  }, [element.address, account, element.id])

  return (
    <a className={style.TokenObject} onClick={() => onClick && onClick(element)}>
      {!loadedData && <OurCircularProgress/>}
      {loadedData && <LogoRenderer input={{...element, ...loadedData}}/>}
      <div className={style.ObjectInfo}>
        <div className={style.ObjectInfoAndLink}>
          <h5>{shortenWord({ context, charsAmount : 15}, element.name)} ({shortenWord({ context, charsAmount : 15}, element.symbol)})</h5>
          <a target="_blank" onClick={e => e.stopPropagation()} href={`${getNetworkElement({context, chainId}, "etherscanURL")}/token/${element.address}`}>Etherscan</a>
          <Link className={style.LinkCool} onClick={e => e.stopPropagation()} to={'/items/dapp/' + element.address}>Item</Link>
        </div>
        <div style={{"visibility" : noBalance ? "hidden" : "visible"}} className={style.ObjectInfoBalance}>
          <p>{fromDecimals(balance, element.decimals || '0')}</p>
          <span>Balance</span>
        </div>
      </div>
    </a>
  )
}