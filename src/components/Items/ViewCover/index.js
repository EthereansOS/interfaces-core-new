import React from 'react'

import LogoRenderer from '../../Global/LogoRenderer'

import style from '../../../all.module.css'

const ViewCover = ({item}) => {
  return (
    <LogoRenderer input={item} figureClassName={style.ICViewCover}/>
  )
}

export default ViewCover
