import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'
import Navigation from '../Navigation'
import style from './objects-lists.module.css'

const ItemObject = (props) => {
  return (
    <> {/* Single Item start*/}
    <a className={style.TokenObject}>
      <figure>
          <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
      </figure>
      <div className={style.ObjectInfo}>
        <div className={style.ObjectInfoAndLink}>
          <h5>BojackSwap (BJK)</h5>
          <a>Etherscan</a>
          <a className={style.LinkCool}>Item</a>
        </div>
        <div className={style.ObjectInfoBalance}>
          <p>5403393.42543</p>
          <span>Balance</span>
        </div>
      </div>
    </a>
    {/* Single Item end*/}
    

    
    </>
  )
}

export default ItemObject
