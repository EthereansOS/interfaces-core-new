import React from 'react'
import { Link } from 'react-router-dom'

import style from '../index.module.css'

const IndexMain = () => {
  return (
      <div className={style.CardsLayer}>
        <a className={style.CardsFancy}>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/c-2.png`}></img>
          </figure>
          <Link to="/factories/dapp">Factories</Link>
        </a>
        <a className={style.CardsFancy}>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/c-1.png`}></img>
          </figure>
          <Link to="/items/dapp">Items</Link>
        </a>
        <br></br>
        <a className={style.CardsFancy}>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/c-3.png`}></img>
          </figure>
          <Link to="/governances/dapp">Governance</Link>
        </a>
        <a className={style.CardsFancy}>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/c-4.png`}></img>
          </figure>
          <Link to="/covenants/dapp">Convenants</Link>
        </a>
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