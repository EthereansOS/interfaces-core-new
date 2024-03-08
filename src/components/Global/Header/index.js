import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import Navigation from '../Navigation'
import LogoRenderer from '../LogoRenderer'

import style from '../../../all.module.css'
import Web3Connect from '../Web3Connect'
import makeBlockie from 'ethereum-blockies-base64'
import {
  useWeb3,
  useEthosContext,
  sendAsync,
  truncatedWord,
  web3States,
} from 'interfaces-core'

import Select from 'react-select'
import { IconContext } from 'react-icons'
import { FaEthereum } from 'react-icons/fa'

import Toggle from '../../../components/Toggle'

import { useThemeSelector } from '../../../logic/uiUtilities'

const Header = (props) => {
  const { themes, theme, setTheme } = useThemeSelector()
  const [isChecked, setIsChecked] = useState(false)
  const [isMenuHidden, setIsMenuHidden] = useState(true)

  const context = useEthosContext()
  const web3Data = useWeb3()
  const { chainId, web3, dualChainId, account, connectionStatus } = web3Data

  const history = useHistory()

  const toggleMenuVisibility = () => {
    setIsMenuHidden(!isMenuHidden)
  }

  const [ensData, setEnsData] = useState()

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      boxShadow: 'none',
      '&:hover': {
        borderColor: 'transparent',
      },
    }),
    option: (provided, state) => ({
      ...provided,
      display: 'flex',
      alignItems: 'center',
      backgroundColor: state.isSelected ? 'purple' : 'transparent',
      color: 'white',
      ':hover': {
        backgroundColor: 'lightgrey',
      },
    }),
  }

  const options = [
    {
      value: 'ethereum',
      label: (
        <div>
          <FaEthereum /> <div className={style.SelectLabel}>Ethereum</div>
        </div>
      ),
    },
    {
      value: 'optimism',
      label: (
        <div>
          <img
            className={style.SelectLabelOptimism}
            src={`${process.env.PUBLIC_URL}/img/Optimism.png`}
          />{' '}
          <div className={style.SelectLabel}>Optimism</div>
        </div>
      ),
    },
  ]

  const [toggled, setToggled] = React.useState(false)
  const handleClick = () => {
    setToggled((s) => !s)
  }

  useEffect(() => {
    setTimeout(async () => {
      const address = account
      if (
        ensData &&
        ensData.account === account &&
        ensData.chainId === chainId
      ) {
        return
      }
      var name
      try {
        const ethersProvider = new ethers.providers.Web3Provider(
          web3.currentProvider
        )
        name = await ethersProvider.lookupAddress(address)
      } catch (e) {
        var index = e.message.split('\n')[0].indexOf('value="')
        if (index !== -1) {
          name = e.message.substring(index + 7)
          name = name.substring(0, name.indexOf('"'))
        }
      }
      setEnsData((oldValue) => ({ ...oldValue, name, account, chainId }))
    })
  }, [account, chainId, ensData])

  const handleToggleChange = () => {
    const toggleSwitch = document.getElementById('toggleSwitch')
    const theme = toggleSwitch.checked ? 'dark' : 'light'
    setIsChecked(toggleSwitch.checked)
    setTheme(theme)
    localStorage.setItem('toggleState', toggleSwitch.checked)
  }

  const handleNetworkChange = (e) => {
    localStorage.setItem('selectedNetwork', e.value)
  }

  useEffect(() => {
    let toggleSwitch = document.getElementById('toggleSwitch')
    const initialLoad = async () => {
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

    if (toggleSwitch) {
      toggleSwitch.addEventListener('change', handleToggleChange)
    }
    initialLoad()

    return () => {
      if (toggleSwitch) {
        toggleSwitch.removeEventListener('change', handleToggleChange)
      }
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

  const blockie = !ensData?.name ? makeBlockie(account) : undefined

  return (
    <header className={style.Header}>
      <div className={style.FixedHeader}>
        <Link to="" className={style.logoMain}>
          <img src={`${process.env.PUBLIC_URL}/img/logo.png`} />
        </Link>
      </div>
      <div className={style.MobileMenuIcon} onClick={toggleMenuVisibility}>
        <svg width="30px" height="30px" viewBox="0 0 20 20" fill="none">
          <path
            fill="#000000"
            fillRule="evenodd"
            d="M19 4a1 1 0 01-1 1H2a1 1 0 010-2h16a1 1 0 011 1zm0 6a1 1 0 01-1 1H2a1 1 0 110-2h16a1 1 0 011 1zm-1 7a1 1 0 100-2H2a1 1 0 100 2h16z"
          />
        </svg>
      </div>
      <div
        className={`${style.RightMenu} ${isMenuHidden ? style.hideMenu : ''}`}>
        <Navigation
          menuName={props.menuName}
          isDapp={props.isDapp}
          selected={props.link}
          className={style.hideMenu}
        />
        <div className={style.MenuProfile}>
          <Link to="/account">
            <LogoRenderer
              noDotLink
              noFigure
              input={
                ensData?.name
                  ? `//metadata.ens.domains/mainnet/avatar/${ensData?.name}`
                  : blockie
              }
              defaultImage={blockie}
            />
            <div className={style.MenuProfileContent}>
              <h3>My Profile</h3>
              <p>
                {' '}
                {connectionStatus === web3States.NOT_CONNECTED
                  ? 'Connect'
                  : ensData?.name ||
                    truncatedWord({ context, charsAmount: 8 }, account)}
              </p>
            </div>
          </Link>
        </div>
        <IconContext.Provider value={{ color: 'black', size: '1.5em' }}>
          <Select
            defaultValue={options.find(
              (option) =>
                option.value === (localStorage.getItem('selectedNetwork') ?? '')
            )}
            isSearchable={false}
            className={style.NetworkSelectDropdown}
            styles={customStyles}
            options={options}
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null,
            }}
            onChange={(e) => handleNetworkChange(e)}
          />
        </IconContext.Provider>
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
        <Web3Connect />
      </div>
      <div className={style.BlurHeader}></div>
    </header>
  )
}
//

export default Header
