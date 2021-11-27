import React, { useState, useEffect } from 'react'

import VoteSelections from '../../Organizations/VoteSelections/index.js'
import RegularVoteBox from '../../Organizations/RegularVoteBox/index.js'
import ActionAWeb3Button from '../../Global/ActionAWeb3Button'
import ActionInfoSection from '../../Global/ActionInfoSection/index.js'

import { useWeb3, VOID_BYTES32, VOID_ETHEREUM_ADDRESS, blockchainCall, fromDecimals } from '@ethereansos/interfaces-core'
import { createPresetProposals, withdrawProposal } from '../../../logic/organization'
import { generateItemKey } from '../../../logic/ballot'

import style from '../../../all.module.css'

const MultiVoteBox = ({element, proposal, metadata}) => {

    const {block, account} = useWeb3()

    const [value, setValue] = useState(proposal.currentValue)

    const [address, setAddress] = useState(null)

    const [accepts, setAccepts] = useState(null)
    const [refuses, setRefuses] = useState(null)
    const [toWithdraw, setToWithdraw] = useState(null)

    function onSelect(val, printedVal) {
      setValue(val)
    }

    var proposalId;

    try {
      proposalId = proposal.presetProposals[proposal.presetValues.indexOf(value)]
    } catch(e) {}

    useEffect(() => {
      if(!proposal) {
        return
      }
      async function ask() {
        var tk = proposal.organization.proposalsConfiguration.votingTokens
        var proposalIds = proposal.presetProposals.filter(it => it !== VOID_BYTES32)
        var tokens = proposalIds.map(() => tk)
        var itemKeys = proposalIds.map(proposalId => tk.map(it => generateItemKey(it, proposalId)))
        var accounts = proposalIds.map(() => account)
        var x = await blockchainCall(proposal.proposalsManager.contract.methods.votes, proposalIds, accounts, itemKeys)
        var tw = []
        x[0].forEach((it, i) => {
          var values = x[2][i]
          var accepts = x[0][i]
          var refuses = x[1][i]
          var id = proposalIds[i]
          var prettifiedValue = metadata.prettifiedValues[proposal.presetProposals.indexOf(id)]
          var tokensArray = tokens[i]

          for(var z in tokensArray) {
            var token = tokensArray[z]
            var value = fromDecimals(values[z], token.decimals, true)
            if(value == 0) {
              return
            }
            tw.push({
              proposalId : id,
              prettifiedValue,
              accept : fromDecimals(accepts, token.decimals, true),
              refuse : fromDecimals(refuses, token.decimals, true),
              value,
              address : token.address,
              symbol : token.symbol
            })
          }
        })
        setToWithdraw(tw)
      }
      ask()
    }, [proposalId, block, account])

    return (
      <div className={style.MultiVoteBox}>
        <div className={style.VoteList}>
          {proposal && proposal.isPreset && proposal.presetProposals.indexOf(VOID_BYTES32) === 0
            ? <ActionAWeb3Button onClick={() => createPresetProposals({}, proposal)}>Initialize</ActionAWeb3Button>
            : <>
              {proposal.presetValues.map(it => <VoteSelections
                key={it}
                {...{
                  checked: value === it,
                  onSelect,
                  discriminator : 'surveyless_' + proposal.index,
                  element,
                  proposal,
                  metadata,
                  value : it,
                  decimals : 18,
                  isPercentage : true
                }}/>)}
              <div className={style.Options}>
                <ActionInfoSection hideAmmStuff onSettingsToggle={settings => setAddress(settings ? '' : null)}/>
              </div>
              {value && <RegularVoteBox {...{element, proposal, metadata, proposalId}}/>}
              {address !== null &&
                <div className={style.OptionOpen}>
                  <label>
                    <p>Owner:</p>
                    <input type="text" value={address} onChange={e => setAddress(e.currentTarget.value)}/>
                  </label>
                </div>
              }
              {toWithdraw && toWithdraw.length > 0 && toWithdraw.filter(it => it.value !== '0').map(it => <div key={it.address} className={style.RegularVoteBoxStaked}>
                <p>{it.prettifiedValue} - {it.value} {it.symbol} staked</p>
                <ActionAWeb3Button type="ExtraSmall" onClick={() => withdrawProposal({account}, proposal, it.proposalId, address, false)}>Withdraw</ActionAWeb3Button>
              </div>)}
          </>}
        </div>
      </div>
    )
  }

var SurveyLess = ({element, proposal, metadata}) => {
    return (<>
        {metadata.summary && <>
            <h6>Summary</h6>
            <p className={style.DescriptionBig}>Welcome to the Buidlerberg Event 2020! Tucked away deep inside the Ethereum network, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology.</p>
          </>}
          {metadata.rationale && <>
            <h6>Rationale and Motivations</h6>
            <p className={style.DescriptionBig}>Welcome to the Buidlerberg Event 2020! Tucked away deep inside the Ethereum network, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology.</p>
          </>}
          {metadata.specification && <>
            <h6>Specification</h6>
            <p className={style.DescriptionBig}>Welcome to the Buidlerberg Event 2020! Tucked away deep inside the Ethereum network, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology.</p>
          </>}
          {metadata.risks && <>
            <h6>Risks</h6>
            <p className={style.DescriptionBig}/>
          </>}
          <MultiVoteBox {...{element, proposal, metadata}}/>
    </>)
}

export default SurveyLess