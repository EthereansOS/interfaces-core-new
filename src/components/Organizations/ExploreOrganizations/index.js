import React from 'react'

import { Link } from 'react-router-dom'
import LogoRenderer from '../../Global/LogoRenderer'

import style from '../../../all.module.css'

const ExploreOrganizations = ({elements}) => {
  return (
    <div className={style.OrgAllSingle}>
      {elements.map(element => (
        <Link key={element.address} className={style.OrgSingle} to={`/governances/dapp/${element.type}/${element.address}`}>
          <LogoRenderer input={element}/>
          <div className={style.OrgTitle}>
            <h6>{element.name}</h6>
            <div className={style.OrgTitleAside}>
              <p>Functions:</p>
              <p>26</p>
            </div>
            <div className={style.OrgTitleAsideB}>
              <p>Governance:</p>
              <p>10</p>
            </div>
          </div>
       </Link>))}
    </div>
  )
}

export default ExploreOrganizations
