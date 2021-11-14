import React, { useState } from 'react'

import TokenInputRegular from '../../../../../components/Global/TokenInputRegular'
import { useWeb3 } from '@ethereansos/interfaces-core'
import ActionAWeb3Buttons from '../../../../../components/Global/ActionAWeb3Buttons'
import { wrapERC20 } from '../../../../../logic/itemsV2' 


export default () => {

  const { web3, getGlobalContract } = useWeb3()
  const [data, setData] = useState(null)

  const w20 = getGlobalContract('eRC20Wrapper')

  async function onElement(token, balance, value) {
    setData({token, balance, value})
  }

  return (
    <div>
      <TokenInputRegular onElement={onElement}/>
      {data && data.token && <ActionAWeb3Buttons token={data.token} other={w20} balance={data.balance} value={data.value} buttonText={"Mint"} onClick={() => wrapERC20({web3}, data.token, data.balance, data.value, w20)}/>}
    </div>
  )
}