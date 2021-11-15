import React, {useEffect, useState} from 'react'

import { useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'
import {allDelegations} from '../../../../logic/delegation'
import { CircularProgress } from '@ethereansos/interfaces-ui'

const DelegationsList = ({}) => {

  const context = useEthosContext()
  const {getGlobalContract, newContract, chainId} = useWeb3()

  const [delegations, setDelegations] = useState(null)

  useEffect(() => {
    setDelegations(null)
    allDelegations({context, getGlobalContract, newContract, chainId, factoryOfFactories : getGlobalContract('factoryOfFactories')}).then(setDelegations)
  }, [chainId])

  return delegations === null ? <CircularProgress/> : (
    <ul>
      {delegations.map(it => <li key={it.options.address}><a target="_blank" href={`https://rinkeby.etherscan.io/address/${it.options.address}`}>{it.options.address}</a></li>)}
    </ul>
  )
}

DelegationsList.menuVoice = {
  label : 'Delegations',
  path : '/organizations/dapp',
  subMenuLabel : 'All',
  contextualRequire : () => require.context('./', false, /.js$/),
  index : 0
}

export default DelegationsList