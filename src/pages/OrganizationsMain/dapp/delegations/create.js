import React, {useMemo} from 'react'

import { useWeb3 } from '@ethereansos/interfaces-core'
import {allFactories} from '../../../../logic/factoryOfFactories'

const DelegationsCreate = ({}) => {

  const { getGlobalContract, chainId } = useWeb3()

  const factoryOfFactories = useMemo(() => getGlobalContract("factoryOfFactories"), [chainId])

  return (
    <div>
    </div>
  )
}

DelegationsCreate.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/organizations/dapp/delegations/create',
        Component: DelegationsCreate,
        exact: true,
        requireConnection: true,
        templateProps: {
          menuName: 'appMenu',
          isDapp: true,
        },
      })
    }

export default DelegationsCreate