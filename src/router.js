import React, { useMemo, useState, useEffect } from 'react'
import { Switch, Route } from 'react-router-dom'

import Web3 from 'web3'
import { useEthosContext, usePlaceholder, useWeb3, abi, getNetworkElement, web3Utils, sendAsync, fromDecimals, toDecimals, blockchainCall } from '@ethereansos/interfaces-core'
import Connect from './components/Global/Connect'
import MainTemplate from './components/Global/MainTemplate'
import AlphaBanner from './components/Global/AlphaBanner'

const NoMatch = () => <div>No Match</div>

const AppRouter = () => {

  const context = useEthosContext()
  const web3Data = useWeb3()

  const { chainId, account } = web3Data

  useEffect(() => {
    window.Web3 = window.Web3 || Web3
    window.sendAsync = window.sendAsync || sendAsync
    window.abi = window.abi || abi
    window.blockchainCall = window.blockchainCall || blockchainCall
    window.web3Utils = window.web3Utils || web3Utils
    window.getNetworkElement = window.getNetworkElement || (varName => getNetworkElement({context: window.context, chainId : window.web3Data.chainId}, varName))
    window.context = context
    window.web3Data = web3Data
    window.toDecimals = window.toDecimals || toDecimals
    window.fromDecimals = window.fromDecimals || fromDecimals
    window.web3 = web3Data.web3 || window.web3 || new window.Web3()
    window.setAndUnlockAccount = window.setAndUnlockAccount || function setAndUnlockAccount(acc, customProvider) {
      window.sessionStorage.removeItem("unlockedAccount")
      window.sessionStorage.removeItem("customProvider")
      acc && window.sessionStorage.setItem("unlockedAccount", acc)
      customProvider && window.sessionStorage.setItem("customProvider", customProvider)
      return window.setAccount(acc, acc ? customProvider || "http://127.0.0.1:8545" : undefined)
    }
  }, [context, chainId, account, web3Data])

  useEffect(() => setTimeout(() => window.setAndUnlockAccount(window.sessionStorage.unlockedAccount, window.sessionStorage.customProvider)), [])

  const routes = usePlaceholder('router')

  const [banner, setBanner] = useState(false)

  const memoedRoutes = useMemo(() => {
    return routes.map(
      ({ path, exact, Component, requireConnection, templateProps }) => {
        return (
          <Route key={path} path={path} exact={exact}>
            {requireConnection ? (
              <Connect>
                {!banner && <AlphaBanner close={() => setBanner(true)}/>}
                <MainTemplate {...templateProps} Component={Component} />
              </Connect>
            ) : (
              <MainTemplate {...templateProps} Component={Component} />
            )}
          </Route>
        )
      }
    )
  }, [routes, banner])

  return (
      <Switch>
        {memoedRoutes}
        <Route>
          <NoMatch />
        </Route>
      </Switch>
  )
}

export default AppRouter
