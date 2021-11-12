import React, { useState } from 'react'

import ERC20TokenObjectElement from './element/erc20-token-object-element'
import Web3DependantList from '../../../logic/frontend/web3DependantList'
import { useWeb3, VOID_ETHEREUM_ADDRESS } from '@ethereansos/interfaces-core'

const defaultEthereumElement = {
  name: "Ethereum",
  symbol: "ETH",
  address: VOID_ETHEREUM_ADDRESS,
  decimals: 18,
  image : `${process.env.PUBLIC_URL}/img/eth_logo.png`
}

export default ({alsoETH, searchText}) => {

  const { web3, account } = useWeb3()

  const [ethereumElement, setEthereumElement] = useState(defaultEthereumElement)

  alsoETH && useState(() => {
    setTimeout(async () => {
      var balance = await web3.eth.getBalance(account)
      setEthereumElement(oldValue => ({...oldValue, balance}))
    })
  }, [web3, account])

  return <Web3DependantList
      Renderer={ERC20TokenObjectElement}
      provider={
        () => {
          var elements = []
          alsoETH && elements.push(ethereumElement)
          return elements
        }
      }
      searchText={searchText}
      emptyMessage=''
    />
}