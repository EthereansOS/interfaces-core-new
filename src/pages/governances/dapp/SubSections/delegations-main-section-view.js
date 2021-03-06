import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from '../../../../all.module.css'
import RegularMiniButton from '../../../../components/Global/RegularMiniButton'
import DelegationMainThingsCard from '../../../../components/Organizations/DelegationMainThingsCard'


const DelegationsMainSectionView = (props) => {
  return (
    <div className={style.OrgThingsCards}>
      <DelegationMainThingsCard></DelegationMainThingsCard>
    </div>
  )
}

export default DelegationsMainSectionView
