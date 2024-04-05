import React, { useState, useEffect } from 'react'
import {
  usePlaceholder,
  useWeb3,
  web3States,
  truncatedWord,
  useEthosContext,
  abi,
  web3Utils,
  sendAsync,
  blockchainCall,
  formatLink,
} from 'interfaces-core'
import { ethers } from 'ethers'
import LogoRenderer from '../LogoRenderer'
import { Link } from 'react-router-dom'
import makeBlockie from 'ethereum-blockies-base64'

import style from '../../../all.module.css'

import { lookupAddressDualChain } from 'logic/dualChain'

const Navigation = ({ menuName, isDapp, selected }) => {
  const context = useEthosContext()
  const web3Data = useWeb3()
  const { dualChainId } = web3Data

  const menuItems = usePlaceholder(menuName).filter(
    (it) => !dualChainId || it.name !== 'Factories'
  )

  const {
    chainId,
    account,
    connectionStatus,
    setConnector,
    web3,
    newContract,
    dualChainWeb3,
  } = useWeb3()

  const [ensData, setEnsData] = useState()

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
        name = await lookupAddressDualChain({
          chainId,
          dualChainId,
          web3,
          dualChainWeb3,
          address,
        })
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

  const blockie = !ensData?.name ? makeBlockie(account) : undefined

  const navItem = (item) => {
    return (
      <Link
        className={`${style.NavigationItem} ${
          item.link === selected ? style.selected : ''
        }`}
        key={item.name}
        to={item.link}>
        <span>
          <img src={item.image}></img> <p>{item.label}</p>
        </span>
      </Link>
    )
  }

  return (
    <nav className={style.Navigation}>
      <Link to="/" className={`${style.NavigationItem}`}>
        <span>
          <img src="./img/dashboard.png"></img> <p>Dashboard</p>
        </span>
      </Link>
      {menuItems.map((item) => navItem(item))}
    </nav>
  )
}

export default Navigation
