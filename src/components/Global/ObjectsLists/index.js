import React, { useState } from 'react'

import ERC20TokenObject from './erc20-token-object.js'
import ItemObject from './item-object.js'
import CategoryObject from './category-object.js'
import DefaultChild from './child'
import NFTS from './nfts'

import style from '../../../all.module.css'

var defaultSelections = [
  {
    name: 'ERC-20',
    value: ERC20TokenObject,
  },
  {
    name: 'Items',
    value: ItemObject,
  },
  /* {
  name : 'Items V1',
  value : ItemObject,
  properties : {hardCabledList : 'itemsV1ListURL'}
},*/ {
    name: 'Collections',
    value: CategoryObject,
  },
  {
    name: 'ERC-721',
    value: NFTS,
    properties: { type: 'ERC721' },
  },
  {
    name: 'ERC-1155',
    value: NFTS,
    properties: { type: 'ERC1155' },
  },
]

const ObjectsLists = ({ onlySelections, selectionProperties, list }) => {
  onlySelections =
    onlySelections && onlySelections instanceof Array
      ? onlySelections
      : [onlySelections]
  var selections = onlySelections
    ? defaultSelections.filter((it) => onlySelections.indexOf(it.name) !== -1)
    : defaultSelections
  selectionProperties &&
    (selections = selections.map((it) => ({
      ...it,
      properties: { ...it.properties, ...selectionProperties[it.name] },
    })))

  var [currentSelection, setCurrentSelection] = useState(selections[0])
  var [searchText, setSearchText] = useState('')

  var Child = list ? DefaultChild : currentSelection.value
  return (
    <div className={style.TokensSelector}>
      <div className={style.TokensSelectorList}>
        <div className={style.ObjectsLists}>
          <Child {...{ list, searchText, ...currentSelection.properties }} />
        </div>
      </div>
      <div className={style.TokensSelectorCategories}>
        <input
          type="text"
          placeholder="Search name or address"
          value={searchText}
          onChange={(e) => setSearchText(e.currentTarget.value)}
        />
        {!list && (
          <div className={style.TokensSelectorCategoriesList}>
            {selections.map((it) => {
              return (
                <a
                  key={it.name}
                  className={
                    currentSelection.name === it.name
                      ? style.selected
                      : undefined
                  }
                  onClick={() => setCurrentSelection(it)}>
                  {it.name}
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ObjectsLists
