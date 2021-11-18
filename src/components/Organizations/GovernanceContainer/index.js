import React from 'react'

import Left from './left'
import Head from './head'
import Right from './right'

import style from './governance-container.css'

export default ({element, headProperties, leftProperties, rightProperties}) => {
  return (
    <div className={style.tomare}>
      <Head {...headProperties} element={element}/>
      <div>
        <Left {...leftProperties} element={element}/>
        <Right {...rightProperties} element={element}/>
      </div>
    </div>
  )
}