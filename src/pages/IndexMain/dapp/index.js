import React from 'react'
import { Link } from 'react-router-dom'

import style from '../index.module.css'

const IndexMain = () => {
  return (
    <div className={style.IndexPage}>
      <h1>Quattro Robi</h1>
      <Link to="/items/dapp">Robo 1 (Items)</Link>
      <Link to="/organizations/dapp">Robo 2 (Organizations)</Link>
      <Link to="/covenants/dapp">Robo 3 (Convenants)</Link>
      <Link to="/factories/dapp">Robo 4 (Factories)</Link>
    </div>
  )
}

IndexMain.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/dapp',
        Component: IndexMain,
        exact: true,
        requireConnection: false,
        templateProps: {
          menuName: 'appMenu',
          isDapp: false,
          componentOnly: true,
        },
      })
    }

export default IndexMain