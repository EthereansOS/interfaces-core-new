import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './explore-organizations.module.css'

const ExploreOrganizations = (props) => {
  return (
    <div className={style.OrgAllSingle}>
      {/*Single Item Start*/}
     <div className={style.OrgSingle}>
        <figure>
          <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
        </figure>
        <div className={style.OrgTitle}>
          <h6>BojackSwap DAO</h6>
          <div className={style.OrgTitleAside}>
            
          </div>
        </div>
        <div className={style.ItemInfo}>
          <div className={style.ItemInfoSide}>
            <p>Supply:</p>
            <p>1,000,000</p>
          </div>
          <div className={style.ItemInfoSide2}>
            <p>Price:</p>
            <p>$13</p>
          </div>
        </div>
     </div>
     {/*Single Item End*/}
    
     </div>
  )
}

export default ExploreOrganizations
