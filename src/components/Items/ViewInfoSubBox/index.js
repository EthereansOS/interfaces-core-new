import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'


import style from '../../../all.module.css'

const ViewInfoSubBox = (props) => {
  return (
    <div className={style.InfoBox}>
      <h1>A fancy Collection (FCL)</h1>
      <a className={style.shareIt}></a>
      <div className={style.InfoBoxSide}>
        <p>Items: 32</p>
        <p>Farmable:  12</p>
        <p>Organizations:  12</p>
        <p>Delegations:  0</p>
      </div>
      <div className={style.InfoBoxBtns}>
        <a>Contract</a>
        <a>Website</a>
        <a>Host</a>
        <a>Open Sea</a>
      </div>
      <div className={style.InfoBoxaside}>
        <a>Version: Native_1.1.1</a>
      </div>
    </div>
  )
}

export default ViewInfoSubBox
