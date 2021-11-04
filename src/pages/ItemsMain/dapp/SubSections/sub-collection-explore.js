import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './items-main-sub-sections.module.css'
import ExploreItems from '../../../../components/Items/ExploreItems/index.js'
import ViewCover from '../../../../components/Items/ViewCover/index.js'

const SubCollectionExplore = (props) => {
  return (
      <div className={style.SubCollectionExplore}>
        <div className={style.SubCollectionInfo}>
          <figure className={style.SubCollectionInfoCover}>
          <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
          </figure>
          <div className={style.SubCollectionInfoName}>
            <h5>More From Pirulino Collection</h5>
            <a>View</a>
          </div>
        </div>
        <ExploreItems></ExploreItems>
      </div>
  )
}


export default SubCollectionExplore