import React, { useState } from 'react'
import style from '../../../../all.module.css'
import TokenInputRegular from '../../../Global/TokenInputRegular'
import { getNetworkElement, useEthosContext, useWeb3, VOID_ETHEREUM_ADDRESS } from 'interfaces-core'
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
        <div className={style.CreationPageLabel}>
          <div className={style.FancyExplanationCreate}>
              <h2>Wrap ERC-20 Tokens into Items</h2>
          </div>
          <label className={style.CreationPageLabelF}>
              {false && success && <RegularModal close={() => setSuccess(null)}>
                <WrapSuccess success={success}/>
              </RegularModal>}
              <TokenInputRegular selected={data?.token} tokens={token ? [token] : undefined} onElement={onElement} onlySelections={['ERC-20', 'Items V1']}/>
              {data && data.token && <ActionAWeb3Buttons onSuccess={transaction => void(setSuccess(transaction), onSuccess && onSuccess())} token={data.token} other={w20} balance={data.balance} value={data.value} buttonText="Wrap" noApproveNeeded={data.token.address === VOID_ETHEREUM_ADDRESS} onClick={() => wrapERC20({web3}, data.token, data.balance, data.value, w20)}/>}
          </label>
        </div>
     </div>
  )
}