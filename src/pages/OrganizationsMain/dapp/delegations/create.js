import React, {useState} from 'react'

import { useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'
import {create} from '../../../../logic/delegation'

const DelegationsCreate = ({}) => {

  const context = useEthosContext()
  const {getGlobalContract, newContract, chainId, ipfsHttpClient} = useWeb3()

  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("")
  const [description, setDescription] = useState("")
  const [organization, setOrganization] = useState("")

  async function deploy() {
    await create({
      context, newContract, chainId, ipfsHttpClient, factoryOfFactories : getGlobalContract("factoryOfFactories")
    }, {
      name : name || "",
      symbol : symbol || "",
      description : description || ""
    })
  }

  return (
    <div>
      Name: <input type="text" value={name} onChange={e => setName(e.currentTarget.value)}/>
      <br/>
      Symbol: <input type="text" value={symbol} onChange={e => setSymbol(e.currentTarget.value)}/>
      <br/>
      Description: <input type="text" value={description} onChange={e => setDescription(e.currentTarget.value)}/>
      <br/>
      Attach to: <input type="text" value={organization} onChange={e => setOrganization(e.currentTarget.value)}/>
      <br/>
      <a href="javascript:;" onClick={deploy}>Deploy</a>
    </div>
  )
}

DelegationsCreate.menuVoice = {
  label : 'Create',
  path : '/organizations/dapp/delegations/create',
}

export default DelegationsCreate