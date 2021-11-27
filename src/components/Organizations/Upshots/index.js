import React from 'react'

import { formatMoney } from '@ethereansos/interfaces-core'

import style from '../../../all.module.css'

export default ({title, value, total}) => {

  var percentage = parseInt(value) / parseInt(total)
  percentage = percentage * 100
  percentage = formatMoney(percentage, 4)
  percentage += "%"

  return (
      <div className={style.Upshot}>
        <span>{title}</span>
        <div className={style.UpshotBar}>
          <figure>{percentage}</figure>
        </div>
      </div>
  )
}