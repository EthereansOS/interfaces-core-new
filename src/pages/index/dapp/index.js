import { useWeb3 } from '@ethereansos/interfaces-core'
import React from 'react'
import { Link } from 'react-router-dom'

import style from '../../../all.module.css'

const IndexMain = () => {

  const web3Data = useWeb3()

  const { dualChainId } = web3Data

  return (
      <div className={style.CardsLayerS}>
        {!dualChainId && <Link to="/factories" className={style.CardsFancy}>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/c-2.png`}></img>
          </figure>
          <p>Factories</p>
        </Link>}
        <Link to="/items" className={style.CardsFancy}>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/c-1.png`}></img>
          </figure>
          <p>Items</p>
        </Link>
        <br></br>
        {!dualChainId && <Link to="/guilds" className={style.CardsFancy}>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/c-3.png`}></img>
          </figure>
          <p>Guilds</p>
        </Link>}
        <Link to="/covenants" className={style.CardsFancy}>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/c-4.png`}></img>
          </figure>
          <p>Covenants</p>
        </Link>
      </div>
  )
}

IndexMain.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/',
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