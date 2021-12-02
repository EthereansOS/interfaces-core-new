import React, { useState, useEffect } from 'react'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import Upshots from '../../Organizations/Upshots/index.js'
import RegularVoteBox from '../../Organizations/RegularVoteBox/index.js'
import LogoRenderer from "../../Global/LogoRenderer"
import ActionAWeb3Button from '../../Global/ActionAWeb3Button'
import ActionInfoSection from '../../Global/ActionInfoSection/index.js'
import VoteSelections from '../VoteSelections/index.js'

import { useWeb3, useEthosContext, blockchainCall, fromDecimals } from '@ethereansos/interfaces-core'

import { surveyIsTerminable, terminateProposal, withdrawProposal, tokensToWithdraw } from '../../../logic/organization.js'

import Description from './description'

import style from '../../../all.module.css'

export default ({element, refreshElements}) => {

  const context = useEthosContext()

  const { newContract, block, account, web3 } = useWeb3()

  const [value, setValue] = useState(null)
  const [accepts, setAccepts] = useState(null)
  const [refuses, setRefuses] = useState(null)

  const buyOrSell = element.name === 'Investment Fund Routine Buy' ? true : element.name === 'Investment Fund Routine Sell' ? false : null

  const [tokens, setTokens] = useState(null)
  const [open, setOpen] = useState(false)
  const [type, setType] = useState("accept")
  const [terminable, setTerminable] = useState(false)
  const [address, setAddress] = useState(null)

  const [proposalData, setProposalData] = useState(null)

  const [toWithdraw, setToWithdraw] = useState(null)

  useEffect(() => {
    if(buyOrSell === null || proposalData === null) {
      return
    }
    setTimeout(async () => {
      var contract = newContract(context[buyOrSell ? "ChangeInvestmentsManagerFourTokensFromETHListABI" : "ChangeInvestmentsManagerFiveTokensToETHListABI"], proposalData[1][0])
      var t = [null, null, null, null]
      !buyOrSell && t.push(null)
      t = await Promise.all(t.map((_, i) => blockchainCall(contract.methods.tokens, i)))
      setTokens(t)
    })
  }, [element, buyOrSell, proposalData])

  useEffect(() => {
    refreshData()
  }, [block, element, account])

  async function refreshData() {
    var data = await tokensToWithdraw({account, web3, context, newContract}, element, element.proposalId)
    setToWithdraw(data.tw)
    setAccepts(data.accs)
    setRefuses(data.refs)
    setTerminable(await surveyIsTerminable({account, newContract, context}, element, element.proposalId))
    setProposalData((await blockchainCall(element.proposalsManager.methods.list, [element.proposalId]))[0])
  }

  return (
    <div className={style.Proposal}>
      <div className={style.ProposalTitle}>
      {buyOrSell === null ? <>
        <h6>{element.name}</h6>
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
        <span>Votes: {fromDecimals(proposalData?.accept?.ethereansosAdd(proposalData.refuse), 18)}</span>
        <RegularButtonDuo onClick={() => setOpen(!open)}>{open ? "Close" : "Open"}</RegularButtonDuo>
      </div>
      {open && <>
        <div className={style.ProposalOpen}>
        <Description description={element.summary} title="Summary" className={style.DescriptionBig}/>
        <Description description={element.rationale} title="Rationale and Motivations" className={style.DescriptionBig}/>
        <Description description={element.specification} title="Specification" className={style.DescriptionBig}/>
        <Description description={element.risks} title="Risks" className={style.DescriptionBig}/>
        <div className={style.Upshots}>
            <p>Upshot</p>
            <Upshots title="Yes" value={proposalData?.accept} total={proposalData?.accept?.ethereansosAdd(proposalData?.refuse)}/>
            <Upshots title="No" value={proposalData?.refuse} total={proposalData?.accept?.ethereansosAdd(proposalData?.refuse)}/>
          </div>
          {terminable && <ActionAWeb3Button onSuccess={() => refreshData().then(refreshElements)} onClick={() => terminateProposal({}, element, element.proposalId)}>Terminate</ActionAWeb3Button>}
          <div className={style.Vote}>
            {proposalData?.terminationBlock === '0' && (terminable ? <></> : <>
            <p><b>Choose from:</b></p>
            <div className={style.VoteList}>
              <VoteSelections
                {...{
                  checked: value === "Yes",
                  onSelect : setValue,
                  discriminator : 'survey_' + element.proposalId,
                  element,
                  value : "Yes",
                  label : "Yes",
                  votes : accepts && accepts[0],
                  proposalId : element.proposalId
                }}/>
                <VoteSelections
                {...{
                  checked: value === "No",
                  onSelect : setValue,
                  discriminator : 'survey_' + element.proposalId,
                  element,
                  value : "No",
                  label : "No",
                  votes : refuses && refuses[0],
                  proposalId : element.proposalId
                }}/>
              {(value || (toWithdraw && toWithdraw.length > 0)) && <div className={style.Options}>
                <ActionInfoSection hideAmmStuff onSettingsToggle={settings => setAddress(settings ? '' : null)}/>
              </div>}
              {value && <RegularVoteBox
                element={element}
                address={address}
                proposalId={element.proposalId}
                forRefuse={value === 'No'}
                refresh={refreshData}
                />}
            </div>
          </>)}
          </div>
          {address !== null && <div className={style.OptionOpen}>
            <label>
              <p>Owner:</p>
              <input type="text" value={address} onChange={e => setAddress(e.currentTarget.value)}/>
            </label>
          </div>}
          {toWithdraw && toWithdraw.length > 0 && toWithdraw.filter(it => it.value !== '0').map(it => <div key={it.address} className={style.RegularVoteBoxStaked}>
            <p>{it.prettifiedValue} - {it.value} {it.symbol} staked</p>
            <ActionAWeb3Button type="ExtraSmall" onSuccess={refreshData} onClick={() => withdrawProposal({account}, element, it.proposalId, address, proposalData?.terminationBlock !== '0')}>Withdraw</ActionAWeb3Button>
          </div>)}
        </div>
      </>}
    </div>
  )
}