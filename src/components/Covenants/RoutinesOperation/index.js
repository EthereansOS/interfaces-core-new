import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './routines-operation.module.css'
import RegularButton from '../../Global/RegularButton/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import ItemLinkButton from '../../Global/ItemLinkButton/index.js'

const RoutinesOperation = (props) => {
  return (
    <>
      {/*Single operation Start*/}
      <div className={style.RoutineOperation}>
        <div className={style.RoutineOperationSchedule}>
          <p><b>Mint</b> 50 OS <a><img src={`${process.env.PUBLIC_URL}/img/os_logo.png`}></img></a> and <b> Swap</b> > Buidl <a><img src={`${process.env.PUBLIC_URL}/img/os_logo.png`}></img></a> > ETH<a><img src={`${process.env.PUBLIC_URL}/img/eth_logo.png`}></img></a></p>
        </div>
        <div className={style.RoutineOperationTB}>
            <ExtLinkButton></ExtLinkButton>
            <ExtLinkButton></ExtLinkButton>
            <ExtLinkButton></ExtLinkButton>
            <ExtLinkButton></ExtLinkButton>
            <ExtLinkButton></ExtLinkButton>
            <ExtLinkButton></ExtLinkButton>
          </div>
      </div>
      {/*Single operation End*/}
    </>
  )
}

export default RoutinesOperation
