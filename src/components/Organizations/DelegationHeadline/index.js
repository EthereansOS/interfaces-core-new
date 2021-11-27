import React from 'react'

import LogoRenderer from '../../Global/LogoRenderer'

import style from '../../../all.module.css'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'

const DelegationHeadline = ({element}) => {
  return (
    <div className={style.DelegationHeadlineCardUPD}>
      <div className={style.DelegationMainThingsCardD}>
          <LogoRenderer input={element}/>
          <div className={style.DelLinks}>
            <h6>{element.name}</h6>
            <ExtLinkButton></ExtLinkButton>
            <ExtLinkButton></ExtLinkButton>
          </div>
          <div className={style.DelegationHeadlineCardSideD}>
            <p><b>Created:</b> <a>32542555</a> <b>Core:</b>v. <a>1.0</a></p>
          </div>
      </div>
        <div className={style.ViewDescriptionD}>
        <p>Welcome to the Buidlerberg Event 2020! Tucked away deep inside the Ethereum network, a community of researchers study and experiment with DFO technology. They are developing the first genuinely on-chain organizations of the future, together with taking on the task of buidling a genuinely decentralized dApp ecosystem. All researchers are invited to share their projects at the first-ever Buidlerberg meeting. more info:</p>
      </div>
      <div className={style.DelegationMainThingsCardMainInfoD}>
        <p><b>Type</b><br></br>Poll</p>
        <p><b>Grants</b><br></br>10</p>
        <p><b>Tot Funds</b><br></br>250 ETH</p>
        <p><b>Host</b><br></br><a>0x04fh93r2gf</a></p>
      </div>
    </div>
  )
}

export default DelegationHeadline
