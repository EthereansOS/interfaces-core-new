import React, { useState, useEffect } from 'react'

import { useWeb3, VOID_BYTES32, VOID_ETHEREUM_ADDRESS, blockchainCall, fromDecimals } from '@ethereansos/interfaces-core'

import TokenInputRegular from '../../Global/TokenInputRegular/index.js'
import ActionAWeb3Buttons from '../../Global/ActionAWeb3Buttons/index.js'
import ActionAWeb3Button from '../../Global/ActionAWeb3Button'

import { vote, createPresetProposals, withdrawProposal } from '../../../logic/organization'
import { generateItemKey } from '../../../logic/ballot'

import style from './regular-vote-box.module.css'

const RegularVoteBox = ({element, proposal, proposalId, printedValue}) => {
  const { account, block } = useWeb3()
  const [tokenData, setTokenData] = useState(null)

  const [permitSignature, setPermitSignature] = useState(null)

  const [address, setAddress] = useState(null)

  const [accepts, setAccepts] = useState(null)
  const [refuses, setRefuses] = useState(null)
  const [toWithdraw, setToWithdraw] = useState(null)

  useEffect(() => {
    if(!proposal || !proposalId) {
      return
    }
    async function ask() {
      var tk = proposal.organization.proposalsConfiguration.votingTokens
      var itemKeys = tk.map(it => generateItemKey(it, proposalId))
      var x = await blockchainCall(proposal.proposalsManager.contract.methods.votes, [proposalId], [account], [itemKeys])
      var tw = tk.map((it, i) => ({
        address: it.address,
        symbol : it.symbol,
        value : fromDecimals(x[2][i], it.decimals, true),
        accept : fromDecimals(x[0][i], it.decimals, true),
        refuse : fromDecimals(x[1][i], it.decimals, true)
      }))
      setToWithdraw(tw)
    }
    ask()
  }, [proposalId, block])

  async function onTokenData(token, balance, value) {
    setTokenData({token, balance, value})
  }

  if(proposal && proposal.isPreset && proposal.presetProposals.indexOf(VOID_BYTES32) === 0) {
    return <ActionAWeb3Button onClick={() => createPresetProposals({}, proposal)}>Create</ActionAWeb3Button>
  }

  return (
   <>
    <div className={style.RegularVoteBoxQuantity}>
      <TokenInputRegular onElement={onTokenData} tokens={element?.proposalsConfiguration.votingTokens}/>
    </div>
    <div>
      {tokenData && tokenData.token && <ActionAWeb3Buttons
        token={tokenData.token}
        other={proposal.proposalsManager.address}
        balance={tokenData.balance}
        value={tokenData.value}
        buttonText={"Vote"}
        onPermitSignature={setPermitSignature}
        onClick={() => vote({account}, proposal, tokenData.token, tokenData.value, 0, proposalId, permitSignature, address)}/>}
    </div>
    {toWithdraw && toWithdraw.length > 0 && toWithdraw.filter(it => it.value !== '0').map(it => <div key={it.address} className={style.RegularVoteBoxStaked}>
      <p>{printedValue} - {it.value} {it.symbol} staked</p>
      <ActionAWeb3Button type="ExtraSmall" onClick={() => withdrawProposal({account}, proposal, proposalId)}>Withdraw</ActionAWeb3Button>
    </div>)}
   </>
  )
}

export default RegularVoteBox
