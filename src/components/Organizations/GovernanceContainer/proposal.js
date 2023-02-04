import React, { useState, useEffect, Fragment } from 'react'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import Upshots from '../../Organizations/Upshots/index.js'
import RegularVoteBox from '../../Organizations/RegularVoteBox/index.js'
import LogoRenderer from "../../Global/LogoRenderer"
import ActionAWeb3Button from '../../Global/ActionAWeb3Button'
import ActionInfoSection from '../../Global/ActionInfoSection/index.js'
import VoteSelections from '../VoteSelections/index.js'

import { abi, useWeb3, useEthosContext, blockchainCall, fromDecimals, formatLink, web3Utils, sendAsync, isEthereumAddress, getNetworkElement } from '@ethereansos/interfaces-core'

import { surveyIsTerminable, terminateProposal, withdrawProposal, tokensToWithdraw, checkSurveyStatus } from '../../../logic/organization'
import { getRawField } from '../../../logic/generalReader'
import { proposeVote } from '../../../logic/delegation'

import Description from './description'

import style from '../../../all.module.css'
import OurCircularProgress from '../../Global/OurCircularProgress/index.js'
import RegularModal from '../../Global/RegularModal/index.js'

import ProposalMetadata from '../ProposalMetadata/index.js'
import BackButton from '../../Global/BackButton/index.js'
import { generateItemKey } from '../../../logic/ballot.js'
import { getLogs } from '../../../logic/logger.js'
import { decodePrestoOperations } from '../../../logic/covenants.js'
import { getAMMs, getAmmPoolLink } from '../../../logic/amm.js'

export default ({element, refreshElements, forDelegationVote}) => {

  const context = useEthosContext()

  const web3Data = useWeb3()

  const { newContract, block, account, web3, ipfsHttpClient, chainId } = web3Data

  const [value, setValue] = useState(null)
  const [accepts, setAccepts] = useState(null)
  const [refuses, setRefuses] = useState(null)

  const buyOrSell = element.name === 'Investment Fund Routine Buy' ? true : element.name === 'Investment Fund Routine Sell' ? false : null

  const [tokens, setTokens] = useState(null)
  const [tokenAMMs, setTokenAMMs] = useState(null)
  const [tokenPools, setTokenPools] = useState(null)
  const [open, setOpen] = useState(false)
  const [type, setType] = useState("accept")
  const [terminable, setTerminable] = useState(null)
  const [succeeding, setSucceeding] = useState(null)
  const [address, setAddress] = useState(null)

  const [proposalData, setProposalData] = useState(null)

  const [toWithdraw, setToWithdraw] = useState(null)

  const [status, setStatus] = useState(null)

  const [metadata, setMetadata] = useState()

  const [showWithdrawButtonAfterTermination, setShowWithdrawButtonAfterTermination] = useState()
  const [showProposeRetireVotesButtonAfterTermination, setShowProposeRetireVotesButtonAfterTermination] = useState()

  const [showProposeRetireVotesModal, setShowProposeRetireVotesModal] = useState()

  useEffect(() => {
    refreshGlobalData()
  }, [])

  useEffect(() => {
    if(proposalData === null) {
      return
    }
    setTimeout(async () => {
      setStatus(oldValue => ({
        ...oldValue,
        Pending : (!oldValue?.Executed && !oldValue?.Defeated) && succeeding === false && terminable === false && proposalData.terminationBlock === '0',
        Succeding : (!oldValue?.Executed && !oldValue?.Defeated) && succeeding === true && terminable === false && proposalData.terminationBlock === '0',
        Succed : (!oldValue?.Executed && !oldValue?.Defeated) && succeeding === true && (terminable === true || proposalData.terminationBlock !== '0'),
        Defeated : oldValue?.Defeated,
        Executed : oldValue?.Executed
      }))
      if(proposalData.terminationBlock !== '0' && (!status || (!status.Defeated && !status.Executed))){
        var logs = await getLogs(web3.currentProvider, 'eth_getLogs', {
          address : element.proposalsManager.options.address,
          topics : [
            web3Utils.sha3('ProposalTerminated(bytes32,bool,bytes)'),
            element.id
          ],
          fromBlock: web3Utils.toHex(getNetworkElement({ context, chainId }, 'deploySearchStart')) || "0x0",
          toBlock : 'latest'
        })
        if(logs.length > 0) {
          var log = logs[logs.length - 1]
          log = abi.decode(["bool", "bytes"], log.data)[0]
          setStatus({Defeated : !log, Executed : log})
          if(log && element.organization.type === 'delegation' && element.modelIndex === '4' && element.originalProposalData.vote) {
            var counterpart = element.sourceElement.subProposals.filter((it, i) => it.modelIndex === '4' && !it.originalProposalData.vote && it.originalProposalData.proposalsManagerAddress === element.originalProposalData.proposalsManagerAddress && it.originalProposalData.organizationProposalID === element.originalProposalData.organizationProposalID && i > it.sourceElement.subProposals.indexOf(element))
            if(counterpart.length === 0) {
              var originalProposalData = (await blockchainCall(element.originalProposalData.proposalsManager.methods.list, [element.originalProposalData.organizationProposalID]))[0]
              var stillToWithdraw = false;
              try {
                  var votingTokens = abi.decode(["address[]", "uint256[]", "uint256[]"], originalProposalData.votingTokens)
                  var itemKey = generateItemKey({
                    originalAddress : votingTokens[0][0],
                    originalObjectId : votingTokens[1][0].toString()
                  }, element.originalProposalData.organizationProposalID)
                  var votes = await blockchainCall(element.originalProposalData.proposalsManager.methods.votes, [element.originalProposalData.organizationProposalID], [element.organization.components.treasuryManager.address], [[itemKey]])
                  stillToWithdraw = votes.toWithdraw[0][0] !== '0'
              } catch(e) {
              }
              var originalProposalIsTerminable = originalProposalData.canTerminateAddresses.length === 0 ? false : await surveyIsTerminable({account, newContract, context}, element.originalProposalData, element.originalProposalData.organizationProposalID)
              setShowWithdrawButtonAfterTermination(stillToWithdraw && (originalProposalData.terminationBlock !== '0' || originalProposalIsTerminable))
              setShowProposeRetireVotesButtonAfterTermination(originalProposalData.terminationBlock === '0' && !originalProposalIsTerminable)
            }
          }
        }
      }
    })

    !metadata && setTimeout(async () => {
      var addM = {}
      try {
        if(!element.additionalMetadata) {
          var additionalUri = await getRawField({ provider : element.proposalsManager.currentProvider }, proposalData[1][0], 'additionalUri')
          additionalUri = abi.decode(["string"], additionalUri)[0]
          additionalUri = formatLink({ context }, additionalUri)
          addM = await (await fetch(additionalUri)).json()
        }
      } catch(e) {}
      if(!element.isSurveyless && !buyOrSell) {
        addM = {...element, ...element.metadata, ...element.additionalMetadata, ...addM}
      }
      setMetadata(addM)
    })

    buyOrSell !== null && !tokens && setTimeout(async () => {
      setTokenAMMs()
      var amms = await getAMMs({ context, ...web3Data })
      var t = [null, null, null, null]
      !buyOrSell && t.push(null)
      t = await Promise.all(t.map((_, i) => getRawField({ provider : web3.currentProvider}, proposalData[1][0], 'tokens(uint256)', i)))
      if(t[0] !== '0x') {
        t = t.map(it => abi.decode(["address"], it)[0].toString())
      } else {
        t = await getRawField({ provider : web3.currentProvider}, proposalData[1][0], 'operations')
        t = decodePrestoOperations(t)
        setTokenPools(t.map(it => it.liquidityPoolAddresses[0]))
        var tokenAMMS = t.map(it => amms.filter(amm => web3Utils.toChecksumAddress(amm.address) === web3Utils.toChecksumAddress(it.ammPlugin))[0])
        setTokenAMMs(tokenAMMS)
        t = t.map(it => buyOrSell ? it.swapPath[it.swapPath.length - 1] : it.inputTokenAddress)
      }
      setTokens(t)
    })
  }, [element, buyOrSell, proposalData, succeeding, terminable])

  useEffect(() => {
    open && refreshData()
  }, [open, block, account])

  useEffect(() => {
      if(!status || Object.values(status).filter(it => it).length > 0) {
        return
      }
      if(terminable === true && succeeding === false) {
        setStatus(oldValue => ({...oldValue, Defeated : true}))
      }
  }, [status, succeeding, terminable])

  async function refreshData() {
    await refreshGlobalData()
    var data = await tokensToWithdraw({account, web3, context, newContract}, element, element.proposalId)
    setToWithdraw(data.tw)
    setAccepts(data.accs)
    setRefuses(data.refs)
  }

  async function afterAction() {
    refreshData()
    setAddress(null)
  }

  async function refreshGlobalData() {
    try {
      setSucceeding(await checkSurveyStatus({account, newContract, context}, element, element.proposalId, "validators"))
    } catch(e) {}
    try {
      setTerminable(await surveyIsTerminable({account, newContract, context}, element, element.proposalId))
    } catch(e) {}
    setProposalData((await blockchainCall(element.proposalsManager.methods.list, [element.proposalId]))[0])
  }

  function withdrawAfterDelegationVoteOriginalProposalTermination() {
    return blockchainCall(element.originalProposalData.proposalsManager.methods.withdrawAll, [element.originalProposalData.organizationProposalID], element.organization.components.treasuryManager.address, true)
  }

  function proposeRetireVotesButtonAfterDelegationVoteOriginalProposalTermination() {
    setShowProposeRetireVotesModal(true)
  }

  return (
    <div className={style.Proposal}>
      {showProposeRetireVotesModal && <RegularModal close={() => setShowProposeRetireVotesModal()}>
        <ProposalMetadata {...{
          onSuccess() {
            setShowProposeRetireVotesModal()
            afterAction().then(refreshElements)
          },
          element,
          onClick() {
            return additionalMetadata => {
              var data = {
                ...element.originalProposalData,
                vote : false,
                afterTermination : false
              }
              data.proposalId = data.organizationProposalID
              data.value = data.accept === '0' ? data.refuse : data.accept
              data.accept = data.accept !== '0'

              return proposeVote({ context, ipfsHttpClient }, element, additionalMetadata, data)
            }
          }
        }}/>
      </RegularModal>}
      <div className={style.ProposalTitle}>
      {buyOrSell === null ? <>
        <h6>{element.name}</h6>
      </> : <>
      {tokens && <h6>
        New selection:
        {tokens.map((it, i) => <Fragment key={it}>
            <a>
              <LogoRenderer noFigure input={it}/>
            </a>
            {tokenAMMs && tokenPools && <>
              on
              <a target="_blank" href={getAmmPoolLink({context, ...web3Data}, tokenAMMs[i], tokenPools[i])}>
                <LogoRenderer noFigure input={tokenAMMs[i]}/>
              </a>
            </>}
        </Fragment>)}
        </h6>}
      </>}
        <div className={style.ProposalResult}>
          {(!status || Object.values(status).filter(it => it).length === 0) && <OurCircularProgress/>}
          {status?.Succeding && <p className={style.PendingTagGreen}>Succeding</p>}
          {status?.Pending && <p className={style.PendingTagBlue}>Pending</p>}
          {status?.Succed && <p className={style.PendingTagGreen}>Succed</p>}
          {status?.Executed && <p className={style.PendingTagGreen}>Executed</p>}
          {status?.Defeated && <p className={style.PendingTagRed}>Defeated</p>}
        </div>
      </div>
      <div className={style.ProposalVotesCount}>
      {(element.organization.type !== 'delegation' || element.delegationsManager) && <span>Votes: {fromDecimals(proposalData?.accept?.ethereansosAdd(proposalData.refuse), 18)}</span>}
        <RegularButtonDuo onClick={() => setOpen(!open)}>{open ? "Close" : "Open"}</RegularButtonDuo>
      </div>
      {open && <>
        <div className={style.ProposalOpen}>
          <Description description={metadata?.context} title="Context" className={style.DescriptionBig}/>
          <Description description={metadata?.summary} title="Summary" className={style.DescriptionBig}/>
          <Description description={metadata?.description} title="Description" className={style.DescriptionBig}/>
          <Description description={metadata?.motivations} title="Motivations" className={style.DescriptionBig}/>
          <Description description={metadata?.rationale} title="Rationale" className={style.DescriptionBig}/>
          <Description description={metadata?.specification} title="Specifications" className={style.DescriptionBig}/>
          <Description description={metadata?.risks} title="Risks" className={style.DescriptionBig}/>
          {(element.organization.type !== 'delegation' || element.delegationsManager) && <div className={style.Upshots}>
            <p>Upshot</p>
            <Upshots title="Yes" value={proposalData?.accept} total={proposalData?.accept?.ethereansosAdd(proposalData?.refuse)}/>
            <Upshots title="No" value={proposalData?.refuse} total={proposalData?.accept?.ethereansosAdd(proposalData?.refuse)}/>
          </div>}
          {!forDelegationVote && (terminable && proposalData?.terminationBlock === '0') && <ActionAWeb3Button onSuccess={() => afterAction().then(refreshElements)} onClick={() => terminateProposal({}, element, element.proposalId)}>Terminate</ActionAWeb3Button>}
          {!forDelegationVote && showWithdrawButtonAfterTermination && <ActionAWeb3Button onSuccess={() => afterAction().then(refreshElements)} onClick={() => withdrawAfterDelegationVoteOriginalProposalTermination()}>Withdraw</ActionAWeb3Button>}
          {!forDelegationVote && showProposeRetireVotesButtonAfterTermination && element.organization.host === account && <ActionAWeb3Button onSuccess={() => afterAction().then(refreshElements)} onClick={() => proposeRetireVotesButtonAfterDelegationVoteOriginalProposalTermination()}>Cancel Vote</ActionAWeb3Button>}
          <div className={style.Vote}>
            {!terminable && proposalData?.terminationBlock === '0' && <>
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
                    proposalId : element.proposalId,
                    forDelegationVote
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
                    proposalId : element.proposalId,
                    forDelegationVote
                }}/>
                {(value || (toWithdraw && toWithdraw.length > 0)) && <div className={style.Options}>
                  <ActionInfoSection hideAmmStuff settings={address !== null} onSettingsToggle={settings => setAddress(settings ? '' : null)}/>
                </div>}
                {value && <RegularVoteBox
                  element={element}
                  address={address}
                  proposalId={element.proposalId}
                  forRefuse={value === 'No'}
                  refresh={afterAction}
                />}
              </div>
            </>}
          </div>
          {address !== null && <div className={style.OptionOpen}>
            <label>
              <p>Owner:</p>
              <input type="text" value={address} onChange={e => setAddress(e.currentTarget.value)}/>
            </label>
          </div>}
          {!forDelegationVote && toWithdraw && toWithdraw.length > 0 && toWithdraw.filter(it => it.value !== '0').map(it => <div key={it.address} className={style.RegularVoteBoxStaked}>
            <p>{it.prettifiedValue} - {it.value} {it.symbol} staked</p>
            <ActionAWeb3Button type="ExtraSmall" onSuccess={afterAction} onClick={() => withdrawProposal({account}, element, it.proposalId, address, proposalData?.terminationBlock !== '0' || terminable)}>Withdraw</ActionAWeb3Button>
          </div>)}
        </div>
      </>}
    </div>
  )
}