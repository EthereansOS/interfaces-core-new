import React, { useState, useEffect } from 'react'

import {
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

const Web3Connect = () => {
  const context = useEthosContext()

  const {
    chainId,
    account,
    connectionStatus,
    setConnector,
    web3,
    newContract,
    dualChainId,
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

      window.localStorage.setItem('walletAddress', null)
      window.localStorage.setItem('walletAddress', account)
    })
  }, [account, chainId, ensData])

  const blockie = !ensData?.name ? makeBlockie(account) : undefined

  return (
    <div className={style.Web3Connect}>
      {/* Ready for Layer 2 selection
        <a className={style.Web3ConnectChain}>
          <img src={`${process.env.PUBLIC_URL}/img/ethereum.png`}></img>
          <p>Ethereum <span>▼</span></p>
        </a>*/}
      <Link to="/account" className={style.Web3ConnectWallet}>
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
        <p>
          {connectionStatus === web3States.NOT_CONNECTED
            ? 'Connect'
            : ensData?.name ||
              truncatedWord({ context, charsAmount: 8 }, account)}
        </p>
      </Link>
    </div>
  )
}

export default Web3Connect
