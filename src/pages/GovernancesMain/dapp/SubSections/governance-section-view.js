import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './organizations-main-sub-sections.module.css'
import RegularMiniButton from '../../../../components/Global/RegularMiniButton'
import GovernanceCard from '../../../../components/Organizations/GovernanceCard'

const GovernanceSectionView = (props) => {
  return (
    <div className={style.GovernanceCardPage}>
      <GovernanceCard></GovernanceCard>
    </div>
  )
}

export default GovernanceSectionView
