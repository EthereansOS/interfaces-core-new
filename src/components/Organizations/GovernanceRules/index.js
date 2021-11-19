import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './governance-rules.module.css'



const GovernanceRules = (props) => {
  return (
    
            <div className={style.Rule}>
              <p><b>Quorum</b><br></br>2,000</p>
            </div>
  )
}

export default GovernanceRules
