import { HashRouter } from 'react-router-dom'
import React, { useEffect, useCallback, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import 'interfaces-ui/dist/index.cjs.css'
import style from './all.module.css'
import colors from './colors.css'

import {
  PluginsContextProvider,
  Web3ContextProvider,
  InitContextProvider,
  GlobalContextsProvider,
  cache,
} from 'interfaces-core'

import {
  ThemeSelectorContextProvider,
  GlobalModalContextProvider,
  TransactionModalContextProvider,
  OpenSeaContextProvider,
} from './logic/uiUtilities'

import appPlugin from './plugins'
import AppRouter from './router'
import './typography.css'
import './app.css'
import './test.css'

const App = () => {
  const [init, setInit] = useState(false)
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setInit(true)
    })
  }, [])

  const particlesLoaded = (container) => {}

  return (
    <>
      {init && (
        <Particles
          id="tsparticles"
          particlesLoaded={particlesLoaded}
          options={{
            fpsLimit: 60,
            interactivity: {
              events: {
                onClick: {
                  enable: false,
                  mode: 'push',
                },
                onHover: {
                  enable: false,
                  mode: 'repulse',
                },
                resize: true,
              },
              modes: {
                push: {
                  quantity: 4,
                },
                repulse: {
                  distance: 200,
                  duration: 0.4,
                },
              },
            },
            particles: {
              color: {
                value: '#ffffff',
              },
              links: {
                color: '#ffffff',
                distance: 150,
                enable: true,
                opacity: 0.1,
                width: 1,
              },
              move: {
                direction: 'none',
                enable: true,
                outModes: {
                  default: 'bounce',
                },
                random: false,
                speed: 1,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                  area: 800,
                },
                value: 80,
              },
              opacity: {
                value: 0.1,
              },
              shape: {
                type: 'circle',
              },
              size: {
                value: { min: 1, max: 5 },
              },
            },
            detectRetina: true,
          }}
        />
      )}
      <InitContextProvider
        initMethod={async ({ setReady, setValue }) => {
          var response = await fetch(
            `${process.env.PUBLIC_URL}/data/context.json`
          )
          var context = await response.json()

          response = await fetch(`${process.env.PUBLIC_URL}/data/abis.json`)
          context = { ...context, ...(await response.json()) }

          try {
            response = await fetch(
              `${process.env.PUBLIC_URL}/data/context.local.json`
            )
            const localContext = await response.json()
            context = { ...context, ...localContext, localContext }
          } catch (e) {}

          try {
            var version = await (
              await fetch(`${process.env.PUBLIC_URL}/data/version.txt`)
            ).text()
            version = version.indexOf('<!DOCTYPE html>') === 0 ? '' : version
            localStorage.version !== version && (await cache.clear())
            localStorage.setItem('version', version)
          } catch (e) {}

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
                        <AppRouter />
                      </TransactionModalContextProvider>
                    </GlobalModalContextProvider>
                  </ThemeSelectorContextProvider>
                </HashRouter>
              </GlobalContextsProvider>
            </OpenSeaContextProvider>
          </Web3ContextProvider>
        </PluginsContextProvider>
      </InitContextProvider>
    </>
  )
}

export default App
