import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './upshots.module.css'



const Upshots = (props) => {
  return (
    
      <div className={style.Upshot}>
        <span>selection 1</span>
        <div className={style.UpshotBar}>
          <figure>99%</figure>
        </div>
      </div>
  )
}

export default Upshots
