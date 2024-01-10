import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import Navigation from '../Navigation'

import style from '../../../all.module.css'
import Web3Connect from '../Web3Connect'

import { useWeb3, useEthosContext, sendAsync } from 'interfaces-core'

import { useThemeSelector } from '../../../logic/uiUtilities'

const Header = (props) => {
  const { themes, theme, setTheme } = useThemeSelector()
  const [isChecked, setIsChecked] = useState(false)

  const context = useEthosContext()
  const web3Data = useWeb3()
  const { chainId, web3, dualChainId } = web3Data

  const history = useHistory()

  const handleToggleChange = () => {
    const toggleSwitch = document.getElementById('toggleSwitch')
    const theme = toggleSwitch.checked ? 'dark' : 'light'
    setIsChecked(toggleSwitch.checked)
    setTheme(theme)
    localStorage.setItem('toggleState', toggleSwitch.checked)
  }

  useEffect(() => {
    const initialLoad = async () => {
      const toggleSwitch = document.getElementById('toggleSwitch')
      // Utilizza un'operazione asincrona per ripristinare lo stato della checkbox da localStorage
      await new Promise((resolve) => {
        setTimeout(() => {
          const savedToggleState = JSON.parse(
            localStorage.getItem('toggleState')
          )
          if (savedToggleState !== null) {
            toggleSwitch.checked = savedToggleState
            setIsChecked(savedToggleState)
            setTheme(savedToggleState ? 'dark' : 'light')
          } else {
            handleToggleChange()
          }
          resolve()
        }, 0)
      })
    }

    toggleSwitch.addEventListener('change', handleToggleChange)
    initialLoad()

    return () => {
      toggleSwitch.removeEventListener('change', handleToggleChange)
    }
  }, [])

  const switchToNetwork = useCallback(
    () =>
      sendAsync(web3.currentProvider, 'wallet_switchEthereumChain', {
        chainId:
          '0x' +
          parseInt(
            dualChainId ||
              Object.entries(context.dualChainId).filter(
                (it) => parseInt(it[1]) === chainId
              )[0][0]
          ).toString(16),
      }).then(() => history.push('')),
    [chainId, dualChainId, history]
  )

  return (
    <header className={style.Header}>
      <div className={style.FixedHeader}>
        <Link to="" className={style.logoMain}>
          <img src={`${process.env.PUBLIC_URL}/img/logo.png`} />
        </Link>
        <Navigation
          menuName={props.menuName}
          isDapp={props.isDapp}
          selected={props.link}
        />
        <div className={style.CopyRight}>
          &copy;2024 <b>EthereansOS</b> v1.3.2 <br /> All rights reserved
        </div>
      </div>
      <div className={style.RightMenu}>
        <div className={style.ThemeSelect}>
          <label className={style.ThemeSwitch}>
            <input
              type="checkbox"
              id="toggleSwitch"
              checked={isChecked}
              onChange={handleToggleChange}
            />
            <span className={style.ThemeSlider} aria-hidden="true"></span>
          </label>
        </div>
        <div className={style.NetworkSelect}>
          <div>
            <a
              className={
                style.NetworkSelectL1 +
                (!dualChainId ? ' ' + style.opacity1 : '')
              }
              onClick={dualChainId && switchToNetwork}>
              <img src={`${process.env.PUBLIC_URL}/img/ethereum.png`} />
              <p>ETH</p>
            </a>
            <a
              className={
                style.NetworkSelectL2 +
                (dualChainId ? ' ' + style.opacity1 : '')
              }
              onClick={!dualChainId && switchToNetwork}>
              <img src={`${process.env.PUBLIC_URL}/img/Optimism.png`} />
              <p>OP</p>
            </a>
          </div>
        </div>
        <Web3Connect />
      </div>
      <div className={style.BlurHeader}></div>
    </header>
  )
}

export default Header
