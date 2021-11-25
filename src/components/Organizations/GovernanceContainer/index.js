import React, { useState, useEffect } from 'react'

import Left from './left'
import Head from './head'
import Right from './right'
import NewProposal from './new-proposal'
import { CircularProgress } from '@ethereansos/interfaces-ui'

import { formatLink, useEthosContext } from '@ethereansos/interfaces-core'

import style from './governance-container.module.css'

var SingleProposal = ({element, proposal}) => {
  const [metadata, setMetadata] = useState(null)

  const context = useEthosContext()

  useEffect(() => {
    setMetadata(null)
    var uri = formatLink({context}, proposal.uri)
    fetch(uri).then(it => it.json()).then(setMetadata)
  }, [proposal])

  if(!metadata) {
    return <><br/><br/><br/><CircularProgress/></>
  }

  return (
    <div className={style.GovCard}>
      <Head element={proposal.organization} proposal={proposal} metadata={metadata}/>
        <div className={style.GovCardOpened}>
          <Left element={proposal.organization} proposal={proposal} metadata={metadata}/>
          <Right element={proposal.organization} proposal={proposal} metadata={metadata}/>
        </div>
    </div>
  )
}

export default ({element}) => {
  return element.allProposals.map(it => (
    <SingleProposal key={it.proposalId} element={element} proposal={it}/>
  ))
}
