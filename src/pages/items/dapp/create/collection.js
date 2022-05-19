import React, { useEffect, useState } from 'react'

import ActionAWeb3Button from '../../../../components/Global/ActionAWeb3Button'

import { useEthosContext, web3Utils, useWeb3, getNetworkElement } from '@ethereansos/interfaces-core'

import RegularModal from '../../../../components/Global/RegularModal'

import { checkCoverSize, checkCollectionMetadata, deployCollection } from '../../../../logic/itemsV2'

import style from '../../../../all.module.css'
import OurCircularProgress from '../../../../components/Global/OurCircularProgress'
import { Link, useHistory } from 'react-router-dom'

const NameAndSymbol = ({state, onStateEntry}) => {

    useEffect(() => {
        onStateEntry("name", state.name)
        onStateEntry("symbol", state.symbol)
    }, [])

    useEffect(() => {
        onStateEntry("disabled", (state.name && state.symbol) ? undefined : true)
    }, [state.name, state.symbol])

    return (
        <div className={style.CreationPageLabel}>
            <div className={style.FancyExplanationCreate}>
                <h6>Basic Info</h6>
                <div className={style.proggressCreate}>
                    <div className={style.proggressCreatePerch} style={{width: "33%"}}>Step 1 of 3</div>
                </div>
            </div>
            <label className={style.CreationPageLabelF}>
                <h6>Name</h6>
                <input type="text" value={state.name} onChange={e => onStateEntry("name", e.currentTarget.value)}/>
                <p>Insert a name for your collection.</p>
            </label>
            <label className={style.CreationPageLabelF}>
                <h6>Symbol</h6>
                <input type="text" value={state.symbol} onChange={e => onStateEntry("symbol", e.currentTarget.value)}/>
                <p>Insert a symbol for your collection.</p>
            </label>
        </div>
    )
}

const Host = ({state, onStateEntry}) => {

    useEffect(() => {
        onStateEntry("host", state.host)
        onStateEntry('metadataHost', state.metadataHost)
    }, [])

    useEffect(() => {
        var disabled = state.host && state.metadataHost ? undefined : true
        try {
            web3Utils.toChecksumAddress(state.host)
        } catch(e) {
            disabled = true
        }
        try {
            web3Utils.toChecksumAddress(state.metadataHost)
        } catch(e) {
            disabled = true
        }
        onStateEntry("disabled", disabled)
    }, [state.host, state.metadataHost])

    return (
    <div className={style.CreationPageLabel}>
        <div className={style.FancyExplanationCreate}>
            <h6>Host</h6>
            <div className={style.proggressCreate}>
                <div className={style.proggressCreatePerch} style={{width: "66%"}}>Step 2 of 3</div>
            </div>
        </div>
        <label className={style.CreationPageLabelF}>
            <h6>Mint Host</h6>
            <input type="text" value={state.host} onChange={e => onStateEntry("host", e.currentTarget.value)}/>
            <p>An address (wallet, MultiSig, Organization, or contract) that manages the mint function of this collection. The host can mint new Items and their quantity. The host can also change or renounce the mint permission.</p>
        </label>
        <label className={style.CreationPageLabelF}>
            <h6>Metadata Host</h6>
            <input type="text" value={state.metadataHost} onChange={e => onStateEntry("metadataHost", e.currentTarget.value)}/>
            <p>An address (wallet, MultiSig, Organization, or contract) that manages the information of this collection. The host can change the metadata of the items. The host can also change or renounce the metadata permissions.</p>
        </label>
    </div>)
}

const MetadataField = ({state, onStateEntry, field, type, label, description, accept, mandatory}) => {
    return (
            <label className={style.CreationPageLabelF}>
                <h6>{label}{mandatory && <b>*</b>}:</h6>
                {type === 'textarea'
                    ? <textarea onChange={e => onStateEntry('metadata', ({...state.metadata, [field] : e.currentTarget.value}))}>{state.metadata[field]}</textarea>
                    : <input type={type || 'text'} accept={accept} ref={type !== 'file' ? undefined : ref => ref && (ref.files = state.metadata[field] || (window.DataTransfer ? new window.DataTransfer().files : null))} value={type === 'file' ? undefined : state.metadata[field]} onChange={e => onStateEntry('metadata', ({...state.metadata, [field] : type === 'file' ? e.currentTarget.files : e.currentTarget.value}))}/>}
                {description && <p>{description}</p>}
            </label>
    )
}

const Metadata = ({state, onStateEntry}) => {

    const context = useEthosContext()

    useEffect(() => {
        onStateEntry('metadata', state.metadata || { background_color : "#ffffff" })
        onStateEntry('metadataLink', state.metadataLink)
        onStateEntry('metadataType', state.metadataType || 'metadata')
    }, [])

    useEffect(() => {
        if(!state.metadataType) {
            return
        }
        onStateEntry(state.metadataType === 'metadata' ? 'metadataLink' : 'metadata', state.metadataType === 'metadata' ? undefined : { background_color : "#000000" })
    }, [state.metadataType])

    useEffect(() => {
        if(!state.metadataType) {
            return
        }
        var ipfsRegex = 'ipfs:\/\/ipfs\/(([a-z]|[A-Z]|[0-9]){46})$'
        if(state.metadataType === 'metadataLink') {
            return onStateEntry('disabled', state.metadataLink && (new RegExp(ipfsRegex).test(state.metadataLink)) ? undefined : true)
        }
        onStateEntry('disabled', !checkCollectionMetadata(state.metadata))

    }, [state.metadataType, state.metadata, state.metadataLink])

    useEffect(() => {
        if(!state.metadata?.image) {
            return
        }
        setTimeout(async () => {
            if(!await checkCoverSize({ context }, state.metadata.image)) {
                var newMetadata = { ...state.metadata }
                delete newMetadata.image
                alert("Cover size does not match requirements")
                onStateEntry('metadata', newMetadata)
            }
        })
    }, [state.metadata?.image])

    return (<>
       <div className={style.FancyExplanationCreate}>
            <h6>Metadata</h6>
            <div className={style.proggressCreate}>
                <div className={style.proggressCreatePerchLast} style={{width: "100%"}}>Step 3 of 3</div>
            </div>
        </div>
        <select className={style.CreationSelect} value={state.metadataType} onChange={e => onStateEntry('metadataType', e.currentTarget.value)}>
            <option value="metadata">Basic</option>
            <option value="metadataLink">Custom</option>
        </select>
        {state.metadataType === 'metadataLink' && <>
            <div>
                <label className={style.CreationPageLabelF}>
                    <h6>Link</h6>
                    <input placeholder='ipfs://ipfs/...' type="text" value={state.metadataLink} onChange={e => onStateEntry("metadataLink", e.currentTarget.value)}/>
                </label>
            </div>
        </>}
        {state.metadataType === 'metadata' && <>
            <MetadataField state={state} onStateEntry={onStateEntry} type='textarea' field='description' label='Description' mandatory description='A description of the collection' mandatory/>
            <MetadataField state={state} onStateEntry={onStateEntry} field='discussion_url' label='Discussion Link' description='A link to a social hub and/or discussion channel for the collection (if any)'/>
            <MetadataField state={state} onStateEntry={onStateEntry} field='external_url' label='Website' description='A link to the official website of this project (if any)'/>
            <MetadataField state={state} onStateEntry={onStateEntry} field='github_url' label='Github Link' description='A link to the official repo of this project (if any)'/>
            <MetadataField state={state} onStateEntry={onStateEntry} type='file' accept='.png,.gif' field='image' label='Logo' mandatory description='A valid IPFS link for your logo. Please upload a square picture (.png, .gif or .jpg, max size 1mb) so that it fits perfectly with the EthereansOS interface style.'/>
            <MetadataField state={state} onStateEntry={onStateEntry} type='color' field='background_color' label='Background Color' mandatory description='The background color of your collection logo. This color will fill any empty space that the logo leaves if it doesn’t match any standard box in the interface.'/>
        </>}
    </>)
}

NameAndSymbol.next = Host

Host.prev = NameAndSymbol
Host.next = Metadata

Metadata.prev = Host
Metadata.deploy = true

const components = [
    NameAndSymbol,
    Host,
    Metadata
]

const CreateSuccess = ({success}) => {

    const context = useEthosContext()

    const history = useHistory()

    const { chainId, web3 } = useWeb3()

    const [collectionId, setCollectionId] = useState()

    useEffect(() => {
        setCollectionId()
        setTimeout(async function() {
            const receipt = await web3.eth.getTransactionReceipt(success.transactionHash)
            const log = receipt.logs.filter(it => it.topics[0] === web3Utils.sha3('Collection(address,address,bytes32)'))[0]
            setCollectionId(log.topics[3])
            history.push(('/items/dapp/collections/' + log.topics[3]))
        })
    }, [success])

    return <OurCircularProgress/>

    return (<div>
        <h4>Operation Completed</h4>
        <a target="_blank" href={`${getNetworkElement({chainId, context}, "etherscanURL")}/tx/${success.transactionHash}`}>Transaction</a>
        {!collectionId && <OurCircularProgress/>}
        {collectionId && <>
            <Link to={"/items/dapp/collections/" + collectionId}>View Collection</Link>
            <Link to={"/items/dapp/create/item/" + collectionId}>Mint Items</Link>
        </>}
      </div>)
  }

const CreateCollection = ({}) => {

    const context = useEthosContext()

    const { ipfsHttpClient, getGlobalContract } = useWeb3()

    const [state, setState] = useState({})

    const [componentIndex, setComponentIndex] = useState(0)

    const [success, setSuccess] = useState(null)

    function onStateEntry(key, value) {
        setState(oldState => {
            var newState = {...oldState, [key] : value}
            value === undefined && delete newState[key]
            return newState
        })
    }

    const Component = components[componentIndex]

    const nextComponentIndex = components.indexOf(Component.next)
    const previousComponentIndex = components.indexOf(Component.prev)

    return (
        <div className={style.CreatePage}>
            {success && <RegularModal>
                <CreateSuccess success={success}/>
            </RegularModal>}
            <Component state={state} onStateEntry={onStateEntry}/>
            <div className={style.ActionBTNCreateX}>
                {previousComponentIndex !== -1 && <a className={style.Web3BackBTN} onClick={() => setComponentIndex(previousComponentIndex)}>Back</a>}
                {nextComponentIndex !== -1 && <a className={style.RegularButton + (state?.disabled ? (' ' + style.disabled) : '')} onClick={() => !state.disabled && setComponentIndex(nextComponentIndex)}>Next</a>}
                {Component.deploy && <ActionAWeb3Button onSuccess={setSuccess} className={style.Web3CustomBTN + (state?.disabled ? (' ' + style.disabled) : '')} onClick={() => deployCollection({ context, ipfsHttpClient, projectionFactory : getGlobalContract('itemProjectionFactory') }, state)}>Deploy</ActionAWeb3Button>}
            </div>
        </div>
    )
}

CreateCollection.menuVoice = {
  path : '/items/dapp/create/collection'
}

export default CreateCollection