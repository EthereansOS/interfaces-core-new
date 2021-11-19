import React from 'react'

import Left from './left'
import Head from './head'
import Right from './right'

import style from './governance-container.module.css'

export default ({element, headProperties, leftProperties, rightProperties}) => {
  return (
    <div className={style.GovCard}>
        <Head {...headProperties} element={element}/>
          <div className={style.GovCardOpened}>
        <Left {...leftProperties} element={element}/>
        <Right {...rightProperties} element={element}/>
      </div>
    </div>
  )
}