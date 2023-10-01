import React from 'react'
import { Link } from 'react-router-dom'


import style from '../../../all.module.css'
import RegularButton from '../../Global/RegularButton/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import ItemLinkButton from '../../Global/ItemLinkButton/index.js'

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
        <div className={style.FarmContentInfo}>
            <p><b>Daily Rate</b>: 2394.356009 WUSD</p>
            <p>
              <span className={style.FarmActivityA}>Active</span>
              <span className={style.VersionFarm}>Uni V3</span>
            </p>
            <p>
              <ItemLinkButton></ItemLinkButton> {/* Item - Contract Link */}
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

export default ExploreCollections
