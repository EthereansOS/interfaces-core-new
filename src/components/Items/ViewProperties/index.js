import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from '../../../all.module.css'

const ViewProperties = (props) => {
  return (
    <div className={style.ViewProperties}>
      <div className={style.ViewProperty}>
        <p>Background:</p>
        <h6>purple</h6>
      </div>
      <div className={style.ViewProperty}>
        <p>Background:</p>
        <h6>purple</h6>
      </div>
      <div className={style.ViewProperty}>
        <p>Background:</p>
        <h6>purple</h6>
      </div>
      <div className={style.ViewProperty}>
        <p>Line extension:</p>
        <h6>Marco Vasapollo</h6>
      </div>
      <div className={style.ViewProperty}>
        <p>Background:</p>
        <h6>purple</h6>
      </div>
      
    </div>
  )
}

export default ViewProperties
