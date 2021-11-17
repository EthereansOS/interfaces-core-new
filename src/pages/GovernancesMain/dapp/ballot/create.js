import React, {useState} from 'react'

import { abi, useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'
import {create} from '../../../../logic/ballot'

const BallotCreate = () => {

    const context = useEthosContext()
    const {getGlobalContract, newContract, chainId, ipfsHttpClient, web3} = useWeb3()

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [duration, setDuration] = useState(300)
    const [organization, setOrganization] = useState("")
    const [type, setType] = useState("string")

    const [v1, setV1] = useState("")
    const [v2, setV2] = useState("")
    const [v3, setV3] = useState("")
    const [v4, setV4] = useState("")

    const [votingToken, setVotingToken] = useState("")
    const [tokenId, setTokenId] = useState("")
    const [weight, setWeight] = useState("")

    async function deploy() {
        try {
          var values = [v1, v2, v3, v4].map(it => abi.encode([type], [it]))
          await create({
            context, newContract, chainId, ipfsHttpClient, ballotMaker : getGlobalContract('ballotMaker')
          }, {
            name : name || "",
            description : description || "",
            valueType : type,
            plainValues : [v1, v2, v3, v4]
          },
          duration, values, votingToken, tokenId, weight)
        } catch(e) {
          alert(e.message || e)
        }
      }


    return (
        <div>
            <h2>Create Ballot</h2>
            <br/>
            Name: <input type="text" value={name} onChange={e => setName(e.currentTarget.value)}/>
            <br/>
            Description: <input type="text" value={description} onChange={e => setDescription(e.currentTarget.value)}/>
            <br/>
            Duration: <input type="number" value={duration} onChange={e => setDuration(parseInt(e.currentTarget.value))}/>
            <br/>
            Attach to: <input type="text" value={organization} onChange={e => setOrganization(e.currentTarget.value)}/>
            <br/>
            <div>
              Type
              <select value={type} onChange={e => setType(e.currentTarget.value)}>
                <option value="string">string</option>
                <option value="bool">bool</option>
                <option value="uint256">uint256</option>
              </select>
            </div>
            <div>
              Values
              <input type="text" value={v1} onChange={e => setV1(e.currentTarget.value)}/>
              <input type="text" value={v2} onChange={e => setV2(e.currentTarget.value)}/>
              <input type="text" value={v3} onChange={e => setV3(e.currentTarget.value)}/>
              <input type="text" value={v4} onChange={e => setV4(e.currentTarget.value)}/>
            </div>

            Voting Token
            <input type="text" value={votingToken} onChange={e => setVotingToken(e.currentTarget.value)}/>

            Object Id
            <input type="text" value={tokenId} onChange={e => setTokenId(e.currentTarget.value)}/>

            Weight
            <input type="text" value={weight} onChange={e => setWeight(e.currentTarget.value)}/>

            <a href="javascript:;" onClick={deploy}>Deploy</a>
        </div>
    )
}

BallotCreate.menuVoice = {
  label : 'Create',
  path : '/governances/dapp/ballots/create',
  index : 4
}

export default BallotCreate