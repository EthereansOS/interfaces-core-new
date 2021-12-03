import React from 'react'

import style from '../../../all.module.css'
import LogoRenderer from '../../Global/LogoRenderer'

const OrgThingsCardTokens = ({title, elements}) => {
  return (
    <div className={style.OrgThingsCardPics}>
      <div className={style.OrgThingsRegularTitle}>
        <h6>{title}</h6>
      </div>
      <div className={style.OrgThingsRegularInfoPictureCarousel}>
        {elements.map(it => <a key={it.address}>
          <LogoRenderer input={it}/>
        </a>)}
      </div>
    </div>
  )
}

export default OrgThingsCardTokens
