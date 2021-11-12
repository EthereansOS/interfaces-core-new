import React, { useState } from 'react'

import TokenInputRegular from '../../../../../components/Global/TokenInputRegular'
import { blockchainCall, useWeb3, VOID_ETHEREUM_ADDRESS } from '@ethereansos/interfaces-core'
import ActionAWeb3Buttons from '../../../../../components/Global/ActionAWeb3Buttons'

export default () => {

  const { web3, getGlobalContract } = useWeb3()
  const [data, setData] = useState(null)

  const w20 = getGlobalContract('eRC20Wrapper')

  async function onElement(token, balance, value) {
    setData({token, balance, value})
  }

  async function onClick() {
    var items = [{
      header : {
        host : VOID_ETHEREUM_ADDRESS,
        name : "",
        symbol : "",
        uri : ""
      },
      collectionId : web3.eth.abi.encodeParameter("address", data.token.address),
      id : "0",
      accounts : [],
      amounts : [data.value]
    }]
    await blockchainCall(w20.methods.mintItemsWithPermit, items, [], {value : data.token.address === VOID_ETHEREUM_ADDRESS ? data.value : '0'})
  }

  return (
    <div>
      <TokenInputRegular onElement={onElement}/>
      {data && data.token && <ActionAWeb3Buttons token={data.token} other={w20} balance={data.balance} value={data.value} buttonText={"Mint"} onClick={onClick}/>}
    </div>
  )
}