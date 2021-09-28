import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './view-basics.module.css'

const ViewBasics = (props) => {
  return (
    <div className={style.ViewBasics}>
        <h5>Uni Bojack (UNIBJ)</h5>
        <a>Contract</a>
        <a>Website</a>
        <a>Host</a>
        <a>Open Sea</a>
        <a>Uniswap</a>
        <a>Share</a>
    </div>
  )
}

export default ViewBasics
