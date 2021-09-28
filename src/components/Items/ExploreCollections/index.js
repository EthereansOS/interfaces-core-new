import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './explore-collections.module.css'

const ExploreCollections = (props) => {
  return (
    <Link to="/">
      {/*Single Collection Start*/}
     <div className={style.CollectionSingle}>
        <figure>
          <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
        </figure>
        <div className={style.CollectionTitle}>
          <h6>I'm a fancy Collection</h6>
        </div>
        <div className={style.CollectionFolder}>
          {/*Single Item Prev Start (Load the newest 10)*/}
          <a>
            <figure className={style.CollectionFolderItem}>
              <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
            </figure>
          </a>
          {/*Single Item Prev End*/}
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
     {/*Single Collection End*/}     
    </Link>
  )
}

export default ExploreCollections
