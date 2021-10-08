import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './covenants-main-sections.module.css'
import DappSubMenu from '../../../components/DappSubMenu/index.js'
import FilterMenu from '../../../components/Global/FilterMenu/index.js'
import FarmContent from '../../../components/Covenants/FarmContent/index.js'



const FarmExplore = (props) => {
  return (
  <>
    <DappSubMenu></DappSubMenu>
    <FilterMenu></FilterMenu>
    <FarmContent></FarmContent>
  </>
  )
}


export default FarmExplore
