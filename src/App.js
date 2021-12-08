import { HashRouter } from 'react-router-dom'
import React from 'react'
import '@ethereansos/interfaces-ui/dist/index.cjs.css'

import {
  PluginsContextProvider,
  Web3ContextProvider,
  InitContextProvider,
  GlobalContextsProvider,
} from '@ethereansos/interfaces-core'

import { ThemeSelectorContextProvider, GlobalModalContextProvider, TransactionModalContextProvider } from './logic/uiUtilities'

import appPlugin from './plugins'
import AppRouter from './router'
import './typography.css'
import './app.css'
import './test.css'

function App() {
  return (
      <InitContextProvider
        initMethod={async ({ setReady, setValue }) => {

          var localContext
          try {
            localContext = await (await fetch(
              `${process.env.PUBLIC_URL}/data/context.local.json`
            )).json()
          } catch(e) {
            console.clear && console.clear()
          }

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
            context = {...context, ...(await response.json())}
          } catch(e) {
          }

          setValue('context', {...context, localContext})
          setReady()
        }}
        Loading={() => <div>Loading...</div>}
        Error={({ error }) => <div>Error on application init: {error}</div>}>
        <PluginsContextProvider plugins={[appPlugin]}>
          <Web3ContextProvider blockInterval={1} blockIntervalTimeout={4000}>
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
          </Web3ContextProvider>
        </PluginsContextProvider>
      </InitContextProvider>
  )
}

export default App
