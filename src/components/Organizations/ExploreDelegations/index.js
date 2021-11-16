import React from 'react'

import style from './explore-delegations.module.css'
import LogoRenderer from '../../Global/LogoRenderer'

const ExploreDelegations = ({element}) => {
  return (
    <div className={style.OrgAllSingle}>
     <div className={style.OrgSingle}>
        <figure>
          <LogoRenderer input={element} />
        </figure>
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
     </div>
   </div>
  )
}

export default ExploreDelegations