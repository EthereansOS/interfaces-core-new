import React from 'react'

import { OpenSeaContextProvider } from '../../../../logic/uiUtilities'
import Trade from '../../../../components/Global/Trade'

import style from '../../../../all.module.css'

export default ({item}) => {
  return (
      <div className={style.ItemsMetaMain}>
        <OpenSeaContextProvider>
          <Trade item={item}/>
        </OpenSeaContextProvider>
      </div>
  )
}