import React, {useEffect, useState} from 'react'

import { Link, useLocation } from 'react-router-dom'
import { Style, useEthosContext, useWeb3, web3Utils } from '@ethereansos/interfaces-core'
import {createDelegation, finalizeDelegation} from '../../../../logic/delegation'
import CircularProgress from '../../../../components/Global/OurCircularProgress'
import style from '../organizations-main-sections.module.css'

const Init = ({onSelection}) => {
  return (
    <div>
      <div className={style.CreateBoxDesc}>
        <h6>Organization</h6>
        <p>Start a completely on-chain governance organization with deeply composable permission levels.</p>
        <b className={style.ExtLinkButtonAlpha}>Coming Soon</b>
        <a target="_blank" href="https://docs.ethos.wiki/ethereansos-docs/organizations/organizations" className={style.ExtLinkButtonAlpha}>Learn</a>
      </div>
      <div className={style.CreateBoxDesc}>
        <h6>Delegation</h6>
        <p>A Delegation is an independent governance party that can compete for grant funding from one or more Organizations.</p>
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
  const [symbol, setSymbol] = useState("")
  const [image, setImage] = useState("")
  const [tokenURI, setTokenURI] = useState("")
  const [background_color, setBackground_color] = useState("")
  const [external_url, setExternal_url] = useState("")
  const [community_url, setCommunity_url] = useState("")
  const [public_polls, setPublic_polls] = useState("")
  const [news_url, setNews_url] = useState("")
  const [blog_url, setBlog_url] = useState("")

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
          symbol,
          image,
          tokenURI,
          background_color,
          external_url,
          community_url,
          public_polls,
          news_url,
          blog_url

        }))
    } catch(e) {
      errorMessage = e.message || e
    }
    setLoading(false)
    errorMessage && setTimeout(() => alert(errorMessage))
  }

  return (
    <div className={style.CreationPageLabel}>
      <div className={style.stepTitle}>
        <h6>Step 1/2 - Bio</h6>
      </div>
      <label className={style.CreationPageLabelF}>
        <h6>Name</h6>
        <input type="text" value={name} onChange={e => setName(e.currentTarget.value)}/>
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Description</h6>
        <textarea value={description} onChange={e => setDescription(e.currentTarget.value)}/>
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Website</h6>
        <input type="link" value={external_url} onChange={e => setExternal_url(e.currentTarget.value)}/>
        <p>The official website of your Delegation.</p>
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Community link</h6>
        <input type="link" value={community_url} onChange={e => setCommunity_url(e.currentTarget.value)}/>
        <p>A place to discuss your Delegation.</p>
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>News link</h6>
        <input type="link" value={news_url} onChange={e => setNews_url(e.currentTarget.value)}/>
        <p>A place to discuss your Delegation.</p>
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Blog link</h6>
        <input type="link" value={blog_url} onChange={e => setBlog_url(e.currentTarget.value)}/>
        <p>A place to discuss your Delegation.</p>
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Symbol</h6>
        <input type="text" value={symbol} onChange={e => setSymbol(e.currentTarget.value)}/>
        <p>The symbol / ticker of your Delegation.</p>
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Logo link</h6>
        <input placeholder="ipfs//..." type="link" value={image} onChange={e => setImage(e.currentTarget.value)}/>
        <p>Logo Link: A valid IPFS link for your Delegation’s logo. Please upload a square picture (.png, .gif or .jpg; max size 1mb) so that it fits perfectly with the EthereansOS interface style.</p>
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Token Logo Link</h6>
        <input placeholder="ipfs//..." type="link" value={tokenURI} onChange={e => setTokenURI(e.currentTarget.value)}/>
        <p>Logo Link: A valid IPFS link for your Delegation’s token logo. Please upload a square picture (.png, .gif or .jpg; max size 1mb) so that it fits perfectly with the EthereansOS interface style.</p>
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Logo Background</h6>
        <input type="color" value="#ffffff" onChange={e => setBackground_color(e.currentTarget.value)}/>
        <p>Logo Background: The background color of your Delegation’s logo. This color will fill any empty space that the logo leaves if it is smaller than any standard box in the interface.</p>
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Public polls</h6>
        <input type="checkbox" onChange={e => setPublic_polls(e.currentTarget.checked)} checked={public_polls}/>
        <p>Public Polls (coming soon): If selected, all polls that involve this Delegation will appear on the Delegation’s page. If not, only polls created by the Delegation’s host will.</p>
      </label>
      <div className={style.ActionDeploy}>
        {loading && <CircularProgress/>}
        {!loading && <a className={style.Web3BackBTN} onClick={back}>Back</a>}
        {!loading && <a className={style.Web3CustomBTN} onClick={deploy}>Deploy</a>}
      </div>
    </div>
  )
}

const Finalize = ({back, success, cumulativeData}) => {

  const context = useEthosContext()
  const { getGlobalContract, newContract, chainId } = useWeb3()

  const [delegationAddress, setDelegationAddress] = useState(cumulativeData?.delegationAddress)
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
    <div className={style.CreationPageLabel}>
      <div className={style.stepTitle}>
        <h6>Step 2/2 - Governance Rules</h6>
      </div>
      <label className={style.CreationPageLabelF}>
        <h6>Delegation address</h6>
        <input type="text" value={delegationAddress} onChange={e => setDelegationAddress(e.currentTarget.value)}/>
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Host</h6>
        <input type="text" value={host} onChange={e => setHost(e.currentTarget.value)}/>
        <p>This is the address (wallet, MultiSig, Organization or contract) that manages this Delegation. The host is able to create proposals to spend funds, change metadata and change governance rules.</p>
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Survey Duration</h6>
        <input type="number" value={blockLength} onChange={e => setBlockLength(e.currentTarget.value)}/>
        <p>The duration (in blocks) that Proposals will be open for.</p>
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Validation Bomb</h6>
        <input type="number" value={validationBomb} onChange={e => setValidationBomb(e.currentTarget.value)}/>
        <p>An optional duration (in blocks) after which a passed Proposal can never be executed. If set as zero, there is no time before which a Proposal can be executed.</p>
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Quorum {quorumPercentage || "0"}%</h6>
        <input className={style.perchentageThing} type="range" min="0" max="100" value={quorumPercentage} onChange={e => setQuorumPercentage(e.currentTarget.value)}/>
        <p>A minimum amount of votes (calculated as a percentage of the Delegation token’s total supply) required for a Proposal to pass.</p>
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Hard Cap {hardCapPercentage || "0"}%</h6>
        <input className={style.perchentageThing} type="range" min="0" max="100" value={hardCapPercentage} onChange={e => setHardcapPercentage(e.currentTarget.value)}/>
        <p>An optional minimum amount of votes (calculated as a percentage of the Delegation token’s total supply) required to end a Proposal, regardless of how long it is still set to remain open.</p>
      </label>
      <div className={style.ActionDeploy}>
        {loading && <CircularProgress/>}
        {!loading && <a className={style.Web3BackBTN} onClick={back}>Back</a>}
        {!loading && <a className={style.Web3CustomBTN} onClick={finalize}>Finalize</a>}
      </div>
    </div>
  )
}

const Success = ({cumulativeData}) => {
  return (
    <div>
      <h6>&#127881; &#127881; Delegation Created! &#127881; &#127881;</h6>
      <p><b>And Now?</b></p>
      <label className={style.CreationPageLabelF}>
        <h6><Link to={`/guilds/dapp/delegations/${cumulativeData.delegationAddress}`}>Explore your Delegation</Link></h6>
      </label>
    </div>
  )
}

const DelegationsCreate = ({}) => {

  const { pathname } = useLocation()

  const [cumulativeData, setCumulativeData] = useState({
    step : 'init'
  })

  useEffect(() => {
    try {
      var delegationAddress = pathname.split('/')
      var index = delegationAddress.length - 1
      if(delegationAddress[index] === "") {
        index--
      }
      delegationAddress = delegationAddress[index]
      delegationAddress = web3Utils.toChecksumAddress(delegationAddress)
      setCumulativeData(oldValue => ({...oldValue, delegationAddress, step : 'finalize'}))
    } catch(e) {}
  }, [pathname])

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
      cumulativeData={cumulativeData}
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