import React from 'react'

import LogoRenderer from '../../Global/LogoRenderer'

import style from './view-cover.module.css'

const ViewCover = ({item}) => {
  return (
    <figure className={style.ICViewCover}>
      <LogoRenderer input={item}/>
    </figure>
  )
}

export default ViewCover
