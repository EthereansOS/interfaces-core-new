import React, { useContext, useEffect, useMemo } from 'react'
import { init, useConnectWallet  } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import walletConnectModule from '@web3-onboard/walletconnect'
import coinbaseWalletModule from '@web3-onboard/coinbase'
import envToContext from '../lib/utils/envToContext'
import web3Utils from 'web3-utils'

init({
  wallets: [
    injectedModule(),
    coinbaseWalletModule({ 
      darkMode: true,
      enableMobileWalletLink : true,
      reloadOnDisconnect : true
    }),
    walletConnectModule({
      projectId : "8e0fdbb0c3598b0639f3a959769f0272",
      requiredChains : Object.keys(envToContext.chainInfo).map(it => parseInt(it)),
      dappUrl : "https://ethereans.mypinata.cloud"
    })
  ],
  chains: [
    ...Object.entries(envToContext.chainInfo).map(it => ({...it[1], id : web3Utils.numberToHex(it[0])}))
  ],
  accountCenter: {
    desktop: {
      enabled: true,
      position: 'bottomLeft'
    },
    mobile: {
      enabled: true,
      position: 'bottomLeft'
    }
  },
  theme : "dark",
  connect : {
    disableClose : true,
    autoConnectLastWallet : true,
    autoConnectAllPreviousWallet : true,
    removeWhereIsMyWalletWarning : true
  },
  appMetadata : {
    name : "Ethereans Protocol",
    icon : 'os_logo_40.png',
    logo : 'img/logo_wallet.png',
    explore : 'https://ethereans.app',
    description : "Ethereans Protocol. Made by Ethereans for Ethereans"
  }
})

const Web3OnboardContext = React.createContext('web3OnboardWalletProvider')

export const getWallet = () => useContext(Web3OnboardContext)

export const WalletProvider = props => {

  const [{wallet}, connect] = useConnectWallet()

  useEffect(() => !wallet && connect(), [wallet])

  const value = useMemo(() => !wallet || !wallet.accounts[0] ? null : {
    account : web3Utils.toChecksumAddress(wallet.accounts[0].address),
    chainId : parseInt(wallet.chains[0].id),
    networkName : wallet.chains[0].namespace,
    ethereum : wallet.provider
  }, [wallet])

  return <Web3OnboardContext.Provider value={value}>{value && props.children}</Web3OnboardContext.Provider>
}