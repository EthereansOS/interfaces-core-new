import React, { useState } from 'react'

import TokenInputRegular from '../../../Global/TokenInputRegular'
import { getNetworkElement, useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'
import RegularModal from '../../../Global/RegularModal'
import ActionAWeb3Buttons from '../../../Global/ActionAWeb3Buttons'
import { wrapNFT } from '../../../../logic/itemsV2'

const WrapSuccess = ({success}) => {

  const context = useEthosContext()

  const { chainId } = useWeb3()

  return (<div>
      <h4>Operation Completed</h4>
      <a target="_blank" href={`${getNetworkElement({chainId, context}, "etherscanURL")}/tx/${success.transactionHash}`}>Transaction</a>
    </div>)
}

export default ({nftType, token}) => {

  const type = nftType || 'ERC1155'

  const { getGlobalContract, account } = useWeb3()
  const [data, setData] = useState(token ? {token} : null)
  const [success, setSuccess] = useState(null)

  const wrapper = getGlobalContract(`${type[0].toLowerCase() + type.substring(1)}Wrapper`)

  async function onElement(token, balance, value) {
    setData({token, balance : type.indexOf("721") !== -1 ? token?.id || '1' : balance, value : type.indexOf("721") !== -1 ? token?.id || '1' : value})
  }

  return (
    <div>
      <p>Wrap {token ? token.symbol : `${type.split('ERC').join('ERC-')} Tokens into Items`}</p>
      {success && <RegularModal close={() => setSuccess(null)}>
          <WrapSuccess success={success}/>
        </RegularModal>}
      <TokenInputRegular tokenOnly={type.indexOf("721") !== -1} selected={data?.token} tokens={token ? [token] : undefined} onElement={onElement} onlySelections={[type.split('ERC').join('ERC-')]}/>
      {data && data.token && <ActionAWeb3Buttons noApproveNeeded={type.indexOf("721") === -1} onSuccess={setSuccess} token={data.token} other={wrapper} balance={data.balance} value={data.value} buttonText="Wrap" onClick={() => wrapNFT({ account }, data.token, data.balance, data.value, wrapper, type)}/>}
    </div>
  )
}