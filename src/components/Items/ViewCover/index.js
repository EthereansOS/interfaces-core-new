import React from 'react'

import style from '../../../all.module.css'
import ItemImage from '../ItemImage'

const ViewCover = ({item}) => {
  return (
    <ItemImage input={item} figureClassName={style.ICViewCover}/>
  )
}

export default ViewCover
