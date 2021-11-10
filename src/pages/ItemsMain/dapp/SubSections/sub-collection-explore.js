import React from 'react'
import { Link } from 'react-router-dom'

import style from './items-main-sub-sections.module.css'
import ExploreItems from '../../../../components/Items/ExploreItems/index.js'

const SubCollectionExplore = ({item}) => {
  return (
      <div className={style.SubCollectionExplore}>
        <div className={style.SubCollectionInfo}>
          <figure className={style.SubCollectionInfoCover}>
          <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
          </figure>
          <div className={style.SubCollectionInfoName}>
            <h5>More From {item.collectionData.name} Collection</h5>
            <Link to={`/dapp/items/collections/${item.collectionId}`}>View</Link>
          </div>
        </div>
        <ExploreItems forCollection={item.collectionData} excluding={item.id}/>
      </div>
  )
}

export default SubCollectionExplore