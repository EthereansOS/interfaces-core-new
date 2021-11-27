import React from 'react'

import style from '../../../all.module.css'

const DelegationMainThingsCard = () => {
  return (
    <div className={style.DelegationMainThingsCard}>
      <div className={style.ViewDescription}>
        <p>Welcome to the Buidlerberg Event 2020! Tucked away deep inside the Ethereum network, a community of researchers study and experiment with DFO technology. They are developing the first genuinely on-chain organizations of the future, together with taking on the task of buidling a genuinely decentralized dApp ecosystem. All researchers are invited to share their projects at the first-ever Buidlerberg meeting. more info:</p>
      </div>
      <div className={style.DelegationMainThingsCardMainInfo}>
        <p><b>Type</b><br></br>Poll</p>
        <p><b>Tot Funds</b><br></br>250 ETH</p>
        <p><b>Host</b><br></br><a>0x04fh93r2gf</a></p>
      </div>
    </div>
  )
}

export default DelegationMainThingsCard
