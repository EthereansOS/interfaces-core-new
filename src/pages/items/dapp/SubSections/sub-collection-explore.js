import React from 'react'
import { Link } from 'react-router-dom'

import LogoRenderer from '../../../../components/Global/LogoRenderer'
import ExploreItems from '../../../../components/Items/ExploreItems'

import { shortenWord, useEthosContext } from 'interfaces-core'

import style from '../../../../all.module.css'

const SubCollectionExplore = ({item}) => {

  const context = useEthosContext()

  return (
      <div className={style.SubCollectionExplore}>
        <Link to={`/items/collections/${item.collectionId}`} className={style.SubCollectionInfo}>
          <LogoRenderer input={item.collectionData} figureClassName={style.SubCollectionInfoCover}/>
          <div className={style.SubCollectionInfoName}>
            <h2>More From {item.collectionData.name} Collection</h2>
            <p>{shortenWord({ context, charsAmount : '260', shortenWordSuffix : '...' }, item.collectionData.description)}</p>
          </div>
        </Link>
        <ExploreItems forCollection={item.collectionData} excluding={item.id}/>
      </div>
  )
}

export default SubCollectionExplore