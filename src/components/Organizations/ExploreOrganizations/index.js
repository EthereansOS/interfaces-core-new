import React from 'react'

import { Link } from 'react-router-dom'
import LogoRenderer from '../../Global/LogoRenderer'

import style from '../../../all.module.css'

const ExploreOrganizations = ({elements}) => {
  return (
    <div className={style.OrgAllSingle}>
      {elements.map(element => (
        <Link key={element.address} className={style.OrgSingle} to={`/guilds/${element.type}/${element.address}`}>
          <LogoRenderer input={element}/>
          <div className={style.OrgTitleEx}>
            <h6>{element.name}</h6>
          </div>
       </Link>))}
    </div>
  )
}

export default ExploreOrganizations
