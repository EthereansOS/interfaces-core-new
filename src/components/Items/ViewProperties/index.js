import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from '../../../all.module.css'

const ViewProperties = ({item}) => {
  if(!item.attributes || item.attributes.length === 0) {
    return <></>
  }
  return (
    <div className={style.ViewProperties}>
      {item.attributes.map(attr => <div key={attr.name} className={style.ViewProperty}>
        <p>{attr.trait_type}:</p>
        <h6>{attr.value || '\u00a0'}</h6>
      </div>)}
    </div>
  )
}

export default ViewProperties
