import React, { useState, useEffect } from 'react'

import Description from '../../Organizations/GovernanceContainer/description'
import { Link } from 'react-router-dom'
import LogoRenderer from '../../Global/LogoRenderer'

import { useWeb3, useEthosContext } from 'interfaces-core'

import { tryRetrieveDelegationAddressFromItem } from '../../../logic/delegation.js'

import style from '../../../all.module.css'

export default ({item}) => {

  const context = useEthosContext()

  const { chainId, dualChainId } = useWeb3()

  const [delegation, setDelegation] = useState()

  useEffect(() => !dualChainId && tryRetrieveDelegationAddressFromItem({ context, chainId }, item).then(setDelegation), [dualChainId])

  return (
    <div className={style.ViewDescriptionL}>
      {delegation &&
      <div className={style.SpecialDesc}>
        <h4>Delegation Item</h4>
        <div className={style.OrgAllSingle}>
          <Link className={style.OrgSingle} to={`/guilds/delegations/${delegation.address}`}>
            <LogoRenderer input={delegation}/>
            <div className={style.OrgTitleEx}>
              <h6>{delegation.name}</h6>
            </div>
          </Link>
        </div>
      </div>}
      <Description description={item.description}/>
    </div>
  )
}