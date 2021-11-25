import classnames from 'classnames'
import { HashRouter } from 'react-router-dom'
import React from 'react'
import '@ethereansos/interfaces-ui/dist/index.cjs.css'

import {
  PluginsContextProvider,
  Web3ContextProvider,
  InitContextProvider,
  GlobalContextsProvider,
} from '@ethereansos/interfaces-core'
import appPlugin from './plugins'
import AppRouter from './router'
import './typography.css'
import './app.css'
import './test.css'

function App() {
  // Change this value to set the theme
  const theme = 'dark' // dark || light
  return (
    <div className={classnames('theme-selector', theme)}>
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

          setValue('context', context)
          setReady()
        }}
        Loading={() => <div>Loading...</div>}
        Error={({ error }) => <div>Error on application init: {error}</div>}>
        <PluginsContextProvider plugins={[appPlugin]}>
          <Web3ContextProvider blockInterval={1} blockIntervalTimeout={4000}>
            <GlobalContextsProvider>
              <HashRouter>
                <AppRouter/>
              </HashRouter>
            </GlobalContextsProvider>
          </Web3ContextProvider>
        </PluginsContextProvider>
      </InitContextProvider>
    </div>
  )
}

export default App
