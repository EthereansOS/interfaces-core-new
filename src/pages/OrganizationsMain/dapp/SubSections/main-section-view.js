import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './organizations-main-sub-sections.module.css'
import RegularMiniButton from '../../../../components/Global/RegularMiniButton'
import OrgThingsCard from '../../../../components/Organizations/OrgMainThingsCard'

const MainSectionView = (props) => {
  return (
    <div className={style.OrgThingsCards}>
      
     <OrgThingsCard></OrgThingsCard>
    </div>
  )
}

export default MainSectionView
