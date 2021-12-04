import React, { useState, useEffect } from 'react'

import Left from './left'
import Head from './head'
import Right from './right'

import { useWeb3, useEthosContext } from '@ethereansos/interfaces-core'

import style from '../../../all.module.css'

import { retrieveAllProposals, retrieveProposalModelMetadata } from '../../../logic/organization'
import Web3DependantList from '../../Global/Web3DependantList'

var SingleProposal = ({element, refreshElements}) => {
  const [opened, setOpened] = useState(false)

  return (
    <div className={style.GovCard}>
      <Head element={element} onToggle={setOpened} refreshElements={refreshElements}/>
        {opened && <div className={style.GovCardOpened}>
          <Left element={element} refreshElements={refreshElements}/>
          <Right element={element} refreshElements={refreshElements}/>
        </div>}
    </div>
  )
}

export default ({element}) => {

  const context = useEthosContext()

  return <Web3DependantList
    Renderer={SingleProposal}
    provider={() => retrieveAllProposals({context}, element)}
  />
}