import React from 'react'

import { Link } from 'react-router-dom'

import CategoryObject from '../../Global/ObjectsLists/category-object'
import LogoRenderer from '../../Global/LogoRenderer'

import style from '../../../all.module.css'

const ExploreCollections = ({ element }) => (
  <div className={style.ItemSingle}>
    <Link
      to={
        element.isDecks ? '/items/decks' : '/items/collections/' + element.id
      }>
      <button className={style.ItemTitleTopZoneLikeButton}>
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"></path>
        </svg>
      </button>
      <svg
        className={style.ItemTitleTopZone}
        viewBox="0 0 196 55"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M196 55V0H0.5V1H4.05286C12.4067 1 20.1595 5.34387 24.5214 12.4685L43.5393 43.5315C47.9012 50.6561 55.654 55 64.0078 55H196Z"
          fill="currentColor"></path>
      </svg>
      <div className={style.ItemInfoSide}>
        <p className={style.ItemTitleTopZoneLabel}>Symbol</p>
        <p className={style.ItemTitleTopZoneValue}>{element.symbol}</p>
      </div>
      <LogoRenderer input={element} />
      <div className={style.ItemTitle}>
        <h6>{element.name}</h6>
        <h4>Collection</h4>
      </div>
      <svg
        className={style.ItemTitleBottomZone}
        width="281"
        viewBox="0 0 281 99"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0 0V99H258.059C248.54 99 239.92 93.3743 236.089 84.6606L205.167 14.3394C201.335 5.62568 192.716 0 183.197 0H0Z"
          fill="currentColor"></path>
      </svg>

      <div className={style.CollectionSingle}>
        <div className={style.CollectionFolder}>
          {element.items.map((item) => (
            <a key={item.id}>
              <LogoRenderer
                badge
                input={item}
                figureClassName={style.CollectionFolderItem}
              />
            </a>
          ))}
        </div>
      </div>
    </Link>
  </div>
)

export default () => <CategoryObject element={ExploreCollections} />
