import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './items-main-sub-sections.module.css'
import Trade from '../../../components/Trade/index.js'

const SubTrade = (props) => {
  return (
      <div className={style.ItemsMetaMain}>
        <Trade></Trade>
      </div>
  )
}


export default SubTrade
