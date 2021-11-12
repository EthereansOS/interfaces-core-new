import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'
import style from './objects-lists.module.css'
import ERC20TokenObject  from './erc20-token-object.js'
import ItemObject  from './item-object.js'
import CategoryObject  from './category-object.js'

var defaultSelections = [{
  name : 'ERC-20',
  value : ERC20TokenObject
}, {
  name : 'Items',
  value : ItemObject
}, {
  name : 'Collections',
  value : CategoryObject
}];

const ObjectsLists = ({onlySelections, selectionProperties}) => {
  onlySelections = onlySelections && onlySelections instanceof Array ? onlySelections : [onlySelections]
  var selections = onlySelections ? defaultSelections.filter(it => onlySelections.indexOf(it.name) !== -1) : defaultSelections
  selectionProperties && (selections = selections.map(it => ({...it, properties : selectionProperties[it.name]})))

  var [currentSelection, setCurrentSelection] = useState(selections[0])
  var [searchText, setSearchText] = useState('')

  var Child = currentSelection.value
  return (
    <div className={style.TokensSelector}>
      <div className={style.TokensSelectorList}>
        <div className={style.ObjectsLists}>
          <Child {...{searchText, ...currentSelection.properties}}/>
        </div>
      </div>
      <div className={style.TokensSelectorCategories}>
        <input type="text" placeholder="Search name or address" value={searchText} onChange={e => setSearchText(e.currentTarget.value)}/>
        <div className={style.TokensSelectorCategoriesList}>
          {selections.map(it => <a key={it.name} href="javascript:;" className={currentSelection === it ? style.selected : undefined} onClick={() => setCurrentSelection(it)}>{it.name}</a>)}
        </div>
      </div>
    </div>
  )
}

export default ObjectsLists
