import React, { useState, useEffect } from 'react'

import { useWeb3 } from '@ethereansos/interfaces-core'

import TokenInputRegular from '../../Global/TokenInputRegular/index.js'
import ActionAWeb3Buttons from '../../Global/ActionAWeb3Buttons/index.js'

import { vote } from '../../../logic/organization'

import style from '../../../all.module.css'

const RegularVoteBox = ({element, proposalId, address, forRefuse, refresh}) => {
  const { account } = useWeb3()
  const [tokenData, setTokenData] = useState(null)

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
        other={element.proposalsManager.address}
        balance={tokenData.balance}
        value={tokenData.value}
        buttonText={"Vote"}
        onPermitSignature={setPermitSignature}
        onClick={() => vote({account}, element, tokenData.token, forRefuse ? 0 : tokenData.value, forRefuse ? tokenData.value : 0, proposalId, permitSignature, address)}
        onSuccess={refresh}/>}
    </div>
   </>
  )
}

export default RegularVoteBox
