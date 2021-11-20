import React, { useMemo, useState } from 'react'
import { Switch, Route } from 'react-router-dom'

import { usePlaceholder } from '@ethereansos/interfaces-core'
import Connect from './components/Global/Connect'
import MainTemplate from './components/Global/MainTemplate'
import BetaBanner from './components/Global/BetaBanner'

const NoMatch = () => <div>No Match</div>

const AppRouter = () => {
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
