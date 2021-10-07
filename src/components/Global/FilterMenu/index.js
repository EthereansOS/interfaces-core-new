import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './filter-menu.module.css'

const ExploreCollections = (props) => {
  return (
    <div className={style.FilterMenu}>
      <input type="text" className={style.FilterMenuSearch} placeholder="Sort by token address.." value=""></input>
      <select className={style.FilterSelect}><option value="0">Sort by..</option><option value="1">Higher Rewards per day</option><option value="2">Lower Rewards per day</option><option value="3">More Setups</option><option value="4">Less Setups</option></select>
      <label className={style.FilterOnly}>
        <input type="checkbox" checked=""></input>
        <p>Only Active</p>
      </label>
    </div>
  )
}

export default ExploreCollections
