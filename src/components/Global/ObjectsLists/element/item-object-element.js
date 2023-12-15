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

  const [loadedData, setLoadedData] = useState()

  useEffect(() => {
    loadItemDynamicInfo({...web3Data, context, seaport}, element).then(result => setLoadedData({...element, ...result}))
  }, [element])

  if(!loadedData) {
    return <OurCircularProgress/>
  }

  return (
    <a className={style.TokenObject} onClick={() => onClick && loadedData && onClick(loadedData)}>
      {loadedData && <LogoRenderer input={loadedData}/>}
      <div className={style.ObjectInfo}>
        <div className={style.ObjectInfoAndLink}>
          <h5>{shortenWord({ context, charsAmount : 15}, loadedData.name)} ({shortenWord({ context, charsAmount : 15}, loadedData.symbol)})</h5>
          {/*<a target="_blank" onClick={e => e.stopPropagation()} href={`${getNetworkElement({context, chainId}, "etherscanURL")}/token/${loadedData.address}`}>Etherscan</a>
          <Link className={style.LinkCool} onClick={e => e.stopPropagation()} to={'/items/' + loadedData.address}>Item</Link>*/}
        </div>
        <div className={style.ObjectInfoBalance}>
          <p>{'\u00a0'}</p>
        </div>
      </div>
    </a>
  )
}