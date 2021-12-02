import React, { useState, useEffect } from 'react'

import VoteSelections from '../../Organizations/VoteSelections/index.js'
import RegularVoteBox from '../../Organizations/RegularVoteBox/index.js'
import ActionAWeb3Button from '../../Global/ActionAWeb3Button'
import ActionInfoSection from '../../Global/ActionInfoSection/index.js'

import { useWeb3, VOID_BYTES32, VOID_ETHEREUM_ADDRESS, blockchainCall, fromDecimals, useEthosContext } from '@ethereansos/interfaces-core'
import { createPresetProposals, withdrawProposal } from '../../../logic/organization'
import { extractProposalVotingTokens, generateItemKey } from '../../../logic/ballot'
import Description from './description.js'

import style from '../../../all.module.css'

const MultiVoteBox = ({element, refreshElements}) => {

    const context = useEthosContext()
    const {block, account, web3, newContract} = useWeb3()

    const [value, setValue] = useState()

    const [address, setAddress] = useState(null)

    const [accepts, setAccepts] = useState(null)
    const [refuses, setRefuses] = useState(null)
    const [toWithdraw, setToWithdraw] = useState(null)

    async function refreshData() {
      var proposalIds = element.subProposals.map(it => it.proposalId)
      var tokens = []
      var itemKeys = []
      var accounts = element.subProposals.map(() => account)
      var l = await blockchainCall(element.proposalsManager.methods.list, proposalIds)
      for(var i in element.subProposals) {
        var subProposal = element.subProposals[i]
        var tks = subProposal?.proposalsConfiguration?.votingTokens || await extractProposalVotingTokens({account, web3, context, newContract}, l[i], subProposal.proposalId)
        tokens.push(tks)
        itemKeys.push(tks.map(it => generateItemKey(it, subProposal.proposalId)))
      }
      var x = await blockchainCall(element.proposalsManager.methods.votes, proposalIds, accounts, itemKeys)
      var tw = []
      var accs = l.map(it => fromDecimals(it.accept, 18, true))
      var refs = l.map(it => fromDecimals(it.refuse, 18, true))
      x[0].forEach((it, i) => {
        var values = x[2][i]
        var accepts = x[0][i]
        var refuses = x[1][i]
        var id = proposalIds[i]
        var prettifiedValue = element.subProposals[i].label
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
      setAccepts(accs)
      setRefuses(refs)
      setToWithdraw(tw)
      if((!tw || tw.length === 0) && !value) {
        setAddress(null)
      }
    }

    useEffect(() => {
      refreshData()
    }, [element, block, account])

    return (
      <div className={style.MultiVoteBox}>
        <div className={style.VoteList}>
        {element.presetProposals.filter(it => it !== VOID_BYTES32).length === 0
            ? <ActionAWeb3Button onSuccess={refreshElements} onClick={() => createPresetProposals({}, element)}>Initialize</ActionAWeb3Button>
            : <>
              {element.subProposals.map((it, i) => <VoteSelections
                key={it.proposalId}
                {...{
                  checked: value === it.proposalId,
                  onSelect : setValue,
                  discriminator : 'surveyless_' + it.proposalId,
                  element : it,
                  value : it.proposalId,
                  label : it.label,
                  votes : accepts && accepts[i],
                  proposalId : it.proposalId
                }}/>)}
              {(value || (toWithdraw && toWithdraw.length > 0)) && <div className={style.Options}>
                <ActionInfoSection hideAmmStuff onSettingsToggle={settings => setAddress(settings ? '' : null)}/>
              </div>}
              {value && <RegularVoteBox
                element={element}
                address={address}
                proposalId={value}
                refresh={refreshData}
                />}
              {address !== null &&
                <div className={style.OptionOpen}>
                  <label>
                    <p>Owner:</p>
                    <input type="text" value={address} onChange={e => setAddress(e.currentTarget.value)}/>
                  </label>
                </div>}
              {toWithdraw && toWithdraw.length > 0 && toWithdraw.filter(it => it.value !== '0').map(it => <div key={it.address} className={style.RegularVoteBoxStaked}>
                <p>{it.prettifiedValue} - {it.value} {it.symbol} staked</p>
                <ActionAWeb3Button type="ExtraSmall" onSuccess={refreshData} onClick={() => withdrawProposal({account}, element, it.proposalId, address, false)}>Withdraw</ActionAWeb3Button>
              </div>)}
          </>}
        </div>
      </div>
    )
  }

var SurveyLess = ({element, refreshElements}) => {
  return (<>
      <Description description={element.description} title="Summary" className={style.DescriptionBig}/>
      <Description description={element.rationale} title="Rationale and Motivations" className={style.DescriptionBig}/>
      <Description description={element.specification} title="Specification" className={style.DescriptionBig}/>
      <Description description={element.risks} title="Risks" className={style.DescriptionBig}/>
      <MultiVoteBox element={element, refreshElements}/>
  </>)
}

export default SurveyLess