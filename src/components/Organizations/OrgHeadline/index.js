import React from 'react'

import LogoRenderer from '../../Global/LogoRenderer'

import style from './org-headline.module.css'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'

const OrgHeadline = ({element}) => {
  return (

   <div className={style.OrgHeadline}>
      <figure>
        <LogoRenderer input={element}/>
      </figure>
      <div className={style.OrgTitle}>
        <h6>{element.name}</h6>
        {element.description && <p ref={ref => ref && (ref.innerHTML = element.description)}/>}
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
