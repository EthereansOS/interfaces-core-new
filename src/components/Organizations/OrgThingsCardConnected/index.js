import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from '../../../all.module.css'
import RegularMiniButton from '../../Global/RegularMiniButton/index.js'

const OrgThingsCardTokens = (props) => {
  return (
    <div className={style.OrgThingsCardPics}>
      <div className={style.OrgThingsRegularTitle}>
        <h6>Governance Items</h6>
      </div>
      <div className={style.OrgThingsRegularInfoPictureCarousel}>
        <a>
          <figure className={style.CollectionFolderItem}>
            <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
          </figure>
        </a>
        <a>
          <figure className={style.CollectionFolderItem}>
            <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
          </figure>
        </a>
        <a>
          <figure className={style.CollectionFolderItem}>
            <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
          </figure>
        </a>
        <a>
          <figure className={style.CollectionFolderItem}>
            <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
          </figure>
        </a>
        <a>
          <figure className={style.CollectionFolderItem}>
            <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
          </figure>
        </a>
        <a>
          <figure className={style.CollectionFolderItem}>
            <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
          </figure>
        </a>
        <a>
          <figure className={style.CollectionFolderItem}>
            <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
          </figure>
        </a>
        <a>
          <figure className={style.CollectionFolderItem}>
            <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
          </figure>
        </a>
        <a>
          <figure className={style.CollectionFolderItem}>
            <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
          </figure>
        </a>
      </div>
    </div>
  )
}

export default OrgThingsCardTokens
