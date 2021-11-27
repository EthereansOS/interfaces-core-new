import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from '../../../all.module.css'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'

const ViewInfoBox = ({collection}) => {
  return (
    <div className={style.InfoBox}>
      <h1>{collection.name + (collection.symbol ? ` (${collection.symbol})` : "")}</h1>
      <a className={style.shareIt}></a>
      <div className={style.InfoBoxSide}>
        <p>Items: {collection.items.length}</p>
        <p>Farmable:  12</p>
        <p>Organizations:  12</p>
        <p>Delegations:  0</p>
      </div>
      <div className={style.InfoBoxBtns}>
        <ExtLinkButton></ExtLinkButton> {/* Contract - Contract Link */}
        <ExtLinkButton></ExtLinkButton> {/* Website - Website Link */}
        <ExtLinkButton></ExtLinkButton> {/* Host - Host Link */}
        <ExtLinkButton></ExtLinkButton> {/* Open Sea - Open Sea Link */}
      </div>
      <div className={style.InfoBoxaside}>
        <a>Version: Native_1.1.1</a>
      </div>
    </div>
  )
}

export default ViewInfoBox
