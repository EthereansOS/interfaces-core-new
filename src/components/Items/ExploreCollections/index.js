import React from 'react'

import { Link } from 'react-router-dom'

import CategoryObject from '../../Global/ObjectsLists/category-object'
import LogoRenderer from '../../Global/LogoRenderer'

import style from '../../../all.module.css'

const ExploreCollections = ({element}) => (
  <Link to={element.isDecks ? "/items/decks" : "/items/collections/" + element.id}>
   <div className={style.CollectionSingle}>
      <LogoRenderer input={element}/>
      <div className={style.CollectionTitle}>
        <h6>{element.name}</h6>
      </div>
      <div className={style.CollectionFolder}>
        {element.items.map(item => <a key={item.id}>
          <LogoRenderer badge input={item} figureClassName={style.CollectionFolderItem}/>
        </a>)}
      </div>
   </div>
  </Link>
)

export default () => <CategoryObject element={ExploreCollections}/>