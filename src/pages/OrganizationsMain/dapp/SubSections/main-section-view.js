import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './organizations-main-sub-sections.module.css'
import RegularMiniButton from '../../../../components/Global/RegularMiniButton'
import OrgMainThingsCard from '../../../../components/Organizations/OrgMainThingsCard'
import OrgThingsCardText from '../../../../components/Organizations/OrgThingsCardText'
import OrgThingsCardTokens from '../../../../components/Organizations/OrgThingsCardTokens'

const MainSectionView = (props) => {
  return (
    <div className={style.OrgThingsCards}>
      
     <OrgMainThingsCard></OrgMainThingsCard>
     <OrgThingsCardText></OrgThingsCardText>
     <OrgThingsCardTokens></OrgThingsCardTokens>
     <OrgThingsCardTokens></OrgThingsCardTokens>
     <OrgThingsCardTokens></OrgThingsCardTokens>
    </div>
  )
}

export default MainSectionView
