import React, { useState, useEffect } from 'react'

import style from '../../../../all.module.css'

import { abi, getNetworkElement, useEthosContext, useWeb3, fromDecimals, shortenWord } from 'interfaces-core'
import LogoRenderer from '../../LogoRenderer'
import { Link } from 'react-router-dom'
import { loadItemDynamicInfo } from '../../../../logic/itemsV2'
import { useOpenSea } from '../../../../logic/uiUtilities'
import OurCircularProgress from '../../OurCircularProgress'
import { getRawField } from '../../../../logic/generalReader'

export default ({element, onClick, noBalance}) => {

  const seaport = useOpenSea()

  const context = useEthosContext()

  const web3Data = useWeb3()
  const { chainId, account, web3 } = web3Data

  const [balance, setBalance] = useState(element.balance)

  const [loadedData, setLoadedData] = useState()

  useEffect(() => {
    loadItemDynamicInfo({...web3Data, context, seaport}, element).then(setLoadedData)
  }, [element])

  useEffect(() => {
    getRawField({provider : web3.currentProvider}, element.l2Address || element.address, 'balanceOf(address)', account).then(val => val !== '0x' && setBalance(abi.decode(["address"], val)[0].toString()))
  }, [element, account])

  return (
    <a className={style.TokenObject} onClick={() => onClick && loadedData && onClick(loadedData)}>
      {!loadedData && <OurCircularProgress/>}
      {loadedData && <LogoRenderer input={loadedData}/>}
      <div className={style.ObjectInfo}>
        <div className={style.ObjectInfoAndLink}>
          <h5>{shortenWord({ context, charsAmount : 15}, element.name)} ({shortenWord({ context, charsAmount : 15}, element.symbol)})</h5>
          <a target="_blank" onClick={e => e.stopPropagation()} href={`${getNetworkElement({context, chainId}, "etherscanURL")}/token/${element.address}`}>Etherscan</a>
          <Link className={style.LinkCool} onClick={e => e.stopPropagation()} to={'/items/' + element.address}>Item</Link>
        </div>
        <div style={{"visibility" : noBalance ? "hidden" : "visible"}} className={style.ObjectInfoBalance}>
          <p>{fromDecimals(balance, element.decimals || '0')}</p>
          <span>Balance</span>
        </div>
      </div>
    </a>
  )
}