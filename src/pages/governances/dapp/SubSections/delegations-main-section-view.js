import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './organizations-main-sub-sections.module.css'
import RegularMiniButton from '../../../../components/Global/RegularMiniButton'
import DelegationMainThingsCard from '../../../../components/Organizations/DelegationMainThingsCard'
import DelegationWalletsCard from '../../../../components/Organizations/DelegationWalletsCard'


const DelegationsMainSectionView = (props) => {
  return (
    <div className={style.OrgThingsCards}>
      <DelegationMainThingsCard></DelegationMainThingsCard>
      <DelegationWalletsCard></DelegationWalletsCard>
    </div>
  )
}

export default DelegationsMainSectionView
