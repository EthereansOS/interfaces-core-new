import React, { useEffect, useState } from 'react'

import { CircularProgress } from '@ethereansos/interfaces-ui'
import { useWeb3, fromDecimals, blockchainCall, useEthosContext, abi } from '@ethereansos/interfaces-core'

import style from '../../../all.module.css'

const GovernanceRules = ({proposal}) => {

  const context = useEthosContext()

  const { newContract } = useWeb3()

  const [name, setName] = useState(null)
  const [value, setValue] = useState(null)

  useEffect(() => {
    setTimeout(async () => {
      /*var contract = newContract(context.ValidateQuorumByPercentageABI, proposal.validatorsAddresses[0])
      var val = await blockchainCall(contract.methods.value)
      var tokenIndex = await blockchainCall(contract.methods.tokenIndex)
      val = abi.decode(["uint256"], val)[0].toString()
      val =*/
    })
  }, [])

  if(!value) {
    return <CircularProgress/>
  }

  return (
    <div className={style.Rule}>
      <p><b>Quorum</b><br></br>2,000</p>
    </div>
  )
}

export default GovernanceRules
