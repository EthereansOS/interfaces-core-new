import React from 'react'

import LogoRenderer from '../../Global/LogoRenderer'

import style from '../../../all.module.css'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import Description from '../GovernanceContainer/description'

const OrgHeadline = ({element}) => {
  return (

   <div className={style.OrgHeadline}>
      <LogoRenderer input={element}/>
      <div className={style.OrgTitle}>
        <h6>{element.name}</h6>
        <Description description={element.description}/>
      </div>
      <div className={style.OrgLinks}>
       <ExtLinkButton/>
       <ExtLinkButton/>
       <ExtLinkButton/>
       <ExtLinkButton/>
      </div>

      <div className={style.OrgHeadlineSide}>
        <p><b>Created:</b> <a>32542555</a> <b>Core:</b>v. <a>1.0</a></p>
      </div>
    </div>
  )
}

export default OrgHeadline
