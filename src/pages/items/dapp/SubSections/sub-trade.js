import React from 'react'

import Trade from '../../../../components/Global/Trade'

import style from '../../../../all.module.css'

export default ({ item }) => {
  return (
    <>
      <div className={style.CollectionRightSubtitles}>
        <h4>Subtrade</h4>
        <p>Lorem ipsum sim dolorem</p>
      </div>
      <div className={style.ItemsMetaMain}>
        <Trade item={item} />
      </div>
    </>

  )
}