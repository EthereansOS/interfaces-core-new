import React, { useState, useMemo } from 'react'

import { useWeb3, abi, VOID_ETHEREUM_ADDRESS } from 'interfaces-core'

import TokenInputRegular from '../../Global/TokenInputRegular/index.js'
import ActionAWeb3Buttons from '../../Global/ActionAWeb3Buttons/index.js'

import { vote } from '../../../logic/organization'

import style from '../../../all.module.css'

const RegularVoteBox = ({element, proposalId, address, forRefuse, refresh}) => {
  const { account } = useWeb3()
  const [tokenData, setTokenData] = useState(null)

  const noApproveNeeded = useMemo(() => {
    if(element.votingTokens) {
      var tokens = abi.decode(["address[]", "uint256[]", "uint256[]"], element.votingTokens)
      return tokens[0][0] !== VOID_ETHEREUM_ADDRESS
    } else {
      return element.proposalsConfiguration.collections[0] !== VOID_ETHEREUM_ADDRESS
    }
  }, [element.votingTokens, element.proposalsConfiguration])

  const [permitSignature, setPermitSignature] = useState(null)

  async function onTokenData(token, balance, value) {
    setTokenData({token, balance, value})
  }

  return (
   <>
    <div className={style.RegularVoteBoxQuantity}>
      <TokenInputRegular onElement={onTokenData} tokens={element?.proposalsConfiguration.votingTokens}/>
    </div>
    <div>
      {tokenData && tokenData.token && <ActionAWeb3Buttons
        token={tokenData.token}
        other={element.proposalsManager.address || element.proposalsManager.options.address}
        balance={tokenData.balance}
        value={tokenData.value}
        noApproveNeeded={noApproveNeeded}
        buttonText={"Vote"}
        onPermitSignature={setPermitSignature}
        onClick={() => vote({account}, element, tokenData.token, forRefuse ? 0 : tokenData.value, forRefuse ? tokenData.value : 0, proposalId, permitSignature, address)}
        onSuccess={refresh}/>}
    </div>
   </>
  )
}

export default RegularVoteBox
