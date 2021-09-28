import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './view-cover.module.css'

const ViewCover = (props) => {
  return (
    <figure className={style.ICViewCover}>
            <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
    </figure>
  )
}

export default ViewCover
