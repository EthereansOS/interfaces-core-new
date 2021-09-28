import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './items-main-sub-sections.module.css'
import MetadataSection from '../../../components/MetadataSection/index.js'

const SubTrade = (props) => {
  return (
      <div className={style.ItemsTradeMain}>
        <MetadataSection></MetadataSection>
      </div>
  )
}


export default SubTrade
