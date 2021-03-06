import { HashRouter } from 'react-router-dom'
import React from 'react'
import '@ethereansos/interfaces-ui/dist/index.cjs.css'
import style from './all.module.css'

import {
  PluginsContextProvider,
  Web3ContextProvider,
  InitContextProvider,
  GlobalContextsProvider,
} from '@ethereansos/interfaces-core'

import { ThemeSelectorContextProvider, GlobalModalContextProvider, TransactionModalContextProvider, OpenSeaContextProvider } from './logic/uiUtilities'

import appPlugin from './plugins'
import AppRouter from './router'
import './typography.css'
import './app.css'
import './test.css'

function App() {
  return (
      <InitContextProvider
        initMethod={async ({ setReady, setValue }) => {

          var response = await fetch(
            `${process.env.PUBLIC_URL}/data/context.json`
          )
          var context = await response.json()

          response = await fetch(
            `${process.env.PUBLIC_URL}/data/abis.json`
          )
          context = {...context, ...(await response.json())}

          try {
            response = await fetch(
              `${process.env.PUBLIC_URL}/data/context.local.json`
            )
            const localContext = await response.json()
            context = { ...context, ...localContext, localContext }
          } catch(e) {
          }

          setValue('context', context)
          setReady()
        }}
        Loading={() => <div>Loading...</div>}
        Error={({ error }) => <div>Error on application init: {error}</div>}>
        <PluginsContextProvider plugins={[appPlugin]}>
          <Web3ContextProvider blockInterval={1} blockIntervalTimeout={4000}>
            <OpenSeaContextProvider>
              <GlobalContextsProvider>
                <HashRouter>
                  <ThemeSelectorContextProvider>
                    <GlobalModalContextProvider>
                      <TransactionModalContextProvider>
                        <AppRouter/>
                      </TransactionModalContextProvider>
                    </GlobalModalContextProvider>
                  </ThemeSelectorContextProvider>
                </HashRouter>
              </GlobalContextsProvider>
            </OpenSeaContextProvider>
          </Web3ContextProvider>
        </PluginsContextProvider>
      </InitContextProvider>
  )
}

export default App
