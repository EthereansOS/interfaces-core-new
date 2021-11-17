import React from 'react'
import { Link } from 'react-router-dom'

import style from '../index.module.css'

const IndexMain = () => {
  return (
    <div className={style.IndexPage}>
      <h1>CUATTRO Robi</h1>
      <Link to="/items/dapp">Robo 1 (Items)</Link>
      <br/><br/>
      <Link to="/governances/dapp">Robo 2 (Governances)</Link>
      <br/><br/>
      <Link to="/covenants/dapp">Robo 3 (Convenants)</Link>
      <br/><br/>
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
        requireConnection: true,
        templateProps: {
          menuName: 'appMenu',
          isDapp: false,
        },
      })
    }

export default IndexMain