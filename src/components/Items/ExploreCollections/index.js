import React from 'react'

import { Link } from 'react-router-dom'

import CategoryObject from '../../Global/ObjectsLists/category-object'
import LogoRenderer from '../../Global/LogoRenderer'

import style from './explore-collections.module.css'

const ExploreCollections = ({element}) => (
  <Link to={"/items/dapp/collections/" + element.id}>
   <div className={style.CollectionSingle}>
      <figure>
        <LogoRenderer input={element}/>
      </figure>
      <div className={style.CollectionTitle}>
        <h6>{element.name}</h6>
      </div>
      <div className={style.CollectionFolder}>
        {element.items.map(item => <a key={item.id}>
          <figure className={style.CollectionFolderItem}>
            <LogoRenderer input={item}/>
          </figure>
        </a>)}
      </div>
   </div>
  </Link>
)

export default () => <CategoryObject element={ExploreCollections}/>