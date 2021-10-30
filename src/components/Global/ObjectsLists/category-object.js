import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'
import style from './objects-lists.module.css'

const CategoryObject = (props) => {
  return (
    <> {/* Single Category start*/}
    <a className={style.TokenObject}>
      <figure>
          <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
      </figure>
      <div className={style.ObjectInfo}>
        <div className={style.ObjectInfoCategory}>
          <h5>BojackSwap</h5>
          <span>Granular Organizations, is a powerful tool to build legal or decentralized organizations, on-chain team permissions and more. Granularity is the game...</span>
        </div>
      </div>
    </a>
    {/* Single Category end*/}
    

    
    </>
  )
}

export default CategoryObject
