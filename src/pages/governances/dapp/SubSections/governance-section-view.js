import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './organizations-main-sub-sections.module.css'
import GovernanceContainer from '../../../../components/Organizations/GovernanceContainer'

const GovernanceSectionView = (props) => {
  return (
    <div className={style.GovernanceCardPage}>
     <GovernanceContainer/>
    </div>
  )
}

export default GovernanceSectionView
