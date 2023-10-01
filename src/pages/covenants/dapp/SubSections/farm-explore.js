import React from 'react'


import style from './covenants-sub-sections.module.css'
import FilterMenu from '../../../../components/Global/FilterMenu/index.js'
import FarmContent from '../../../../components/Covenants/FarmContent/index.js'



const FarmExplore = (props) => {
  return (
  <>
    <FilterMenu></FilterMenu>
    <FarmContent></FarmContent>
  </>
  )
}


export default FarmExplore
