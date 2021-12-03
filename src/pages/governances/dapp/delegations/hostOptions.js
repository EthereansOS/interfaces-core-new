import React, { useState } from 'react'
import ActionAWeb3Button from '../../../../components/Global/ActionAWeb3Button'
import RegularButtonDuo from '../../../../components/Global/RegularButtonDuo'
import RegularModal from '../../../../components/Global/RegularModal'

import { useWeb3, useEthosContext } from '@ethereansos/interfaces-core'

import { changeVotingRules, setDelegationMetadata } from '../../../../logic/delegation'

import style from '../../../../all.module.css'

const ChangeMetadata =  ({element, close}) => {

  const context = useEthosContext()
  const {getGlobalContract, newContract, chainId, ipfsHttpClient} = useWeb3()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")
  const [background_color, setBackground_color] = useState("")
  const [external_url, setExternal_url] = useState("")
  const [discussion_url, setDiscussion_url] = useState("")
  const [public_polls, setPublic_polls] = useState("")

  function deploy() {
    return setDelegationMetadata({
      context, newContract, chainId, ipfsHttpClient
    },
    element,
    {
      name,
      description,
      image,
      background_color,
      external_url,
      discussion_url,
      public_polls
    })
  }

  return (
      <div className={style.CreationPageLabelS}>
        <label className={style.CreationPageLabelFS}>
          <h6>Name</h6>
          <input type="text" value={name} onChange={e => setName(e.currentTarget.value)}/>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>Description</h6>
          <textarea value={description} onChange={e => setDescription(e.currentTarget.value)}/>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>Website</h6>
          <input type="link" value={external_url} onChange={e => setExternal_url(e.currentTarget.value)}/>
          <p>The official website of your Delegation.</p>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>Discussion link</h6>
          <input type="link" value={discussion_url} onChange={e => setDiscussion_url(e.currentTarget.value)}/>
          <p>A place to discuss your Delegation.</p>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>Logo link</h6>
          <input placeholder="ipfs//..." type="link" value={image} onChange={e => setImage(e.currentTarget.value)}/>
          <p>A valid IPFS link for your Delegation’s logo. Please upload a square picture (.png, .gif or .jpg, max size 1mb) so that it fits perfectly with the EthereansOS interface style.</p>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>Logo Background</h6>
          <input type="color" value="#ffffff" onChange={e => setBackground_color(e.currentTarget.value)}/>
          <p>The background color of your Delegation’s logo. This color will fill any empty space that the logo leaves if it doesn’t match any standard box in the interface.</p>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>Public polls</h6>
          <input type="checkbox" onChange={e => setPublic_polls(e.currentTarget.value)}/>
          <p>If active, all polls created regarding this Delegation will appear on the Delegation’s page. If not active, only polls created by the Delegation host will appear on the Delegation’s page.</p>
        </label>
        <div className={style.ActionDeploy}>
          <ActionAWeb3Button onSuccess={close} onClick={deploy}>Deploy</ActionAWeb3Button>
        </div>
      </div>
  )
}

const AttachToOrganization = ({element, close}) => {

    const [address, setAddress] = useState(null)

    async function onClick() {

    }

    return (<div className={style.CreationPageLabelS}>
        <label className={style.CreationPageLabelFS}>
          <h6>Organization address</h6>
            <input type="text" value={address} onChange={e => setAddress(e.currentTarget.value)}/>
        </label>
        <ActionAWeb3Button onSuccess={close} onClick={onClick}>Execute</ActionAWeb3Button>
    </div>)
}

const ChangeRules = ({element, close}) => {

    const context = useEthosContext()
    const { getGlobalContract, newContract, chainId } = useWeb3()

    const [quorumPercentage, setQuorumPercentage] = useState(0)
    const [hardCapPercentage, setHardcapPercentage] = useState(0)
    const [blockLength, setBlockLength] = useState(0)
    const [validationBomb, setValidationBomb] = useState(0)

    async function onClick() {
      await changeVotingRules({},
        element,
        quorumPercentage,
        validationBomb,
        blockLength,
        hardCapPercentage)
    }

    return (<div className={style.CreationPageLabelS}>
        <label className={style.CreationPageLabelF}>
          <h6>Survey Duration</h6>
          <input type="number" value={blockLength} onChange={e => setBlockLength(e.currentTarget.value)}/>
          <p>The duration (in blocks) that Proposals will be open for.</p>
        </label>
        <label className={style.CreationPageLabelF}>
          <h6>Validation Bomb</h6>
          <input type="number" value={validationBomb} onChange={e => setValidationBomb(e.currentTarget.value)}/>
          <p>This is an optional amount of blocks after which a passed Proposal can never be executed. If set as zero, there is no time limit by which a Proposal must be executed.</p>
        </label>
        <label className={style.CreationPageLabelF}>
          <h6>Quorum</h6>
          <input className={style.perchentageThing} type="number" min="0" max="100" value={quorumPercentage} onChange={e => setQuorumPercentage(e.currentTarget.value)}/>
          <p>An minimum number of votes required for a proposal to pass.</p>
        </label>
        <label className={style.CreationPageLabelF}>
          <h6>Hard Cap</h6>
          <input className={style.perchentageThing} type="number" min="0" max="100" value={hardCapPercentage} onChange={e => setHardcapPercentage(e.currentTarget.value)}/>
          <p>An optional minimum number of votes required to end a proposal, regardless of how long it is still set to remain open.</p>
        </label>
        <ActionAWeb3Button onSuccess={close} onClick={onClick}>Execute</ActionAWeb3Button>
    </div>)
}

export default ({element, refresh}) => {

    const [modal, setModal] = useState(null)

    const Component = modal === "changeMetadata" ? ChangeMetadata : modal === 'attachToOrganization' ? AttachToOrganization : ChangeRules

    return <div className={style.HostToolsDelegations}>
        <h6>Host Only Tools</h6>
        {modal && <RegularModal type="medium" close={() => setModal(null)}>
            <div>
              <Component element={element} close={() => void(setModal(null), refresh())}/>
            </div>
        </RegularModal>}
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