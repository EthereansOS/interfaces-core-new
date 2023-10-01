import React from 'react'

import { formatMoney } from 'interfaces-core'

import style from '../../../all.module.css'

export default ({title, value, total}) => {

  var percentage = parseInt(value) / parseInt(total)
  percentage = percentage * 100
  percentage = formatMoney(percentage, 2)
  percentage += "%"

  return (
      <div className={style.Upshot}>
        {title && <span>{title}</span>}
        <div className={style.UpshotBar}>
          <figure style={{width : percentage}}>{percentage}</figure>
        </div>
      </div>
  )
}