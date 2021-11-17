import React, {useState} from 'react'

import { useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'
import {create} from '../../../../logic/delegation'

const Data = ({onData}) => {

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [tick, setTick] = useState("")
  const [logo, setLogo] = useState("")

  function next() {
    onData({
      name,
      description,
      tick,
      logo
    })
  }

  return (
    <div>
      <br/>
      Name: <input type="text" value={name} onChange={e => setName(e.currentTarget.value)}/>
      <br/>
      Description: <input type="text" value={description} onChange={e => setDescription(e.currentTarget.value)}/>
      <br/>
      Tick: <input type="text" value={tick} onChange={e => setTick(e.currentTarget.value)}/>
      <br/>
      Logo: <input type="text" value={logo} onChange={e => setLogo(e.currentTarget.value)}/>
      <a onClick={next}>Next</a>
    </div>
  )
}

const ChooseType = ({back, onType}) => {
  return (
    <div>
      <a onClick={back}>Back</a>
      <a onClick={() => onType("poll")}>Poll</a>
      <a onClick={() => onType("governance")}>Governance</a>
    </div>
  )
}

const Governance = ({back, onGovernance}) => {

  const [quorumPercentage, setQuorumPercentage] = useState(0)
  const [hardCapPercentage, setHardcapPercentage] = useState(0)
  const [blockLength, setBlockLength] = useState(0)

  function next() {
    onGovernance({
      quorumPercentage,
      hardCapPercentage,
      blockLength
    })
  }

  return (
    <div>
      Quorum percentage: <input type="number" min="0" max="100" value={quorumPercentage} onChange={e => setQuorumPercentage(e.currentTarget.value)}/>
      HarcCap percentage: <input type="number" min="0" max="100" value={hardCapPercentage} onChange={e => setHardcapPercentage(e.currentTarget.value)}/>
      Block Length: <input type="number" value={blockLength} onChange={e => setBlockLength(e.currentTarget.value)}/>
      <a onClick={back}>Back</a>
      <a onClick={next}>Next</a>
    </div>
  )
}

const Deploy = ({data, back, success}) => {
  console.log({data})
  const context = useEthosContext()
  const {getGlobalContract, newContract, chainId, ipfsHttpClient} = useWeb3()

  const [organization, setOrganization] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)

  async function deploy() {
    /*await create({
      context, newContract, chainId, ipfsHttpClient, factoryOfFactories : getGlobalContract("factoryOfFactories")
    }, data)*/
    success()
  }

  function toggleAdvanced() {
    setShowAdvanced(!showAdvanced)
    setOrganization("")
  }

  return (
    <>
      <a onClick={toggleAdvanced}>Advanced</a>
      {showAdvanced && <>
        <br/>
        Attach to: <input type="text" value={organization} onChange={e => setOrganization(e.currentTarget.value)}/>
      </>}
      <a onClick={back}>Back</a>
      <a href="javascript:;" onClick={deploy}>Deploy</a>
    </>
  )
}

const Success = ({back}) => {
  return (
    <div>
      YAY!!!! Successssooooooooo
      <a onClick={back}>Back Che serve solo per navigare in produzione va tolto</a>
    </div>
  )
}

const DelegationsCreate = ({}) => {

  const [cumulativeData, setCumulativeData] = useState({
    step : 'data'
  })

  var steps = {
    data : () => <Data onData={data => setCumulativeData({
      data,
      step : 'chooseType'
    })}/>,
    chooseType : () => <ChooseType
      back={() => setCumulativeData({
        step : 'data'
      })}

      onType={type => setCumulativeData(oldValue => ({
          ...oldValue,
          type,
          step : type === 'governance' ? 'governance' : "deploy"
        }))}
    />,
    governance : () => <Governance
      back={() => setCumulativeData(oldValue => {
        var newValue = {...oldValue, step : 'chooseType'}
        delete newValue.type
        return newValue
      })}
      onGovernance={governance => setCumulativeData(oldValue => ({...oldValue, governance, step: 'deploy'}))}
    />,
    deploy : () => <Deploy
      data={cumulativeData}
      back={() => setCumulativeData(oldValue => {
        var newValue = {...oldValue, step : oldValue.type === 'governance' ? 'governance' : "chooseType"}
        delete newValue.governance
        return newValue
      })}
      success={() => setCumulativeData(oldValue => ({...oldValue, step : 'success'}))}
    />,
    success : () => <Success
      back={() => setCumulativeData(oldValue => ({...oldValue, step : 'deploy'}))}
    />
  }

  return (
    <div>
      <h2>Create Delegation</h2>
      {steps[cumulativeData.step]()}
    </div>
  )
}

/*DelegationsCreate.menuVoice = {
  label : 'Delegation',
}*/

export default DelegationsCreate