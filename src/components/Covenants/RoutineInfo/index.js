import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from '../../../all.module.css'
import BackButton from '../../Global/BackButton/index.js'
import RegularButton from '../../Global/RegularButton/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import ActionAWeb3Button from '../../Global/ActionAWeb3Button/index.js'
import RegularSelect from '../../Global/RegularSelect/index.js'
import RoutinesOperation from '../../Covenants/RoutinesOperation/index.js'


const RoutineInfo = (props) => {
  return (
    <div className={style.RutineBox}>
      <div className={style.RutineTitle}>
        <div className={style.RutineBack}>
          <BackButton></BackButton>
        </div>
        <h2>EthOS Fixed Inflation - OS token daily</h2>
      </div>
      <div className={style.OperationsBox}>
        <RoutinesOperation></RoutinesOperation>
      </div>
      <div className={style.OperationsTrigger}>
        <h6>2% Executor Reward by</h6>
        <RegularSelect></RegularSelect>
        <ActionAWeb3Button></ActionAWeb3Button>
        <span>Next Execution Block:<a> #13047744</a></span>
      </div>
    </div>
  )
}

export default RoutineInfo
