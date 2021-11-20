import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './organizations-main-sub-sections.module.css'
import RegularMiniButton from '../../../../components/Global/RegularMiniButton'
import OrgMainThingsCard from '../../../../components/Organizations/OrgMainThingsCard'
import OrgThingsCardConnected from '../../../../components/Organizations/OrgThingsCardConnected'

const MainSectionView = (props) => {
  return (
    <div className={style.OrgThingsCards}>
      <OrgThingsCardConnected></OrgThingsCardConnected>
      <OrgThingsCardConnected></OrgThingsCardConnected>
      <OrgMainThingsCard></OrgMainThingsCard>
    </div>
  )
}

export default MainSectionView
