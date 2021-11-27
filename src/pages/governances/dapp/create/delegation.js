import React, {useState} from 'react'

import { Style, useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'
import {createDelegation, finalizeDelegation} from '../../../../logic/delegation'
import { CircularProgress } from '@ethereansos/interfaces-ui'
import style from './../organizations-main-sections.module.css'

const Init = ({onSelection}) => {
  return (
    <div>
      <div className={style.CreateBoxDesc}>
        <h6>Organization</h6>
        <p>Start a  are fully on-chain governance system with composable granular permissions levels.</p>
        <b className={style.ExtLinkButtonAlpha}>Coming Soon</b>
        <a target="_blank" href="https://docs.ethos.wiki/ethereansos-docs/organizations/organizations" className={style.ExtLinkButtonAlpha}>Learn</a>
      </div>
      <div className={style.CreateBoxDesc}>
        <h6>Delegation</h6>
        <p>Start a delegation, to manage grants and become an active party in the journey of one or more organizations.</p>
        <a className={style.NextStep}  onClick={() => onSelection("deploy")}>Start</a>
        <a target="_blank" className={style.ExtLinkButtonAlpha} href="https://docs.ethos.wiki/ethereansos-docs/organizations/delegations">Learn</a>
      </div>
      <div className={style.AdvancedLinks}>
        <a onClick={() => onSelection("finalize")}>Finalize</a>
      </div>
    </div>
  )
}

const Deploy = ({back, finalize}) => {

  const context = useEthosContext()
  const {getGlobalContract, newContract, chainId, ipfsHttpClient} = useWeb3()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [tick, setTick] = useState("")
  const [logo, setLogo] = useState("")

  const [loading, setLoading] = useState(false)

  async function deploy() {
    setLoading(true)
    var errorMessage
    try {
        finalize(await createDelegation({
          context, newContract, chainId, ipfsHttpClient, factoryOfFactories : getGlobalContract("factoryOfFactories")
        }, {
          name,
          description,
          tick,
          logo
        }))
    } catch(e) {
      errorMessage = e.message || e
    }
    setLoading(false)
    errorMessage && setTimeout(() => alert(errorMessage))
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
      {loading && <CircularProgress/>}
      {!loading && <a onClick={back}>Back</a>}
      {!loading && <a onClick={deploy}>Deploy</a>}
    </div>
  )
}

const Finalize = ({back, success, cumulativeData}) => {

  const context = useEthosContext()
  const { getGlobalContract, newContract, chainId } = useWeb3()

  const [delegationAddress, setDelegationAddress] = useState(cumulativeData.delegationAddress)
  const [quorumPercentage, setQuorumPercentage] = useState(0)
  const [hardCapPercentage, setHardcapPercentage] = useState(0)
  const [blockLength, setBlockLength] = useState(0)
  const [validationBomb, setValidationBomb] = useState(0)
  const [host, setHost] = useState(null)

  const [loading, setLoading] = useState(false)

  async function finalize() {
    setLoading(true)
    var errorMessage
    try {
      await finalizeDelegation({context, chainId, newContract, factoryOfFactories : getGlobalContract("factoryOfFactories")},
        delegationAddress,
        host,
        quorumPercentage,
        validationBomb,
        blockLength,
        hardCapPercentage)
      success()
    } catch(e) {
      errorMessage = e.message || e
    }
    setLoading(false)
    errorMessage && setTimeout(() => alert(errorMessage))
  }

  return (
    <div>
      Delegation address: <input type="text" value={delegationAddress} onChange={e => setDelegationAddress(e.currentTarget.value)}/>
      Host: <input type="text" value={host} onChange={e => setHost(e.currentTarget.value)}/>
      Quorum percentage: <input type="number" min="0" max="100" value={quorumPercentage} onChange={e => setQuorumPercentage(e.currentTarget.value)}/>
      HarcCap percentage: <input type="number" min="0" max="100" value={hardCapPercentage} onChange={e => setHardcapPercentage(e.currentTarget.value)}/>
      Block Length: <input type="number" value={blockLength} onChange={e => setBlockLength(e.currentTarget.value)}/>
      Validation Bomb: <input type="number" value={validationBomb} onChange={e => setValidationBomb(e.currentTarget.value)}/>
      {loading && <CircularProgress/>}
      {!loading && <a onClick={back}>Back</a>}
      {!loading && <a onClick={finalize}>Finalize</a>}
    </div>
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
    step : 'init'
  })

  var steps = {
    init : () => <Init
      onSelection={step => setCumulativeData({step})}
    />,
    deploy : () => <Deploy
      back={() => setCumulativeData({step : 'init'})}
      finalize={delegationAddress => setCumulativeData(oldValue => ({...oldValue, delegationAddress, step : 'finalize'}))}
    />,
    finalize : () => <Finalize
      cumulativeData={cumulativeData}
      back={() => setCumulativeData({step : 'init'})}
      success={() => setCumulativeData(oldValue => ({...oldValue, step: 'success'}))}
    />,
    success : () => <Success
      back={() => setCumulativeData(oldValue => ({...oldValue, step : 'finalize'}))}
    />
  }

  return (
    <div className={style.CreatePage}>
      {steps[cumulativeData.step]()}
    </div>
  )
}

/*DelegationsCreate.menuVoice = {
  label : 'Delegation',
}*/

export default DelegationsCreate