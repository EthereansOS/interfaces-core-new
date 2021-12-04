import React from 'react'

import style from '../../../all.module.css'
import LogoRenderer from '../../Global/LogoRenderer'

const ExploreDelegations = ({element}) => {
  return (
    <div className={style.OrgAllSingle}>
     <div className={style.OrgSingle}>
        <LogoRenderer input={element} />
        <div className={style.OrgTitleEx}>
          <h6>{element.name}</h6>
          
        </div>
     </div>
   </div>
  )
}

export default ExploreDelegations