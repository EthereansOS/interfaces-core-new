import React, { useState, useEffect } from 'react'

import Left from './left'
import Head from './head'
import Right from './right'

import { useWeb3, useEthosContext } from 'interfaces-core'

import style from '../../../all.module.css'

import { retrieveAllProposals, retrieveProposalModelMetadata } from '../../../logic/organization'
import { refreshProposals, refreshWrappedToken } from '../../../logic/delegation'
import Web3DependantList from '../../Global/Web3DependantList'

var SingleProposal = ({element, refreshElements, forDelegationVote}) => {

  const context = useEthosContext()
  const useWeb3Data = useWeb3()

  const [updatedElement, setUpdatedElement] = useState(element)

  const [opened, setOpened] = useState(false)

  useEffect(refreshDelegation, [opened])

  function refreshDelegation() {
    if(element.organization.type !== 'delegation') {
      return
    }
    updatedElement.delegationsManager && !updatedElement.delegationsManagerwrappedToken && refreshWrappedToken({ context, ...useWeb3Data }, updatedElement).then(result => setUpdatedElement(oldValue => ({...oldValue, delegationsManager: result.delegationsManager})))
    !opened && setUpdatedElement(it => ({...it, proposalIds : undefined, subProposals : undefined}))
    opened && refreshProposals({ context, ...useWeb3Data }, updatedElement).then(result => setUpdatedElement(oldValue => ({...oldValue, proposalIds : result.proposalIds, subProposals : result.subProposals})))
  }

  function realRefreshElements() {
    refreshDelegation()
    refreshElements && refreshElements()
  }

  return (
    <div className={style[element.className || "GovCard"]}>
      <Head element={updatedElement} onToggle={setOpened} refreshElements={realRefreshElements} forDelegationVote={forDelegationVote}/>
        {opened && <div className={style.GovCardOpened}>
          <Left element={updatedElement} refreshElements={realRefreshElements} forDelegationVote={forDelegationVote}/>
          <Right element={updatedElement} refreshElements={realRefreshElements} forDelegationVote={forDelegationVote}/>
        </div>}
    </div>
  )
}

export default ({element, forDelegationVote}) => {

  const context = useEthosContext()

  const { web3, account, chainId, getGlobalContract, newContract } = useWeb3()

  const [list, setList] = useState()

  const [discriminant, setDiscriminant] = useState(new Date().getTime())

  function refreshElements() {
    setDiscriminant(new Date().getTime())
  }

  return <Web3DependantList
    Renderer={SingleProposal}
    renderedProperties={{forDelegationVote, refreshElements}}
    provider={() => list || retrieveAllProposals({ context, web3, account, chainId, getGlobalContract, newContract }, element).then(l => {
      forDelegationVote && setList(l)
      return l
    })}
    emptyMessage=""
    discriminant={discriminant}
    filter={element => element.organization?.type === 'delegation' || element.organization?.old || element.label === 'FIXED_INFLATION_V1' || element.label === 'DELEGATIONS_MANAGER_INSURANCE_V1'}
  />
}