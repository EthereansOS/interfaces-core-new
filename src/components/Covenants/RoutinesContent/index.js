import React from 'react'
import { Link } from 'react-router-dom'


import style from '../../../all.module.css'
import RegularButton from '../../Global/RegularButton/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import ItemLinkButton from '../../Global/ItemLinkButton/index.js'

const RoutinesContent = (props) => {
  return (
    <>
      {/*Single Farm Start*/}
      <div className={style.RoutineContent}>
        <div className={style.RoutineContentTitle}>
              <h6>EthOS - OS Fixed Inflation</h6>
              <RegularButton></RegularButton>
        </div>
        <div className={style.RoutineContentInfo}>
            <p><b>Executor Reward</b>: 3%</p>
            <p>
              <ExtLinkButton></ExtLinkButton> {/* Contract - Contract Link */}
              <ExtLinkButton></ExtLinkButton> {/* Host - Host Link */}
              <ExtLinkButton></ExtLinkButton> {/* Extension - Extension Link */}
            </p>
        </div>
      </div>
      {/*Single Farm End*/}
    </>
  )
}

export default RoutinesContent
