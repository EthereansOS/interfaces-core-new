import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from '../../../all.module.css'

const ViewDescription = ({item}) => {
  return (
    <div className={style.ViewDescriptionL}>
      <p ref={ref => ref && (ref.innerHTML = item.description || "No description available")}></p>
    </div>
  )
}

export default ViewDescription