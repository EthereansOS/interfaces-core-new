import React, { useState } from 'react'

import TokenInputRegular from '../../../Global/TokenInputRegular'
import { getNetworkElement, useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'
import RegularModal from '../../../Global/RegularModal'
import ActionAWeb3Buttons from '../../../Global/ActionAWeb3Buttons'
import { wrapERC20 } from '../../../../logic/itemsV2'

const WrapSuccess = ({success}) => {

  const context = useEthosContext()

  const { chainId } = useWeb3()

  return (<div>
      <h4>Operation Completed</h4>
      <a target="_blank" href={`${getNetworkElement({chainId, context}, "etherscanURL")}/tx/${success.transactionHash}`}>Transaction</a>
    </div>)
}

export default ({token, onSuccess}) => {

  const { web3, getGlobalContract } = useWeb3()
  const [data, setData] = useState(null)
  const [success, setSuccess] = useState(null)

  const w20 = getGlobalContract('eRC20Wrapper')

  async function onElement(token, balance, value) {
    setData({token, balance, value})
  }

  return (
    <div>
      <p>Wrap {token ? token.symbol : 'ERC-20 Tokens into Items'}</p>
      {success && <RegularModal close={() => setSuccess(null)}>
          <WrapSuccess success={success}/>
        </RegularModal>}
      <TokenInputRegular selected={data?.token} tokens={token ? [token] : undefined} onElement={onElement} onlySelections={['ERC-20', 'Items V1']}/>
      {data && data.token && <ActionAWeb3Buttons onSuccess={transaction => void(setSuccess(transaction), onSuccess && onSuccess())} token={data.token} other={w20} balance={data.balance} value={data.value} buttonText="Wrap" onClick={() => wrapERC20({web3}, data.token, data.balance, data.value, w20)}/>}
    </div>
  )
}