import React, {useEffect, useState} from 'react'

import { useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'
import {all} from '../../../../logic/organization'
import { CircularProgress } from '@ethereansos/interfaces-ui'
import ExploreOrganizations from '../../../../components/Organizations/ExploreOrganizations'

import style from '../organizations-main-sections.module.css'

const SubDAOsList = ({}) => {

  const context = useEthosContext()
  const {getGlobalContract, newContract, chainId} = useWeb3()

  const [elements, setElements] = useState(null)

  useEffect(() => {
    setElements(null)
    all({context, getGlobalContract, newContract, chainId, factoryOfFactories : getGlobalContract('factoryOfFactories')}).then(setElements)
  }, [chainId])

  return (<div className={style.OrganizationsExploreMain}>
    {elements === null ? <CircularProgress/>
    : <ExploreOrganizations elements={elements} type='organizations'/>}
  </div>)
}

SubDAOsList.menuVoice = {
  label : 'Organizations',
  path : '/organizations/dapp',
  contextualRequire : () => require.context('./', false, /.js$/),
  index : 0
}

export default SubDAOsList