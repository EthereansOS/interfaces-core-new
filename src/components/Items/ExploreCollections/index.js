import React from 'react'

import { Link } from 'react-router-dom'

import CategoryObject from '../../Global/ObjectsLists/category-object'

import style from './explore-collections.module.css'

const ExploreCollections = ({element}) => (
  <Link to={"/dapp/items/collections/" + element.id}>
   <div className={style.CollectionSingle}>
      <figure>
        <img src={element.image}/>
      </figure>
      <div className={style.CollectionTitle}>
        <h6>{element.name}</h6>
      </div>
      <div className={style.CollectionFolder}>
        {element.items.map(item => <a key={item.id}>
          <figure className={style.CollectionFolderItem}>
            <img src={item.image}/>
          </figure>
        </a>)}
      </div>
   </div>
  </Link>
)

export default () => <CategoryObject element={ExploreCollections}/>