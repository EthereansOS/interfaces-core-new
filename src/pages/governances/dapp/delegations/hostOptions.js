import React, { useEffect, useReducer, useState } from 'react'
import ActionAWeb3Button from '../../../../components/Global/ActionAWeb3Button'
import RegularButtonDuo from '../../../../components/Global/RegularButtonDuo'
import RegularModal from '../../../../components/Global/RegularModal'
import BackButton from '../../../../components/Global/BackButton'
import ProposalMetadata from '../../../../components/Organizations/ProposalMetadata'

import { useWeb3, useEthosContext, blockchainCall, formatLink, web3Utils, abi } from 'interfaces-core'

import { changeVotingRules, setDelegationMetadata, getAvailableDelegationsManagers, attachToOrganization } from '../../../../logic/delegation'

import style from '../../../../all.module.css'
import Web3DependantList from '../../../../components/Global/Web3DependantList'
import OurCircularProgress from '../../../../components/Global/OurCircularProgress'
import { extractRules } from '../../../../logic/organization'
import LogoRenderer from '../../../../components/Global/LogoRenderer'

const ChangeHost = ({ element, close }) => {

  const { account, web3 } = useWeb3()

  const [address, setAddress] = useState()

  async function setHost() {
    var rule = element.proposalModels[0].creationRules
    var data = abi.encode(["address"], [address]).substring(2)
    var signature = web3Utils.sha3("setValue(address)").substring(0, 10)
    data = signature + data
    var nonce = await web3.eth.getTransactionCount(account)
    nonce = web3Utils.toHex(nonce)
    var transaction = {
      nonce,
      from : account,
      to : rule,
      data
    }
    return await web3.eth.sendTransaction(transaction)
  }

  return (<RegularModal close={close}>
    <div className={style.CreationPageLabelS}>
      <h4>Change Delegation Host</h4>
      <label className={style.CreationPageLabelFS}>
        <span>New address</span>
        <input type="text" value={address} onChange={e => setAddress(e.currentTarget.value)}/>
        <ActionAWeb3Button onSuccess={close} onClick={setHost}>Submit</ActionAWeb3Button>
      </label>
    </div>
  </RegularModal>)
}

const ChangeMetadata = ({element, setOnClick, stateProvider}) => {

  const context = useEthosContext()
  const {getGlobalContract, newContract, chainId, ipfsHttpClient} = useWeb3()

  const [state, setState] = stateProvider

  useEffect(() => setTimeout(async function() {
    if(state.loaded) {
      return
    }

    var fromData = {}
    try {
      fromData = await blockchainCall(element.contract.methods.uri)
      fromData = formatLink({ context }, fromData)
      fromData = await (await fetch(fromData)).json()
    } catch(e) {
      fromData = {}
    }

    setState(oldValue => ({
      ...oldValue,
      ...fromData,
      loaded : true
    }))
  }), [])

  function next() {
    setOnClick(() => additionalMetadata => setDelegationMetadata({
      context, newContract, chainId, ipfsHttpClient
    },
    element,
    additionalMetadata,
    {
      name : state.name || "",
      description : state.description || "",
      image : state.image || "",
      tokenURI : state.tokenURI || "",
      background_color : state.background_color || "",
      external_url : state.external_url || "",
      community_url : state.community_url || "",
      public_polls : state.public_polls || "",
      news_url : state.news_url || "",
      blog_url : state.blog_url || ""
    }))
  }

  function onInputChange(e) {
    var name = e.currentTarget.dataset.name
    var value = e.currentTarget[name === 'public_polls' ? 'checked' : 'value']
    setState(oldValue => ({...oldValue, [name] : value}))
  }

  if(!state.loaded) {
    return <OurCircularProgress/>
  }

  return (
      <div className={style.CreationPageLabelS}>
        <h4>Step 1-2: Change Delegation Metadata</h4>
        <label className={style.CreationPageLabelFS}>
          <h6>Name</h6>
          <input type="text" value={state.name} data-name="name" onChange={onInputChange}/>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>Description</h6>
          <textarea value={state.description} data-name="description" onChange={onInputChange}/>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>Website</h6>
          <input type="link" value={state.external_url} data-name="external_url" onChange={onInputChange}/>
          <p>The official website of your Delegation.</p>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>Community link</h6>
          <input type="link" value={state.community_url} data-name="community_url" onChange={onInputChange}/>
          <p>A place to discuss your Delegation.</p>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>News link</h6>
          <input type="link" value={state.news_url} data-name="news_url" onChange={onInputChange}/>
          <p>A place to discuss your Delegation.</p>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>Blog link</h6>
          <input type="link" value={state.blog_url} data-name="blog_url" onChange={onInputChange}/>
          <p>A place to discuss your Delegation.</p>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>Logo link</h6>
          <input placeholder="ipfs//..." type="link" value={state.image} data-name="image" onChange={onInputChange}/>
          <p>A valid IPFS link for your Delegation’s logo. Please upload a square picture (.png, .gif or .jpg; max size 1mb) so that it fits perfectly with the EthereansOS interface style.</p>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>Token Logo Link</h6>
          <input placeholder="ipfs//..." type="link" value={state.tokenURI} data-name="tokenURI" onChange={onInputChange}/>
          <p>A valid IPFS link for your Delegation’s token logo. Please upload a square picture (.png, .gif or .jpg; max size 1mb) so that it fits perfectly with the EthereansOS interface style.</p>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>Logo Background</h6>
          <input type="color" value="#ffffff" data-name="background_color" onChange={onInputChange}/>
          <p>The background color of your Delegation’s logo. This color will fill any empty space that the logo leaves if it is smaller than any standard box in the interface.</p>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>Public polls</h6>
          <input type="checkbox" data-name="public_polls" checked={state.public_polls} onChange={onInputChange}/>
          <p>Public Polls (coming soon): If selected, all polls that involve this Delegation will appear on the Delegation’s page. If not, only polls created by the Delegation’s host will.</p>
        </label>
        <div className={style.ActionDeploy}>
          <RegularButtonDuo onClick={next}>Next</RegularButtonDuo>
        </div>
      </div>
  )
}

const DelegationElement = ({elements, onClick}) => {
  return (
    <div className={style.OrgAllSingle}>
      {elements.map(element => (
        <a key={element.organization.address} className={style.OrgSingle} onClick={() => onClick(element)}>
          <LogoRenderer input={element.organization}/>
          <div className={style.OrgTitleEx}>
            <h6>{element.organization.name}</h6>
          </div>
       </a>))}
    </div>
  )
}

const AttachToOrganization = ({element, setOnClick, stateProvider }) => {

    const context = useEthosContext()
    const { getGlobalContract, newContract, chainId, ipfsHttpClient, web3, account } = useWeb3()

    const [modal, setModal] = useState()

    const [state, setState] = stateProvider

    function onClick() {
      setOnClick(() => additionalMetadata => attachToOrganization({ context, chainId, web3, account, newContract, getGlobalContract, ipfsHttpClient }, element, additionalMetadata, state.selected));
    }

    return (<div className={style.CreationPageLabelS}>
        <h4>Step 1-2: Attach Delegation to an Organization</h4>
        {modal && <RegularModal close={() => setModal(false)}>
            <Web3DependantList
              provider={() => state.list || getAvailableDelegationsManagers({ context, chainId, web3, account, getGlobalContract, newContract }, element.address).then(list => {
                setState(oldValue => ({...oldValue, list}))
                return list
              })}
              Renderer={DelegationElement}
              rendererIsContainer
              renderedProperties={{
                onClick : selected => void(setState(oldValue => ({...oldValue, selected})), setModal(false))
              }}
            />
        </RegularModal>}
        <label className={style.CreationPageLabelFS}>
          <a className={style.RegularButton} onClick={() => setModal(true)}>Select an organization</a>
          <br></br>
          <p>Before attaching the Delegation to an Organization, please ensure that it has the required amount of insurance tokens to stake.</p>
          {state.selected && <div>{state.selected.organization.name}</div>}
        </label>
        <RegularButtonDuo className={state.selected ? undefined : "Disabled"} onClick={state.selected && onClick}>Next</RegularButtonDuo>
    </div>)
}

const ChangeRules = ({element, setOnClick, stateProvider }) => {

    const context = useEthosContext()
    const { getGlobalContract, newContract, chainId, ipfsHttpClient } = useWeb3()

    const [state, setState] = stateProvider

    useEffect(() => setTimeout(async function() {
      if(state.loaded) {
        return
      }
      var model = element.proposalModels[element.proposalModels.length - 1]
      var fromData = (await Promise.all([
          extractRules({context, provider : element.components.proposalsManager.contract.currentProvider}, model.validatorsAddresses[0], model),
          extractRules({context, provider : element.components.proposalsManager.contract.currentProvider}, model.canTerminateAddresses[0], model)
      ])).reduce((acc, it) => [...acc, ...it], [])

      fromData = fromData.reduce((acc, it) => ({
        ...acc,
        [it.label] : it.value.split('%').join('').split(' blocks').join('')
      }), {})
      fromData.quorum && (fromData.quorumPercentage = fromData.quorum)
      delete fromData.quorum
      fromData.hardCap && (fromData.hardCapPercentage = fromData.hardCap)
      delete fromData.hardCap

      setState(oldValue => ({
        ...oldValue,
        ...fromData,
        loaded : true
      }))
    }), [])

    function onClick() {
      setOnClick(() => additionalMetadata => changeVotingRules({ context, ipfsHttpClient },
        element,
        additionalMetadata,
        state.quorumPercentage || "0",
        state.validationBomb || "0",
        state.blockLength || "0",
        state.hardCapPercentage || "0"))
    }

    function onInputChange(e) {
      var value = e.currentTarget.value
      var name = e.currentTarget.dataset.name
      setState(oldValue => ({...oldValue, [name] : value}))
    }

    if(!state.loaded) {
      return <OurCircularProgress/>
    }

    return (<div className={style.CreationPageLabelS}>
        <h4>Step 1-2: Change Delegation Voting Rules</h4>
        <label className={style.CreationPageLabelFS}>
          <h6>Survey Duration</h6>
          <input type="number" data-name="blockLength" value={state.blockLength} onChange={onInputChange}/>
          <p>The duration (in blocks) that Proposals will be open for.</p>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>Validation Bomb</h6>
          <input type="number" data-name="validationBomb" value={state.validationBomb} onChange={onInputChange}/>
          <p>This is an optional amount of blocks after which a passed Proposal can never be executed. If set as zero, there is no time limit by which a Proposal must be executed.</p>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>Quorum: {state.quorumPercentage || "0"}%</h6>
          <input className={style.perchentageThing} data-name="quorumPercentage" type="range" min="0" max="100" value={state.quorumPercentage} onChange={onInputChange}/>
          <p>An minimum number of votes required for a proposal to pass.</p>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>Hard Cap: {state.hardCapPercentage || "0"}%</h6>
          <input className={style.perchentageThing} data-name="hardCapPercentage" type="range" min="0" max="100" value={state.hardCapPercentage} onChange={onInputChange}/>
          <p>An optional minimum number of votes required to end a proposal, regardless of how long it is still set to remain open.</p>
        </label>
        <RegularButtonDuo onClick={onClick}>Next</RegularButtonDuo>
    </div>)
}

export default ({element, refresh}) => {

    const [modal, setModal] = useState(null)
    const [changeHost, setChangeHost] = useState()

    const Component = modal === "changeMetadata" ? ChangeMetadata : modal === 'attachToOrganization' ? AttachToOrganization : ChangeRules

    return <div className={style.HostToolsDelegations}>
        <h6>Host Tools</h6>
        {modal && <RegularModal close={() => setModal(null)}>
            <div>
              <ProposalMetadata Component={Component} element={element} onSuccess={() => void(setModal(null), refresh())}/>
            </div>
        </RegularModal>}
        {changeHost && <ChangeHost element={element} close={() => setChangeHost()}/>}
        <div className={style.HostToolsDelegationsBTN}>
          <RegularButtonDuo onClick={() => setChangeHost(true)}>Change Host</RegularButtonDuo>
        </div>
        <div className={style.HostToolsDelegationsBTN}>
          <RegularButtonDuo onClick={() => setModal("changeMetadata")}>Edit Metadata</RegularButtonDuo>
        </div>
        <div className={style.HostToolsDelegationsBTN}>
          <RegularButtonDuo onClick={() => setModal("attachToOrganization")}>Connect to an organization</RegularButtonDuo>
        </div>
        <div className={style.HostToolsDelegationsBTN}>
          <RegularButtonDuo onClick={() => setModal("changeRules")}>Edit voting Rules</RegularButtonDuo>
        </div>
    </div>
}