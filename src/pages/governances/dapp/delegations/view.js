import React, { useEffect, useState } from 'react'

import DelegationHeadline from '../../../../components/Organizations/DelegationHeadline'
import CircularProgress from '../../../../components/Global/OurCircularProgress'
import GovernanceContainer from '../../../../components/Organizations/GovernanceContainer'
import DelegationAttach from '../../../../components/Organizations/DelegationAttach'

import { useLocation } from 'react-router'
import { Link } from 'react-router-dom'

import { getDelegation } from '../../../../logic/delegation'

import { useWeb3, useEthosContext, web3Utils } from 'interfaces-core'

import HostOptions from './hostOptions'

import style from '../../../../all.module.css'

import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'

const DelegationView = () => {
  const [element, setElement] = useState(null)

  const { pathname } = useLocation()
  const web3Data = useWeb3()
  const { account } = web3Data

  const context = useEthosContext()

  useEffect(() => {
    refresh()
  }, [pathname])

  function refresh() {
    setElement(null)
    var delegationAddress = pathname.split('/')
    delegationAddress = delegationAddress[delegationAddress.length - 1]
    try {
      getDelegation(
        { ...web3Data, context },
        web3Utils.toChecksumAddress(delegationAddress)
      ).then(setElement)
    } catch (e) {}
  }

  if (!element) {
    return <CircularProgress />
  }

  return (
    <div className={style.SingleContentPage}>
      <ScrollToTopOnMount />

      <DelegationHeadline element={element} onMetadata={setElement} />
      {!element?.host && (
        <>
          <h4>This Delegation must be finalized</h4>
          {element.deployer === account && (
            <p>
              <br />
              <Link to={`/organizations/create/delegation/${element.address}`}>
                <h5>Finalize Delegation</h5>
              </Link>
            </p>
          )}
        </>
      )}
      {element?.host === account && (
        <HostOptions refresh={refresh} element={element} />
      )}
      {element?.host && <GovernanceContainer element={element} />}
      {element?.host && <DelegationAttach element={element} />}
    </div>
  )
}

DelegationView.menuVoice = {
  path: '/organizations/delegations/:id',
}

export default DelegationView
