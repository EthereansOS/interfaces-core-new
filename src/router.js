import React, { useMemo, useState, useEffect } from 'react'
import { Switch, Route } from 'react-router-dom'

import Web3 from 'web3'
import { useEthosContext, usePlaceholder, useWeb3, abi, getNetworkElement, web3Utils, sendAsync, fromDecimals, toDecimals, blockchainCall } from '@ethereansos/interfaces-core'
import Connect from './components/Global/Connect'
import MainTemplate from './components/Global/MainTemplate'
import BetaBanner from './components/Global/BetaBanner'

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
    window.setGanache = window.setGanache || async function setGanache() {
        window.ganache = window.ganache || new window.Web3.providers.HttpProvider("http://127.0.0.1:8545")
        window.bypassEstimation = window.bypassEstimation || true
        try {
          if(window.web3.currentProvider !== window.ganache) {
            window.web3Data.web3 = window.web3 = new Web3(window.ganache)
          }
        } catch(e) {}
        try {
          await window.sendAsync(window.ganache, "evm_addAccount", window.web3Data.account, 0)
        } catch(e) {}
    }
    window.setAndUnlockAccount = window.setAndUnlockAccount || async function setAndUnlockAccount(acc) {
      window.sessionStorage.removeItem("unlockedAccount")
      await window.setAccount(acc)
      if(!acc) {
        return
      }
      await window.setGanache()
      await window.sendAsync(window.ganache, "evm_addAccount", acc, 0)
      window.sessionStorage.setItem("unlockedAccount", acc)
    }
    try {
      window.web3.eth.getBalance(window.web3Data.account).then(async result => {
        var balance = parseFloat(fromDecimals(result, 18, true)) >= 2000
        if(balance && !window.ganache) {
          await window.setGanache()
          await window.setAndUnlockAccount(window.sessionStorage.unlockedAccount)
        }
      }).catch(() => null)
    } catch(e) {}
  }, [context, chainId, account, web3Data])

  const routes = usePlaceholder('router')

  const [banner, setBanner] = useState(false)

  const memoedRoutes = useMemo(() => {
    return routes.map(
      ({ path, exact, Component, requireConnection, templateProps }) => {
        return (
          <Route key={path} path={path} exact={exact}>
            {requireConnection ? (
              <Connect>
                {!banner && <BetaBanner close={() => setBanner(true)}/>}
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
