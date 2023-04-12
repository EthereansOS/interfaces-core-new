import React, { useEffect, useState } from 'react'

import ActionAWeb3Button from '../../../../components/Global/ActionAWeb3Button'
import { useLocation, useHistory } from 'react-router-dom'
import { useEthosContext, web3Utils, useWeb3, getNetworkElement, blockchainCall, abi, sendAsync, VOID_BYTES32, VOID_ETHEREUM_ADDRESS } from '@ethereansos/interfaces-core'
import { getRawField } from '../../../../logic/generalReader'

import RegularModal from '../../../../components/Global/RegularModal'

import { checkCoverSize, checkItemMetadata, deployItem, loadCollectionMetadata, loadItemsByFactories } from '../../../../logic/itemsV2'

import style from '../../../../all.module.css'
import OurCircularProgress from '../../../../components/Global/OurCircularProgress'

import TraitTypes from './traitTypes'

import itemMetadataTypes from './itemMetadataTypes.json'
import { useOpenSea } from '../../../../logic/uiUtilities'

const LoadCollection = ({inputItem, mode, state, onStateEntry, setComponentIndex}) => {

    const context = useEthosContext()

    const { web3, getGlobalContract, newContract, account } = useWeb3()

    const [collection, setCollection] = useState()

    useEffect(() => {
      onStateEntry('hostType')
      onStateEntry('host')
    }, [])

    useEffect(() => {
      setCollection(null)
      if(!state.collectionId) {
        return
      }
      setTimeout(async () => {
          const itemProjectionFactory = getGlobalContract('itemProjectionFactory')
          const mainInterface = newContract(context.ItemMainInterfaceABI, await blockchainCall(itemProjectionFactory.methods.mainInterface))
          var collection = null
          try {
            collection = await blockchainCall(mainInterface.methods.collection, state.collectionId)
            const multiOperatorHost = newContract(context.MultiOperatorHostABI, collection.host)
            const mintOperator = await blockchainCall(multiOperatorHost.methods.operator, 1)
            const metadataOperator = await blockchainCall(multiOperatorHost.methods.operator, 4)
            if(mintOperator !== account && metadataOperator !== account) {
                collection = undefined
            } else {
                onStateEntry('mintOperator', mintOperator)
                onStateEntry('metadataOperator', metadataOperator)
            }
          } catch(e) {
            collection = undefined
          }
          setCollection(collection)
      })
    }, [state.collectionId])

    useEffect(() => {
      onStateEntry('disabled', collection ? undefined : true)
      if(collection && mode) {
        mode === 'mintNewItem' && mintNewItem()
        mode === 'changeMintOperator' && changeMintOperator()
        mode === 'changeMetadataOperator' && changeMetadataOperator()
      }
    }, [collection])

    function mintNewItem() {
        NameAndSymbol.prev = LoadCollection
        inputItem && delete NameAndSymbol.prev
        onStateEntry('item', 'new')
        onStateEntry('name')
        onStateEntry('symbol')
        onStateEntry('amount')
        onStateEntry('metadata', {background_color : '#000000'})
        onStateEntry('metadataLink')
        setComponentIndex(components.indexOf(NameAndSymbol))
    }

    function manageItems() {
        NameAndSymbol.prev = LoadItems
        setComponentIndex(components.indexOf(LoadItems))
    }

    function changeMintOperator() {
        inputItem && delete Host.prev
        onStateEntry('hostType', 'mint')
        onStateEntry('host', state.mintOperator)
        setComponentIndex(components.indexOf(Host))
    }

    function changeMetadataOperator() {
        inputItem && delete Host.prev
        onStateEntry('hostType', 'metadata')
        onStateEntry('host', state.metadataOperator)
        setComponentIndex(components.indexOf(Host))
    }

    async function onCollectionId(e) {
        var collectionId = e.currentTarget.value
        try {
            var rawData = await getRawField({ provider : web3.currentProvider }, rawData, 'collectionId')
            rawData && rawData !== '0x' && (collectionId = abi.decode(["bytes32"], rawData)[0])
        } catch(e) {
        }
        onStateEntry("collectionId", collectionId)
    }

    return (
    <>
        <div>
            <label className={style.CreationPageLabelF}>
                <h6>Collection address</h6>
                <input type="text" value={state.collectionId} onChange={onCollectionId}/>
                <p>Insert the address of the collection.</p>
            </label>
        </div>
        {state.collectionId && collection === null && <OurCircularProgress/>}
        {state.collectionId && collection && <div>
          <p className={style.CollectionSelectedd}>{collection.name} {collection.symbol}</p>
        </div>}
        {collection && state.mintOperator === account && <a className={style.CreateBTN2} onClick={mintNewItem}>New Item</a>}
        {collection && <a className={style.CreateBTN2} onClick={manageItems}>Manage Items</a>}
        {collection && state.mintOperator === account && <a className={style.CreateBTN2} onClick={changeMintOperator}>Mint Permissions</a>}
        {collection && state.metadataOperator === account && <a className={style.CreateBTN2} onClick={changeMetadataOperator}>Metadata Permissions</a>}
    </>)
}

const LoadItems = ({state, onStateEntry, setComponentIndex}) => {
    const context = useEthosContext()

    const web3Data = useWeb3()
    const { account, getGlobalContract, newContract } = web3Data

    const [items, setItems] = useState(null)

    const seaport = useOpenSea()

    useEffect(() => {
        onStateEntry('item')
        onStateEntry('name')
        onStateEntry('symbol')
        onStateEntry('metadata', {background_color : '#ffffff'})
        onStateEntry('metadataLink')
        onStateEntry('amount')
      setTimeout(async () => {
        const itemProjectionFactory = getGlobalContract('itemProjectionFactory')
        setItems(await loadItemsByFactories({seaport, context, ...web3Data, collectionData : await loadCollectionMetadata({context, ...web3Data, deep : true}, state.collectionId, newContract(context.ItemMainInterfaceABI, await blockchainCall(itemProjectionFactory.methods.mainInterface)))}, itemProjectionFactory))
      })
    }, [])

    useEffect(() => {
      if(!items || !state.item) {
        return
      }
      if(items.filter(it => it.address === state.item) === 0) {
          onStateEntry('item')
      }
    }, [items, state.item])

    const displayItems = items && [
        /*{
            address: 'new',
            label : 'Create a new one',
            name : state.name,
            symbol : state.symbol,
            metadataLink : state.metadataLink,
            metadata : state.metadata
        },*/
        ...items.map(item => ({
            address : item.address,
            label : `${item.name} (${item.symbol})`,
            name : item.name,
            symbol : item.symbol,
            metadataLink : item.uri,
            metadata : item.metadata
        }))
    ]

    function changeMetadata(item) {
        onStateEntry('item', item.address)
        onStateEntry('name', item.name)
        onStateEntry('symbol', item.symbol)
        onStateEntry('metadata', item.metadata)
        onStateEntry('metadataLink', item.metadataLink)
        setComponentIndex(components.indexOf(NameAndSymbol))
    }

    function mintMore(item) {
        onStateEntry('item', item.address)
        onStateEntry('name', item.name)
        onStateEntry('symbol', item.symbol)
        onStateEntry('metadataLink', item.metadataLink)
        setComponentIndex(components.indexOf(Mint))
    }

    return (
    <>
        <h6>Edit existing Item</h6>
        {!items && <OurCircularProgress/>}
        {items && <>
            {displayItems.map(it => <div className={style.ITEMMANAGESELECTOR} key={it.address}>
                <span>{it.label}</span>
                {account === state.metadataOperator && <a className={style.CreateBTN2} onClick={() => changeMetadata(it)}>Edit Metadata</a>}
                {account === state.mintOperator && <a className={style.CreateBTN2} onClick={() => mintMore(it)}>Mint</a>}
            </div>)}
        </>}
    </>)
}

const NameAndSymbol = ({state, onStateEntry}) => {

    useEffect(() => {
        onStateEntry("name", state.name)
        onStateEntry("symbol", state.symbol)
    }, [])

    useEffect(() => {
        onStateEntry("disabled", (state.name && state.symbol && (state.item !== 'new' || (state.amount && parseFloat(state.amount) && !isNaN(parseFloat(state.amount))))) ? undefined : true)
    }, [state.name, state.symbol, state.amount])

    return (<>
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
                <p>Insert a name for yout Item (example: Ethereum). You can change it later, With Metadata hosting permissions.</p>
            </label>
            <label className={style.CreationPageLabelF}>
                <h6>Symbol</h6>
                <input type="text" value={state.symbol} onChange={e => onStateEntry("symbol", e.currentTarget.value)}/>
                <p>Insert a symbol for yout Item (example: ETH). You can change it later, With Metadata hosting permissions.</p>
            </label>
        {state.item === 'new' && <>
            <label className={style.CreationPageLabelF}>
                <h6>Supply</h6>
                <input type="number" value={state.amount} onChange={e => onStateEntry("amount", e.currentTarget.value)}/>
                <p>The amount of existing supply for this new item.</p>
            </label>
        </>}
        </div>
    </>)
}

const Mint = ({state, onStateEntry}) => {

    useEffect(() => {
        onStateEntry("disabled", state.amount && !isNaN(parseFloat(state.amount)) && parseFloat(state.amount) ? undefined : true)
    }, [state.amount])

    return (<>
        <div className={style.CreationPageLabel}>
            <label className={style.CreationPageLabelF}>
            <h6>Mint more supply</h6>
                <input type="number" value={state.amount} onChange={e => onStateEntry("amount", e.currentTarget.value)}/>
                <p>Select the amount of new supply to mint.</p>
            </label>
        </div>
    </>)
}

const Host = ({state, onStateEntry}) => {

    useEffect(() => {
        onStateEntry("host", state.hostType === 'mint' ? state.mintOperator : state.metadataOperator)
    }, [])

    useEffect(() => {
        var disabled = state.host && state.host !== VOID_ETHEREUM_ADDRESS ? undefined : true
        try {
            web3Utils.toChecksumAddress(state.host)
        } catch(e) {
            disabled = true
        }
        onStateEntry("disabled", disabled)
    }, [state.host])

    return (<>
        <h6>{state.hostType === 'mint' ? 'Mint' : 'Metadata'} Permissions</h6>
        <div className={style.CreationPageLabel}>
            <label className={style.CreationPageLabelF}>
                <h6>Host</h6>
                <input type="text" value={state.host} onChange={e => onStateEntry("host", e.currentTarget.value)}/>
                <p>Change the address (wallet, MultiSig, Organization, or contract) that manages the hosting permissions for this function.</p>
            </label>
        </div>
    </>)
}

const MetadataField = ({state, onStateEntry, field, type, label, description, accept, mandatory}) => {
    return (
        <div className={style.CreationPageLabel}>
            <label className={style.CreationPageLabelF}>
                <h6>{label}{mandatory && <b>*</b>}:</h6>
                {type === 'textarea'
                    ? <textarea onChange={e => onStateEntry('metadata', ({...state.metadata, [field] : e.currentTarget.value}))}>{state.metadata[field]}</textarea>
                    : <input type={type || 'text'} accept={accept} ref={type !== 'file' ? undefined : ref => ref && (ref.files = state.metadata[field] instanceof FileList ? state.metadata[field] : (window.DataTransfer ? new window.DataTransfer().files : null))} value={type === 'file' ? undefined : state.metadata[field]} onChange={e => onStateEntry('metadata', ({...state.metadata, [field] : type === 'file' ? e.currentTarget.files : e.currentTarget.value}))}/>}
                {description && <p>{description}</p>}
            </label>
        </div>
    )
}

const Metadata = ({state, onStateEntry}) => {

    const context = useEthosContext()

    useEffect(() => {
        onStateEntry('metadata', state.metadata || { background_color : "#000000" })
        onStateEntry('metadataLink', state.metadataLink)
        onStateEntry('metadataType', state.metadataType || 'basic')
    }, [])

    useEffect(() => {
        if(!state.metadataType) {
            return
        }
        onStateEntry(state.metadataType === 'metadata' ? 'metadataLink' : 'metadata', state.metadataType === 'metadata' ? undefined : { background_color : "#000000", ...state.metadata })
    }, [state.metadataType])

    useEffect(() => {
        if(!state.metadataType) {
            return
        }
        var ipfsRegex = 'ipfs:\/\/ipfs\/(([a-z]|[A-Z]|[0-9]){46})$'
        if(state.metadataType === 'metadataLink') {
            delete Metadata.next
            Metadata.deploy = true
            return onStateEntry('disabled', state.metadataLink && (new RegExp(ipfsRegex).test(state.metadataLink)) ? undefined : true)
        }
        Metadata.next = TraitTypes
        delete Metadata.deploy
        state.metadataLink && onStateEntry('metadataLink')
        onStateEntry('disabled', !checkItemMetadata(state.metadata, itemMetadataTypes.filter(it => it.name === state.metadataType)[0]?.fields))

    }, [state.metadataType, state.metadata, state.metadataLink])

    useEffect(() => {
        if(!state.metadata?.image) {
            return
        }
        setTimeout(async () => {
            try {
                if(!await checkCoverSize({ context }, state.metadata.image, true)) {
                    throw "Cover size does not match requirements"
                }
            } catch(e) {
                var newMetadata = { ...state.metadata }
                delete newMetadata.image
                alert(e.message || e)
                onStateEntry('metadata', newMetadata)
            }
        })
    }, [state.metadata?.image])

    return (<>
        {!state.modal &&
         <div className={style.FancyExplanationCreate}>
            <h6>Metadata</h6>
            <div className={style.proggressCreate}>
                <div className={style.proggressCreatePerch} style={{width: "66%"}}>Step 2 of 3</div>
            </div>
        </div>}
        {state.modal && state.mode === 'changeMetadata' && <>
            <h6>Name and Symbol</h6>
            <div className={style.CreationPageLabel}>
                <label className={style.CreationPageLabelF}>
                    <h6>Name</h6>
                    <input type="text" value={state.name} onChange={e => onStateEntry("name", e.currentTarget.value)}/>
                    <p>Insert a name for yout Item (example: Ethereum). You can change it later, With Metadata hosting permissions.</p>
                </label>
                <label className={style.CreationPageLabelF}>
                    <h6>Symbol</h6>
                    <input type="text" value={state.symbol} onChange={e => onStateEntry("symbol", e.currentTarget.value)}/>
                    <p>Insert a symbol for yout Item (example: ETH). You can change it later, With Metadata hosting permissions.</p>
                </label>
            </div>
        </>}
        {state.modal && <h6>Change Item Metadata</h6>}
        <select className={style.CreationSelect} value={state.metadataType} onChange={e => onStateEntry('metadataType', e.currentTarget.value)}>
            {itemMetadataTypes.map(it => <option key={it.name} value={it.name}>{it.label}</option>)}
            <option value="metadataLink">Custom</option>
        </select>
        {state.metadataType === 'metadataLink' && <>
            <div className={style.CreationPageLabel}>
                <label className={style.CreationPageLabelF}>
                    <h6>Link</h6>
                    <input placeholder='ipfs://ipfs/...' type="text" value={state.metadataLink} onChange={e => onStateEntry("metadataLink", e.currentTarget.value)}/>
                    <p>Insert the IPFS link (ipfs://ipfs/[HASH]) of the metadata Json file.</p>
                </label>
            </div>
        </>}
        {state.metadataType && state.metadataType !== 'metadataLink' && <>
            {itemMetadataTypes.filter(it => it.name === state.metadataType)[0].fields.map(it => <MetadataField key={it.field} state={state} onStateEntry={onStateEntry} type={it.type || 'text'} field={it.field} label={it.label} description={it.description} mandatory={it.mandatory || false}/>)}
        </>}
    </>)
}

LoadItems.prev = LoadCollection

NameAndSymbol.prev = LoadItems
NameAndSymbol.next = Metadata

Metadata.prev = NameAndSymbol
Metadata.next = TraitTypes

TraitTypes.prev = Metadata
TraitTypes.deploy = true

Host.prev = LoadCollection
Host.deploy = true
Host.renounce = true

Mint.prev = LoadItems
Mint.deploy = true

const components = [
    LoadCollection,
    LoadItems,
    NameAndSymbol,
    Metadata,
    Host,
    Mint,
    TraitTypes
]

const CreateSuccess = ({success, state, close}) => {

    const context = useEthosContext()

    const history = useHistory()

    const { chainId, web3 } = useWeb3()

    useEffect(() => {
        setTimeout(async function() {
            if(!state.item) {
                return history.push(('/items/collections/' + state.collectionId))
            }
            if(state.item !== 'new') {
                var urlPath = '/items/' + state.item
                var currentURL = window.location.href.toLowerCase()
                if(currentURL.indexOf(urlPath.toLowerCase()) === -1) {
                    return history.push(urlPath)
                }
                return close && close()
            }
            const receipt = await web3.eth.getTransactionReceipt(success.transactionHash)
            const log = receipt.logs.filter(it => it.topics[0] === web3Utils.sha3('CollectionItem(bytes32,bytes32,uint256)'))[0]
            const itemAddress = abi.decode(['address'], log.topics[3])[0]
            history.push(('/items/' + itemAddress))
        })
    }, [success, state])

    return <OurCircularProgress/>

    return (<div>
        <h4>Operation Completed</h4>
        <a target="_blank" href={`${getNetworkElement({chainId, context}, "etherscanURL")}/tx/${success.transactionHash}`}>Transaction</a>
      </div>)
  }

const CreateItem = ({inputItem, mode, close}) => {

    const { pathname } = useLocation()

    const context = useEthosContext()

    const { ipfsHttpClient, getGlobalContract, newContract, account } = useWeb3()

    const [state, setState] = useState({})

    const [componentIndex, setComponentIndex] = useState()

    const [success, setSuccess] = useState(null)

    function onStateEntry(key, value) {
        setState(oldState => {
            var newState = {...oldState, [key] : value, mode}
            value === undefined && delete newState[key]
            return newState
        })
    }

    useEffect(() => {
        var component = pathname.split('/')
        component = component[component.length - 1].trim()
        if(!component) {
          return setComponentIndex(0)
        }
        setTimeout(async () => {

          if(inputItem) {
            onStateEntry('modal', true)
            component.length === 42 && delete Mint.prev
            component.length === 42 && delete Metadata.prev
          }

          const itemProjectionFactory = getGlobalContract('itemProjectionFactory')
          const mainInterface = newContract(context.ItemMainInterfaceABI, await blockchainCall(itemProjectionFactory.methods.mainInterface))

          var collectionId = component

          if(component.length === 42) {
            const itemId = abi.decode(["uint256"], abi.encode(["address"], [component]))[0].toString()
            const item = await blockchainCall(mainInterface.methods.item, itemId)
            collectionId = item.collectionId
            onStateEntry('item', component)
            onStateEntry('name', item.header.name)
            onStateEntry('symbol', item.header.symbol)
            onStateEntry('metadataLink', item.header.uri)
            var metadata = inputItem
            while(metadata.metadata) {
                metadata = metadata.metadata
            }
            inputItem && mode === 'changeMetadata' && onStateEntry('metadata', metadata)
          }

          try {
            var collection = await blockchainCall(mainInterface.methods.collection, collectionId)
            const multiOperatorHost = newContract(context.MultiOperatorHostABI, collection.host)
            const mintOperator = await blockchainCall(multiOperatorHost.methods.operator, 1)
            const metadataOperator = await blockchainCall(multiOperatorHost.methods.operator, 4)
            if(mintOperator !== account && metadataOperator !== account) {
                return setComponentIndex(0)
            } else {
                onStateEntry('collectionId', collectionId)
                onStateEntry('mintOperator', mintOperator === account)
                onStateEntry('metadataOperator', metadataOperator === account)
                setComponentIndex(components.indexOf(LoadCollection))
                component.length === 42 && delete NameAndSymbol.prev
                component.length === 42 && setComponentIndex(components.indexOf(mode === 'changeMetadata' ? Metadata : Mint))
            }
          } catch(e) {
            return setComponentIndex(0)
          }
        })
    }, [pathname, inputItem])

    if(componentIndex === undefined) {
        return <OurCircularProgress/>
    }

    const Component = components[componentIndex]

    const nextComponentIndex = components.indexOf(Component.next)
    const previousComponentIndex = components.indexOf(Component.prev)

    return (
        <div className={style.CreatePage}>
            {success && <RegularModal>
                <CreateSuccess success={success} state={state} close={close}/>
            </RegularModal>}
            <Component state={state} inputItem={inputItem} mode={mode} onStateEntry={onStateEntry} setComponentIndex={setComponentIndex}/>
            <div className={style.ActionDeploy}>
                {previousComponentIndex !== -1 && <a className={style.Web3BackBTN} onClick={() => setComponentIndex(previousComponentIndex)}>Back</a>}
                {nextComponentIndex !== -1 && <a className={style.RegularButton + (state?.disabled ? (' ' + style.disabled) : '')} onClick={() => !state.disabled && setComponentIndex(nextComponentIndex)}>Next</a>}
                {Component.renounce && <ActionAWeb3Button onSuccess={setSuccess} className={style.Web3CustomBTN} onClick={() => deployItem({ newContract, account, context, ipfsHttpClient, projectionFactory : getGlobalContract('itemProjectionFactory') }, {...state, host : VOID_ETHEREUM_ADDRESS})}>Renounce Ownership</ActionAWeb3Button>}
                {Component.deploy && <ActionAWeb3Button onSuccess={setSuccess} className={style.Web3CustomBTN + (state?.disabled ? (' ' + style.disabled) : '')} onClick={() => deployItem({ newContract, account, context, ipfsHttpClient, projectionFactory : getGlobalContract('itemProjectionFactory') }, state)}>Submit</ActionAWeb3Button>}
            </div>
        </div>
    )
}

CreateItem.menuVoice = {
  path : '/items/create/item/:id'
}

export default CreateItem