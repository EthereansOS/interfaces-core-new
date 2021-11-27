import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'
import style from '../../../all.module.css'

const DappBannerExpl = (props) => {
  return (
      <div className={style.DappBannerExpl}>
        <div className={style.DappBannerL}>
          <h2>Banner Explainer Title</h2>
          <p>This is the banner explainer text and is a very low expl</p>
        </div>
        <div className={style.DappBannerS}>
          <h2>Banner Explainer Title</h2>
          <p>This is the banner explainer text and is a very low expl</p>
        </div>
      </div>
  )
}

export default DappBannerExpl
