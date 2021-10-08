import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './farm-content.module.css'
import RegularButton from '../../Global/RegularButton/index.js'

const ExploreCollections = (props) => {
  return (
    <>
      {/*Single Farm Start*/}
      <div className={style.FarmContent}>
        <div className={style.FarmContentTitle}>
            <figure>
              <a>
                <img src={`${process.env.PUBLIC_URL}/img/os_logo.png`}></img>
              </a>
            </figure>
            <aside>
              <h6>Farm EthOS</h6>
              <RegularButton></RegularButton>
            </aside>
        </div>
      </div>
      {/*Single Farm End*/}
    </>   
  )
}

export default ExploreCollections
