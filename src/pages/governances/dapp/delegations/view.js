import React, { useEffect, useState } from 'react'

import DelegationHeadline from '../../../../components/Organizations/DelegationHeadline'
import CircularProgress from '../../../../components/Global/OurCircularProgress'
import GovernanceContainer from '../../../../components/Organizations/GovernanceContainer'
import DelegationAttach from '../../../../components/Organizations/DelegationAttach'

import { useLocation } from 'react-router'
import { Link } from 'react-router-dom'

import { getDelegation } from '../../../../logic/delegation'

import { useWeb3, useEthosContext, web3Utils } from '@ethereansos/interfaces-core'

import HostOptions from './hostOptions'

import style from '../../../../all.module.css'

const DelegationView = () => {

  const [element, setElement] = useState(null)

  const { pathname } = useLocation()
  const { newContract, account } = useWeb3()

  const context = useEthosContext()

  useEffect(() => {
    refresh()
  }, [pathname])

  function refresh() {
    setElement(null)
    var delegationAddress = pathname.split('/')
    delegationAddress = delegationAddress[delegationAddress.length - 1]
    try {
      getDelegation({ context, newContract }, web3Utils.toChecksumAddress(delegationAddress)).then(setElement)
    } catch(e) {}
  }

  if(!element) {
    return <CircularProgress/>
  }

  return (
    <div className={style.SingleContentPage}>
      <DelegationHeadline element={element}/>
      {!element?.host && <>
        <h4>This Delegation must be finalized</h4>
        {element.deployer === account && <Link to={`/guilds/create/${element.address}`}>Finalize Delegation</Link>}
      </>}
      {element?.host === account && <HostOptions refresh={refresh} element={element}/>}
      {element?.host && <GovernanceContainer element={element}/>}
      {element?.host && <DelegationAttach element={element}/>}
    </div>
  )
}

DelegationView.menuVoice = {
  path : '/guilds/delegations/:id'
}

export default DelegationView
