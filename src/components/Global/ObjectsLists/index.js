import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'
import style from './objects-lists.module.css'
import ERC20TokenObject  from './erc20-token-object.js'
import ItemObject  from './item-object.js'
import CategoryObject  from './category-object.js'

const ObjectsLists = (props) => {
  return (
      <div className={style.ObjectsLists}>
        <CategoryObject></CategoryObject>
      </div>
  )
}

export default ObjectsLists
