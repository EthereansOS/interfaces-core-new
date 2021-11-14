import React from 'react'

import TokenLogo from '../../Global/TokenLogo'

import style from './view-cover.module.css'

const ViewCover = ({item}) => {
  return (
    <figure className={style.ICViewCover}>
      <TokenLogo input={item}/>
    </figure>
  )
}

export default ViewCover
