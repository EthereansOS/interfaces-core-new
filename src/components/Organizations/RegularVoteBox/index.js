import React, { useState, useEffect } from 'react'

import { useWeb3, blockchainCall, fromDecimals } from '@ethereansos/interfaces-core'

import TokenInputRegular from '../../Global/TokenInputRegular/index.js'
import ActionAWeb3Buttons from '../../Global/ActionAWeb3Buttons/index.js'

import { vote } from '../../../logic/organization'
import { generateItemKey } from '../../../logic/ballot'

import style from '../../../all.module.css'

const RegularVoteBox = ({element, proposal, proposalId, address, forRefuse, refresh}) => {
  const { account, block } = useWeb3()
  const [tokenData, setTokenData] = useState(null)

  const [permitSignature, setPermitSignature] = useState(null)

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
  }, [proposalId, block, account])

  async function onTokenData(token, balance, value) {
    setTokenData({token, balance, value})
  }

  async function onClick() {
    await vote({account}, proposal, tokenData.token, forRefuse ? 0 : tokenData.value, forRefuse ? tokenData.value : 0, proposalId, permitSignature, address)
    refresh && refresh()
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
        onClick={onClick}/>}
    </div>
   </>
  )
}

export default RegularVoteBox
