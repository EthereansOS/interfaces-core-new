import React, { useState, useEffect } from 'react'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import Upshots from '../../Organizations/Upshots/index.js'
import RegularVoteBox from '../../Organizations/RegularVoteBox/index.js'
import LogoRenderer from "../../Global/LogoRenderer"
import ActionAWeb3Button from '../../Global/ActionAWeb3Button'
import ActionInfoSection from '../../Global/ActionInfoSection/index.js'

import { useWeb3, useEthosContext, blockchainCall, fromDecimals } from '@ethereansos/interfaces-core'

import { surveyIsTerminable, terminateProposal, withdrawProposal, tokensToWithdraw } from '../../../logic/organization.js'

import style from './governance-container.module.css'

export default ({element, proposal, metadata, checkAll}) => {

  const context = useEthosContext()

  const { newContract, block, account } = useWeb3()

  const buyOrSell = metadata.name === 'Investment Fund Routine Buy' ? true : metadata.name === 'Investment Fund Routine Sell' ? false : null

  const [tokens, setTokens] = useState(null)
  const [open, setOpen] = useState(false)
  const [type, setType] = useState("accept")
  const [terminable, setTerminable] = useState(false)
  const [address, setAddress] = useState(null)

  const [toWithdraw, setToWithdraw] = useState(null)

  useEffect(() => {
    if(buyOrSell === null) {
      return
    }
    setTimeout(async () => {
      var contract = newContract(context[buyOrSell ? "ChangeInvestmentsManagerFourTokensFromETHListABI" : "ChangeInvestmentsManagerFiveTokensToETHListABI"], element[1][0])
      var t = [null, null, null, null]
      !buyOrSell && t.push(null)
      t = await Promise.all(t.map((_, i) => blockchainCall(contract.methods.tokens, i)))
      setTokens(t)
    })
  }, [buyOrSell])

  useEffect(() => {
    setTimeout(async () => {
      setToWithdraw(await tokensToWithdraw({account}, element, element.id))
      setTerminable(await surveyIsTerminable({account, newContract, context}, element, element.id))
    })
  }, [block, proposal, account])

  return (
    <div className={style.Proposal}>
      <div className={style.ProposalTitle}>
      {buyOrSell === null ? <>
        <h6>{metadata.name}</h6>
      </> : <>
      {tokens && <h6>
        New selection:
        {tokens.map(it => <a key={it}><LogoRenderer noFigure input={it}/></a>)}
        </h6>}
      </>}
        <ExtLinkButton/>
        <ExtLinkButton/>
        <div className={style.ProposalResult}>
        {/*
          <p className={style.PendingTagGreen}>Succeding</p>
          <p className={style.PendingTagBlue}>Pending</p>
          <p className={style.PendingTagGreen}>Succed</p>
          <p className={style.PendingTagGreen}>Executed</p>
          <p className={style.PendingTagRed}>Defeated</p>
          */}
        </div>
      </div>
      <div className={style.ProposalVotesCount}>
        <span>Votes: {fromDecimals(element.accept.ethereansosAdd(element.refuse), 18)}</span>
        <RegularButtonDuo onClick={() => setOpen(!open)}>{open ? "Close" : "Open"}</RegularButtonDuo>
      </div>
      {open && <>
        <div className={style.ProposalOpen}>
          <h6>Summary</h6>
          <p className={style.DescriptionSmall}>Welcome to the Buidlerberg Event 2020! Tucked away deep inside the Ethereum network, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology.</p>
          <h6>Rationale and motivations</h6>
          <p className={style.DescriptionSmall}>Welcome to the Buidlerberg Event 2020! Tucked away deep inside the Ethereum network, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology.</p>
          <h6>Specification</h6>
          <p className={style.DescriptionSmall}>Welcome to the Buidlerberg Event 2020! Tucked away deep inside the Ethereum network, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology.</p>
          <h6>Risks</h6>
          <p className={style.DescriptionSmall}>Welcome to the Buidlerberg Event 2020! Tucked away deep inside the Ethereum network, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology.</p>
          <div className={style.Upshots}>
            <p>Upshot</p>
            <Upshots title="Yes" value={element.accept} total={element.accept.ethereansosAdd(element.refuse)}/>
            <Upshots title="No" value={element.refuse} total={element.accept.ethereansosAdd(element.refuse)}/>
          </div>
          <ActionInfoSection hideAmmStuff onSettingsToggle={settings => setAddress(settings ? '' : null)}/>
          {terminable && <ActionAWeb3Button onClick={() => terminateProposal({}, element, element.id).then(checkAll)}>Terminate</ActionAWeb3Button>}
          {!terminable && <div className={style.Vote}>
            <p><b>Choose from:</b></p>
            <div className={style.VoteList}>
              <label>
                Yes:
                <input type='radio' name={`${element.id}_accept`} checked={type === 'accept'} onClick={() => setType("accept")}/>
              </label>
              <label>
                No:
                <input type='radio' name={`${element.id}_refuse`} checked={type === 'refuse'} onClick={() => setType("refuse")}/>
              </label>
              <RegularVoteBox proposalId={element.id} element={proposal.organization} forRefuse={type === 'refuse'} proposal={{...proposal, ...element}} metadata={metadata}/>
            </div>
          </div>}
          {address !== null &&
                <div>
                  <label>
                    Address:
                    <input type="text" value={address} onChange={e => setAddress(e.currentTarget.value)}/>
                  </label>
                </div>
              }
              {toWithdraw && toWithdraw.length > 0 && toWithdraw.filter(it => it.value !== '0').map(it => <div key={it.address} className={style.RegularVoteBoxStaked}>
                <p>{it.prettifiedValue} - {it.value} {it.symbol} staked</p>
                <ActionAWeb3Button type="ExtraSmall" onClick={() => withdrawProposal({account}, proposal, it.proposalId, address, false)}>Withdraw</ActionAWeb3Button>
              </div>)}
        </div>
      </>}
    </div>
  )
}