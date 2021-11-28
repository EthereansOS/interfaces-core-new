import React, { useState } from 'react'
import ActionAWeb3Button from '../../../../components/Global/ActionAWeb3Button'
import RegularButtonDuo from '../../../../components/Global/RegularButtonDuo'
import RegularModal from '../../../../components/Global/RegularModal'

import { useWeb3, useEthosContext } from '@ethereansos/interfaces-core'

import { CircularProgress } from '@ethereansos/interfaces-ui'

import { setDelegationMetadata } from '../../../../logic/delegation'

import style from '../../../../all.module.css'

const ChangeMetadata =  ({back, finalize}) => {

  const context = useEthosContext()
  const {getGlobalContract, newContract, chainId, ipfsHttpClient} = useWeb3()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [symbol, setSymbol] = useState("")
  const [logo, setLogo] = useState("")
  const [background_color, setBackground_color] = useState("")
  const [external_url, setExternal_url] = useState("")
  const [discussion_url, setDiscussion_url] = useState("")
  const [public_polls, setPublic_polls] = useState("")

  const [loading, setLoading] = useState(false)

  async function deploy() {
    setLoading(true)
    var errorMessage
    try {
        await setDelegationMetadata({
          context, newContract, chainId, ipfsHttpClient
        }, {
          name,
          description,
          symbol,
          logo,
          background_color,
          external_url,
          discussion_url,
          public_polls
        })
    } catch(e) {
      errorMessage = e.message || e
    }
    setLoading(false)
    errorMessage && setTimeout(() => alert(errorMessage))
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
          <h6>Symbol</h6>
          <input type="text" value={symbol} onChange={e => setSymbol(e.currentTarget.value)}/>
          <p>The symbol / ticker of your Delegation.</p>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>Logo link</h6>
          <input placeholder="ipfs//..." type="link" value={logo} onChange={e => setLogo(e.currentTarget.value)}/>
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
          {loading && <CircularProgress/>}
          {!loading && <a className={style.Web3CustomBTN} onClick={deploy}>Deploy</a>}
        </div>
      </div>
  )
}

const AttachToOrganization = ({element, close}) => {

    const [address, setAddress] = useState(null)

    async function onClick() {

        close()
    }

    return (<div className={style.CreationPageLabelS}>
        <label className={style.CreationPageLabelFS}>
          <h6>Organization address</h6>
            <input type="text" value={address} onChange={e => setAddress(e.currentTarget.value)}/>
        </label>
        <ActionAWeb3Button onClick={onClick}>Execute</ActionAWeb3Button>
    </div>)
}

const ChangeRules = ({element, close}) => {

    const [uri, setUri] = useState(null)

    async function onClick() {

        close()
    }

    return (<div className={style.CreationPageLabelS}>
        <label className={style.CreationPageLabelFS}>
          <h6>Organization address</h6>
            <input type="text" value={uri} onChange={e => setUri(e.currentTarget.value)}>New Uri:</input>
        </label>
        <ActionAWeb3Button onClick={onClick}>Execute</ActionAWeb3Button>
    </div>)
}

export default ({element}) => {

    const [modal, setModal] = useState(null)

    const Component = modal === "changeMetadata" ? ChangeMetadata : modal === 'attachToOrganization' ? AttachToOrganization : modal === 'changeRules' ? ChangeRules : null

    return <div className={style.HostToolsDelegations}>
        <h6>Host Only Tools</h6>
        {modal && <RegularModal type="medium" close={() => setModal(null)}>
            <div>
              <Component element={element} close={() => setModal(null)}/>
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