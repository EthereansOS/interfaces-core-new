import React from 'react'

import Trade from '../../../../components/Global/Trade'

import style from '../../../../all.module.css'

export default ({ item }) => {
  return (
    <div style={{padding: '10px', width: '100%'}}>
      <div className={style.CollectionRightSubtitles} style={{borderBottom: '0px', paddingBottom:'0px'}}>
        <h4>Trade</h4>
      </div>
      <div className={style.ItemsMetaMain}>
        <Trade item={item} />
      </div>
    </div>

  )
}