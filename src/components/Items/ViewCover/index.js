import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './view-cover.module.css'

const ViewCover = ({item}) => {
  return (
    <figure className={style.ICViewCover}>
        <img src={item.image}></img>
    </figure>
  )
}

export default ViewCover
