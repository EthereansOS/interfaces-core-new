import React, { useContext } from 'react'
import { UseWalletProvider, useWallet } from 'use-wallet'

const UseWalletContext = React.createContext('useWalletWalletProvider')

export const getWallet = () => useContext(UseWalletContext)

export const WalletProvider = props => {
  return (
    <UseWalletProvider connectors={props.connectors}>
      <UseWalletContextInitializer {...props} />
    </UseWalletProvider>
  )
}

const UseWalletContextInitializer = ({children}) => {
  const wallet = useWallet()
  return <UseWalletContext.Provider value={wallet}>{children}</UseWalletContext.Provider>
}