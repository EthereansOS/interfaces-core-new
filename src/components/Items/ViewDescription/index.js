import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './view-description.module.css'

const ViewDescription = ({item}) => {
  return (
    <div className={style.ViewDescription}>
      <p ref={ref => ref && (ref.innerHTML = item.description)}></p>
    </div>
  )
}

export default ViewDescription
