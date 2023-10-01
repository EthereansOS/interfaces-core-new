import React, { useState } from 'react'

import TokenInputRegular from '../../Global/TokenInputRegular'
import ActionAWeb3Button from '../../Global/ActionAWeb3Button'
import { blockchainCall, useWeb3, abi, sendAsync, web3Utils } from 'interfaces-core'

import style from '../../../all.module.css'

export default ({ item, wrapper }) => {

  const { account } = useWeb3()

  const [element, setElement] = useState(null)

  async function onClick() {
    if(!element) {
      throw "Element"
    }
    if(!element?.value || element?.value === '0') {
      throw 'Value must be greater than 0'
    }

    var source = await blockchainCall(wrapper.methods.source, item.id)
    var data = '0x'

    if((typeof source) === 'string') {
      data = abi.encode(["address", "address"], [source, account])
    } else {
      data = abi.encode(["address", "uint256", "address", "bytes", "bool", "bool"], [source[0], source[1], account, "0x", false, false])
    }

    return await blockchainCall(wrapper.methods.burn, account, item.id, element.value, data)
  }

  return (
    <div className={style.UnwrapBoxItem}>
      <p>Unwrap {item?.wrapType === 'ERC20' ? item.symbol.substring(1) : item.symbol}</p>
      <TokenInputRegular tokens={[item]} selected={element?.token} balance={element?.balance} value={element?.value} onElement={(token, balance, value) => setElement({token, balance, value})}/>
      <ActionAWeb3Button onClick={onClick}>Unwrap</ActionAWeb3Button>
    </div>
  )
}