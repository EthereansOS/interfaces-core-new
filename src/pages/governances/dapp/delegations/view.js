import React, { useEffect, useState } from 'react'

import DelegationHeadline from '../../../../components/Organizations/DelegationHeadline'
import { CircularProgress } from '@ethereansos/interfaces-ui'
import GovernanceContainer from '../../../../components/Organizations/GovernanceContainer'

import { useLocation } from 'react-router'

import { getDelegation } from '../../../../logic/delegation'

import { useWeb3, useEthosContext } from '@ethereansos/interfaces-core'

import style from '../organizations-main-sections.module.css'


const DelegationView = (props) => {

  const [element, setElement] = useState(null)

  const { pathname } = useLocation()
  const { newContract } = useWeb3()

  const context = useEthosContext()

  useEffect(() => {
    setElement(null)
    var delegationAddress = pathname.split('/')
    delegationAddress = delegationAddress[delegationAddress.length - 1]
    getDelegation({ context, newContract }, delegationAddress).then(setElement)
  }, [pathname])

  if(!element) {
    return <CircularProgress/>
  }

  return (
    <>
      <div className={style.SingleContentPage}>
        <DelegationHeadline element={element}/>
        {<GovernanceContainer element={element}/>}
      </div>
    </>
  )
}

DelegationView.menuVoice = {
  path : '/governances/dapp/delegations/:id'
}

export default DelegationView
