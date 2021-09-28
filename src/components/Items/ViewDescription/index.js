import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './view-description.module.css'

const ViewDescription = (props) => {
  return (
    <div className={style.ViewDescription}>
      <p>Welcome to the Buidlerberg Event 2020! Tucked away deep inside the Ethereum network, a community of researchers study and experiment with DFO technology. They are developing the first genuinely on-chain organizations of the future, together with taking on the task of buidling a genuinely decentralized dApp ecosystem. All researchers are invited to share their projects at the first-ever Buidlerberg meeting. more info:</p>
    </div>
  )
}

export default ViewDescription
