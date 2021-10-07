import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './covenants-main-sections.module.css'
import DappSubMenu from '../../../components/DappSubMenu/index.js'
import FilterMenu from '../../../components/FilterMenu/index.js'



const FarmExplore = (props) => {
  return (
  <>
    <DappSubMenu></DappSubMenu>
    <FilterMenu></FilterMenu>
  </>
  )
}


export default FarmExplore
