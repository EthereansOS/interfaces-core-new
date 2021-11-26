import React, { useState, useEffect } from 'react'

import Left from './left'
import Head from './head'
import Right from './right'
import NewProposal from './new-proposal'
import { CircularProgress } from '@ethereansos/interfaces-ui'

import { formatLink, useEthosContext } from '@ethereansos/interfaces-core'

import style from './governance-container.module.css'

import { retrieveProposalModelMetadata } from '../../../logic/organization'

var SingleProposal = ({element, proposal}) => {
  const [metadata, setMetadata] = useState(null)
  const [opened, setOpened] = useState(false)

  const context = useEthosContext()

  useEffect(() => {
    setMetadata(null)
    retrieveProposalModelMetadata({context}, proposal).then(setMetadata)
  }, [proposal])

  if(!metadata) {
    return <><br/><br/><br/><CircularProgress/></>
  }

  return (
    <div className={style.GovCard}>
      <Head element={proposal.organization} proposal={proposal} metadata={metadata} onToggle={setOpened}/>
        {opened && <div className={style.GovCardOpened}>
          <Left element={proposal.organization} proposal={proposal} metadata={metadata}/>
          <Right element={proposal.organization} proposal={proposal} metadata={metadata}/>
        </div>}
    </div>
  )
}

export default ({element}) => {
  return element.allProposals.map(it => (
    <SingleProposal key={it.proposalId} element={element} proposal={it}/>
  ))
}
