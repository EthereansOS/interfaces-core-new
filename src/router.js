import React, { useMemo, useState, useEffect } from 'react'
import { Switch, Route } from 'react-router-dom'
import style from './all.module.css'
import Web3 from 'web3'
import {
  getLogs,
  useEthosContext,
  usePlaceholder,
  resolveCID,
  useWeb3,
  abi,
  getNetworkElement,
  web3Utils,
  sendAsync,
  fromDecimals,
  toDecimals,
  blockchainCall,
  numberToString
} from 'interfaces-core'
import { getRawField } from 'logic/generalReader'
import Connect from './components/Global/Connect'
import MainTemplate from './components/Global/MainTemplate'
import AlphaBanner from './components/Global/AlphaBanner'

const NoMatch = () => <div>No Match</div>

const AppRouter = () => {
  const context = useEthosContext()
  const web3Data = useWeb3()

  const { chainId, account } = web3Data

  useEffect(() => {
    if (!window.originalFetch) {
      const urlCacheResolverExluded = [
        ...context.urlCacheResolverExluded,
        context.urlCacheResolver,
      ].map((it) => it.toLowerCase())
      window.originalFetch = window.fetch
      window.fetch = function instrumentedFetch() {
        var originalArguments = arguments
        try {
          var url = arguments[0].toLowerCase()
          if (url.indexOf('myuri') !== -1 || url.indexOf('real_uri') !== -1) {
            return (window.localFetch =
              window.localFetch ||
              new Promise((ok) =>
                ok({
                  text: () =>
                  (window.localFetch2 =
                    window.localFetch2 || new Promise((ok2) => ok2('{}'))),
                  json: () =>
                  (window.localFetch3 =
                    window.localFetch3 || new Promise((ok3) => ok3({}))),
                })
              ))
          }
          var args = [...arguments]
          if (
            url.indexOf('//') !== -1 &&
            urlCacheResolverExluded.filter((it) => url.indexOf(it) !== -1)
              .length === 0
          ) {
            //(args[0] = context.urlCacheResolver + encodeURIComponent(args[0])) && console.log(arguments[0], args[0])
          }
          var result = window.originalFetch.apply(window, [
            resolveCID(args[0]),
            ...args.filter((_, i) => i !== 0),
          ])
          return args[0] === arguments[0]
            ? result
            : result.then((response) => {
              var originalJson = response.json
              response.json = new Promise(async (ok) => {
                try {
                  return ok(JSON.parse(atob(await response.text())))
                } catch (e) {
                  return ok(await originalJson())
                }
              })
              return response
            })
        } catch (e) {
          console.log('Instrumented fetch error');
          console.log(e);
          return window.originalFetch.apply(window, originalArguments)
        }
      }
    }
    window.isLocal =
      window.isLocal || window.location.host.indexOf('127.0.0.1') !== -1
    window.Web3 = window.Web3 || Web3
    window.sendAsync = window.sendAsync || sendAsync
    window.abi = window.abi || abi
    window.blockchainCall = window.blockchainCall || blockchainCall
    window.web3Utils = window.web3Utils || web3Utils
    window.getNetworkElement =
      window.getNetworkElement ||
      ((varName) =>
        getNetworkElement(
          { context: window.context, chainId: window.web3Data.chainId },
          varName
        ))
    window.context = context
    window.web3Data = web3Data
    window.toDecimals = window.toDecimals || toDecimals
    window.fromDecimals = window.fromDecimals || fromDecimals
    window.web3 = web3Data.web3 || window.web3 || new window.Web3()
    window.getRawField = window.getRawField || getRawField
    window.getLogs = window.getLogs || getLogs
    window.resolveCID = window.resolveCID || resolveCID
    window.numberToString = window.numberToString || numberToString
    window.setAndUnlockAccount =
      window.setAndUnlockAccount ||
      function setAndUnlockAccount(acc, customProvider) {
        window.sessionStorage.removeItem('unlockedAccount')
        window.sessionStorage.removeItem('customProvider')
        acc && window.sessionStorage.setItem('unlockedAccount', acc)
        customProvider &&
          window.sessionStorage.setItem('customProvider', customProvider)
        return window.setAccount(
          acc,
          acc ? customProvider || 'http://127.0.0.1:8545' : undefined
        )
      }
  }, [context, chainId, account, web3Data])

  useEffect(
    () =>
      setTimeout(() =>
        window.setAndUnlockAccount(
          window.sessionStorage.unlockedAccount,
          window.sessionStorage.customProvider
        )
      ),
    []
  )

  const routes = usePlaceholder('router')

  const [banner, setBanner] = useState(window.sessionStorage.alphaBanner === 'true')

  const memoedRoutes = useMemo(() => {
    return routes.map(
      ({ path, exact, Component, requireConnection, templateProps }) => {
        return (
          <Route key={path} path={path} exact={exact}>
            {requireConnection ? (
              <Connect>
                {!banner && <AlphaBanner close={() => void (window.sessionStorage.setItem('alphaBanner', 'true'), setBanner(true))} />}
                <MainTemplate {...templateProps} Component={Component} />
              </Connect>
            ) : (
              <MainTemplate {...templateProps} Component={Component} />
            )}
            <div className={style.CopyRight}>
              &copy;2024 <b>EthereansOS</b> v1.3.2 <br /> All rights reserved
            </div>
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
