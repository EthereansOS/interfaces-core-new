import React, { useState, useEffect } from 'react'

import Left from './left'
import Head from './head'
import Right from './right'
import NewProposal from './new-proposal'
import { CircularProgress } from '@ethereansos/interfaces-ui'

import { useWeb3, useEthosContext } from '@ethereansos/interfaces-core'

import style from '../../../all.module.css'

import { retrieveAllProposals, retrieveProposalModelMetadata } from '../../../logic/organization'
import Web3DependantList from '../../Global/Web3DependantList'

var SingleProposal = ({element}) => {
  const [metadata, setMetadata] = useState(null)
  const [opened, setOpened] = useState(false)

  const context = useEthosContext()

  useEffect(() => {
    setMetadata(null)
    retrieveProposalModelMetadata({context}, element).then(setMetadata)
  }, [element])

  if(!metadata) {
    return <><br/><br/><br/><CircularProgress/></>
  }

  return (
    <div className={style.GovCard}>
      <Head element={element.organization} proposal={element} metadata={metadata} onToggle={setOpened}/>
        {opened && <div className={style.GovCardOpened}>
          <Left element={element.organization} proposal={element} metadata={metadata}/>
          <Right element={element.organization} proposal={element} metadata={metadata}/>
        </div>}
    </div>
  )
}

export default ({element}) => {

  return <Web3DependantList
    Renderer={SingleProposal}
    provider={() => retrieveAllProposals({}, element)}
  />
}