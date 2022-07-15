import React, { useCallback, useMemo } from 'react'
import { Link, useHistory } from 'react-router-dom'
import Navigation from '../Navigation'

import style from '../../../all.module.css'
import Web3Connect  from '../Web3Connect'

import { useWeb3, useEthosContext, sendAsync } from '@ethereansos/interfaces-core'

import { useThemeSelector } from '../../../logic/uiUtilities'

const Header = (props) => {

  const { themes, theme, setTheme } = useThemeSelector()

  const context = useEthosContext()
  const web3Data = useWeb3()
  const { chainId, web3, dualChainId } = web3Data

  const history = useHistory()

  const switchToNetwork = useCallback(() => sendAsync(web3.currentProvider, 'wallet_switchEthereumChain', {chainId : "0x" + parseInt(dualChainId || Object.entries(context.dualChainId).filter(it => parseInt(it[1]) === chainId)[0][0]).toString(16)}).then(() => history.push('/dapp')), [chainId, dualChainId, history])

  return (
      <header className={style.Header}>
        <div className={style.FixedHeader}>
          <Link to="/dapp" className={style.logoMain}><img src={`${process.env.PUBLIC_URL}/img/logo_main.png`}/></Link>
          <Navigation menuName={props.menuName} isDapp={props.isDapp} selected={props.link}/>
        </div>
        <div className={style.RightMenu}>
          <div className={style.NetworkSelect}>
            <div>
              <a className={style.NetworkSelectL1 + (!dualChainId ? (' ' + style.opacity1) : '')} onClick={dualChainId && switchToNetwork}>
                <img src={`${process.env.PUBLIC_URL}/img/ethereum.png`}/>
                <p>ETH</p>
              </a>
              <a className={style.NetworkSelectL2 + (dualChainId ? (' ' + style.opacity1) : '')} onClick={!dualChainId && switchToNetwork}>
                <img src={`${process.env.PUBLIC_URL}/img/optimism.png`}/>
                <p>OP</p>
              </a>
            </div>
          </div>
          <Web3Connect/>
          <div className={style.ThemeSelect}>
            <select value={theme} onChange={e => setTheme(e.currentTarget.value)}>
              {themes.map(it => <option key={it.value} value={it.value}>{it.name}</option>)}
            </select>
          </div>
        </div>
        <div className={style.BlurHeader}></div>
      </header>
  )
}

export default Header