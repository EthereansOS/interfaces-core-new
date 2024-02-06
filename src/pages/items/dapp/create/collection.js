import React, { useEffect, useState } from 'react'

import ActionAWeb3Button from '../../../../components/Global/ActionAWeb3Button'

import {
  useEthosContext,
  web3Utils,
  useWeb3,
  getNetworkElement,
} from 'interfaces-core'

import RegularModal from '../../../../components/Global/RegularModal'

import {
  checkCoverSize,
  checkCollectionMetadata,
  deployCollection,
} from '../../../../logic/itemsV2'

import style from '../../../../all.module.css'
import OurCircularProgress from '../../../../components/Global/OurCircularProgress'
import { Link, useHistory } from 'react-router-dom'

const NameAndSymbol = ({ value, onChange, onNext, onPrev }) => {
  useEffect(
    () =>
      setTimeout(async () => {
        if (!value) {
          return
        }
        var error

        JSON.stringify(error) !== JSON.stringify(value.error) &&
          onChange({ ...value, error })
      }),
    [value]
  )

  return (
    <div className={style.CreationPageLabel}>
      <div className={style.FancyExplanationCreate}>
        <h2>Basic Info</h2>
        <p>Lorem ispums im dolor amed asid</p>
      </div>
      <label className={style.CreationPageLabelF}>
        <h6>Name</h6>
        <p>Insert a name for your collection.</p>
        <input
          type="text"
          value={value?.name}
          placeholder="Collection name"
          onChange={(e) => onChange({ ...value, name: e.currentTarget.value })}
        />
        {value?.error?.name && <p>{value.error.name}</p>}
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Symbol</h6>
        <p>Insert a symbol for your collection.</p>
        <input
          type="text"
          value={value?.symbol}
          placeholder="Collection symbol"
          onChange={(e) =>
            onChange({ ...value, symbol: e.currentTarget.value })
          }
        />
        {value?.error?.symbol && <p>{value.error.symbol}</p>}
      </label>
      <div className={style.WizardFooter}>
        <button className={style.WizardFooterNext} onClick={onNext}>
          Next
        </button>
      </div>
    </div>
  )
}

const Host = ({ value, onChange, onNext, onPrev }) => {
  useEffect(
    () =>
      setTimeout(async () => {
        if (!value) {
          return
        }
        var error

        JSON.stringify(error) !== JSON.stringify(value.error) &&
          onChange({ ...value, error })
      }),
    [value]
  )
  // FIXME
  //   useEffect(() => {
  //     var disabled = value?.host && value?.metadataHost ? undefined : true
  //     try {
  //       web3Utils.toChecksumAddress(value?.host)
  //     } catch (e) {
  //       disabled = true
  //     }
  //     try {
  //       web3Utils.toChecksumAddress(value?.metadataHost)
  //     } catch (e) {
  //       disabled = true
  //     }
  //     value.disabled = disabled
  //   }, [value?.host, value?.metadataHost])

  return (
    <div className={style.CreationPageLabel}>
      <div className={style.FancyExplanationCreate}>
        <h2>Host</h2>
        <p>Lorem ispums im dolor amed asid</p>
      </div>
      <label className={style.CreationPageLabelF}>
        <h6>
          Mint Host
          <span
            className={style.CreationPageLabelFloatRight}
            onClick={() =>
              onChange({
                ...value,
                host: '0x37C5EfD20dd9c3D5922843a4Ab7787c7978A6a83',
              })
            }>
            Insert your current address
          </span>
        </h6>
        <p>
          An address (wallet, MultiSig, Organization, or contract) that manages
          the mint function of this collection. The host can mint new Items and
          their quantity. The host can also change or renounce the mint
          permission.
        </p>
        <input
          type="text"
          placeholder="Mint host address"
          value={value?.host}
          onChange={(e) => onChange({ ...value, host: e.currentTarget.value })}
        />
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>
          Metadata Host
          <span
            className={style.CreationPageLabelFloatRight}
            onClick={() =>
              onChange({
                ...value,
                metadataHost: '0x37C5EfD20dd9c3D5922843a4Ab7787c7978A6a83',
              })
            }>
            Insert your current address
          </span>
        </h6>
        <p>
          An address (wallet, MultiSig, Organization, or contract) that manages
          the information of this collection. The host can change the metadata
          of the items. The host can also change or renounce the metadata
          permissions.
        </p>
        <input
          type="text"
          placeholder="Metadata host address"
          value={value?.metadataHost}
          onChange={(e) =>
            onChange({ ...value, metadataHost: e.currentTarget.value })
          }
        />
      </label>
      <div className={style.WizardFooter}>
        <button className={style.WizardFooterBack} onClick={onPrev}>
          Back
        </button>
        <button className={style.WizardFooterNext} onClick={onNext}>
          Next
        </button>
      </div>
    </div>
  )
}

function extractFile(files) {
  var file

  try {
    file = file || files.item(0)
  } catch (e) {}

  try {
    file = file || files.get(0)
  } catch (e) {}

  try {
    file = file || files[0]
  } catch (e) {}

  var container = new DataTransfer()
  container.items.add(file)
  var newList = container.files
  return newList
}

const MetadataField = ({
  state,
  onStateEntry,
  field,
  type,
  label,
  description,
  accept,
  mandatory,
}) => {
  return (
    <label className={style.CreationPageLabelF}>
      <h6>
        {label}
        {mandatory && <b>*</b>}:
      </h6>
      {description && <p>{description}</p>}
      {type === 'textarea' ? (
        <textarea
          onChange={(e) =>
            onStateEntry('metadata', {
              ...state.metadata,
              [field]: e.currentTarget.value,
            })
          }>
          {state.metadata[field]}
        </textarea>
      ) : (
        <input
          type={type || 'text'}
          accept={accept}
          ref={
            type !== 'file'
              ? undefined
              : (ref) =>
                  ref &&
                  (ref.files =
                    state.metadata[field] ||
                    (window.DataTransfer
                      ? new window.DataTransfer().files
                      : null))
          }
          value={type === 'file' ? undefined : state.metadata[field]}
          onChange={(e) =>
            onStateEntry('metadata', {
              ...state.metadata,
              [field]:
                type === 'file'
                  ? extractFile(e.currentTarget.files)
                  : e.currentTarget.value,
            })
          }
        />
      )}
    </label>
  )
}

const Metadata = ({ state, value, onStateEntry, onChange, onNext, onPrev }) => {
  const context = useEthosContext()

  useEffect(() => {
    onStateEntry('metadata', state.metadata || { background_color: '#ffffff' })
    onStateEntry('metadataLink', state.metadataLink)
    onStateEntry('metadataType', state.metadataType || 'metadata')
  }, [])

  useEffect(() => {
    if (!state.metadataType) {
      return
    }
    onStateEntry(
      state.metadataType === 'metadata' ? 'metadataLink' : 'metadata',
      state.metadataType === 'metadata'
        ? undefined
        : { background_color: '#000000' }
    )
  }, [state.metadataType])

  useEffect(() => {
    if (!state.metadataType) {
      return
    }
    var ipfsRegex = 'ipfs://ipfs/(([a-z]|[A-Z]|[0-9]){46})$'
    if (state.metadataType === 'metadataLink') {
      return onStateEntry(
        'disabled',
        state.metadataLink && new RegExp(ipfsRegex).test(state.metadataLink)
          ? undefined
          : true
      )
    }
    onStateEntry('disabled', !checkCollectionMetadata(state.metadata))
  }, [state.metadataType, state.metadata, state.metadataLink])

  useEffect(() => {
    if (!state.metadata?.image) {
      return
    }
    setTimeout(async () => {
      try {
        if (!(await checkCoverSize({ context }, state.metadata.image, true))) {
          throw 'Cover size does not match requirements'
        }
      } catch (e) {
        var newMetadata = { ...state.metadata }
        delete newMetadata.image
        alert(e.message || e)
        onStateEntry('metadata', newMetadata)
      }
    })
  }, [state.metadata?.image])

  const [selectedImage, setSelectedImage] = useState(null)
  const [triggerTextInput, setTriggerTextInput] = useState(false)

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(URL.createObjectURL(e.target.files[0]))
    }
  }

  return (
    <div className={style.CreationPageLabel}>
      <div className={style.FancyExplanationCreate}>
        <h2>Metadata</h2>
        <p>Lorem ispums im dolor amed asid</p>
      </div>
      <div className={style.MetadataSelection}>
        <select
          className={style.CreationSelect}
          value={state.metadataType}
          onChange={(e) => onStateEntry('metadataType', e.currentTarget.value)}>
          <option value="metadata">Basic</option>
          <option value="metadataLink">Custom</option>
        </select>
      </div>

      {state.metadataType === 'metadataLink' && (
        <>
          <div>
            <label className={style.CreationPageLabelF}>
              <h6>Link</h6>
              <input
                placeholder="ipfs://ipfs/..."
                type="text"
                value={state.metadataLink}
                onChange={(e) =>
                  onStateEntry('metadataLink', e.currentTarget.value)
                }
              />
            </label>
          </div>
        </>
      )}
      {state.metadataType === 'metadata' && (
        <>
          <MetadataField
            state={state}
            onStateEntry={onStateEntry}
            type="textarea"
            field="description"
            label="Description"
            mandatory
            description="A description of the collection"
          />
          <div className={style.CreationPageLabelFDivide}>
            <label
              className={style.CreationPageLabelF}
              style={{ verticalAlign: 'bottom', Display: 'flex' }}>
              <h6>
                Logo*
                {!triggerTextInput && (
                  <span
                    className={style.CreationPageLabelFloatRight}
                    onClick={() => setTriggerTextInput(true)}>
                    or indicate an image URL
                  </span>
                )}
                {triggerTextInput && (
                  <span
                    className={style.CreationPageLabelFloatRight}
                    onClick={() => setTriggerTextInput(false)}>
                    or indicate an image file
                  </span>
                )}
              </h6>
              {!triggerTextInput && (
                <p>Select an image file, square size recomended.</p>
              )}
              {triggerTextInput && (
                <p>
                  A valid link for your collection's logo. Square size
                  recomended.
                </p>
              )}
              {!triggerTextInput && (
                <div className={style.imageSelectorContaine}>
                  {!selectedImage && (
                    <input
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  )}
                  {selectedImage && (
                    <div className={style.ImagePreview}>
                      <img src={selectedImage} alt="Selected" />
                      <div
                        className={style.ImagePreviewLabel}
                        onClick={() => setSelectedImage(null)}>
                        Replace Image
                      </div>
                    </div>
                  )}
                </div>
              )}

              {triggerTextInput && (
                <input
                  type="link"
                  value={value?.image}
                  placeholder="Collection Logo URL"
                  onChange={(e) =>
                    onChange({ ...value, image: e.currentTarget.value })
                  }
                />
              )}
              {value?.error?.image && <p>{value.error.image}</p>}
            </label>
            <label className={style.CreationPageLabelF}>
              <h6>Website</h6>
              <p>A link to the official website of this project (if any)</p>
              <input
                type="link"
                value={value?.external_url}
                placeholder="Website (if any)"
                onChange={(e) =>
                  onChange({ ...value, external_url: e.currentTarget.value })
                }
              />

              {value?.error?.url && <p>{value.error.url}</p>}
            </label>

            <MetadataField
              state={state}
              onStateEntry={onStateEntry}
              field="discussion_url"
              label="Discussion Link"
              description="A link to a social hub and/or discussion channel for the collection (if any)"
            />

            <MetadataField
              state={state}
              onStateEntry={onStateEntry}
              field="github_url"
              label="Github Link"
              description="A link to the official repo of this project (if any)"
            />

            <MetadataField
              state={state}
              onStateEntry={onStateEntry}
              type="color"
              field="background_color"
              label="Background Color"
              mandatory
              description="The background color of your collection logo. This color will fill any empty space that the logo leaves if it doesn’t match any standard box in the interface."
            />
          </div>

          <div className={style.WizardFooter}>
            <button className={style.WizardFooterBack} onClick={onPrev}>
              Back
            </button>
            <button className={style.WizardFooterNext} onClick={onNext}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}

Metadata.deploy = true

const CreateSuccess = ({ success }) => {
  const context = useEthosContext()

  const history = useHistory()

  const { chainId, web3 } = useWeb3()

  const [collectionId, setCollectionId] = useState()

  useEffect(() => {
    setCollectionId()
    setTimeout(async function () {
      const receipt = await web3.eth.getTransactionReceipt(
        success.transactionHash
      )
      const log = receipt.logs.filter(
        (it) =>
          it.topics[0] === web3Utils.sha3('Collection(address,address,bytes32)')
      )[0]
      setCollectionId(log.topics[3])
      history.push('/items/collections/' + log.topics[3])
    })
  }, [success])

  return <OurCircularProgress />

  return (
    <div>
      <h4>Operation Completed</h4>
      <a
        target="_blank"
        href={`${getNetworkElement({ chainId, context }, 'etherscanURL')}/tx/${
          success.transactionHash
        }`}>
        Transaction
      </a>
      {!collectionId && <OurCircularProgress />}
      {collectionId && (
        <>
          <Link to={'/items/collections/' + collectionId}>View Collection</Link>
          <Link to={'/items/create/item/' + collectionId}>Mint Items</Link>
        </>
      )}
    </div>
  )
}

const CreateCollection = ({}) => {
  const context = useEthosContext()

  const { ipfsHttpClient, getGlobalContract } = useWeb3()

  const [state, setState] = useState({})

  const [componentIndex, setComponentIndex] = useState(0)

  const [success, setSuccess] = useState(null)

  const [step, setStep] = useState(0)
  const [disabled, setDisabled] = useState(false)

  function onStateEntry(key, value) {
    setState((oldState) => {
      var newState = { ...oldState, [key]: value }
      value === undefined && delete newState[key]
      return newState
    })
  }

  return (
    <div className={style.CreatePage}>
      {/* {success && (
        <RegularModal>
          <CreateSuccess success={success} />
        </RegularModal>
      )} */}
      <div className={style.WizardStepsList}>
        <ul>
          <li className={step === 0 ? style.WizardStepsListActive : ''}>
            Basic Info
          </li>
          <li className={step === 1 ? style.WizardStepsListActive : ''}>
            Host
          </li>
          <li className={step === 2 ? style.WizardStepsListActive : ''}>
            Metadata
          </li>
        </ul>
      </div>
      <div className={style.WizardHeader}>
        <h3>
          Create a new Collection <span>step {step + 1} of 3</span>
        </h3>
        <div className={style.WizardHeaderDescription}>
          Lorem ispum sim dolor amed asid avec mono on alor
        </div>
        <div className={style.WizardProgress}>
          <div
            className={style.WizardProgressBar}
            style={{
              width: ((100 / 3) * step > 0 ? (100 / 3) * step : 1) + '%',
            }}></div>
        </div>
      </div>
      <div className={style.WizardStep}>
        {step == 0 && (
          <NameAndSymbol
            value={state?.nameandsymbol}
            onChange={(value) => setState({ ...state, nameandsymbol: value })}
            onNext={() => setStep(1)}
            onPrev={() => setStep(0)}
          />
        )}
        {step == 1 && (
          <Host
            state={state}
            value={state?.host}
            onStateEntry={onStateEntry}
            onChange={(value) => setState({ ...state, host: value })}
            onNext={() => setStep(2)}
            onPrev={() => setStep(0)}
          />
        )}

        {step == 2 && (
          <Metadata
            state={state}
            value={state?.metadata}
            onStateEntry={onStateEntry}
            onChange={(value) => setState({ ...state, metadata: value })}
            onNext={() => setStep(3)}
            onPrev={() => setStep(1)}
          />
        )}
      </div>

      {/* <div className={style.ActionBTNCreateX}>
        {Component.deploy && (
          <ActionAWeb3Button
            onSuccess={setSuccess}
            className={
              style.Web3CustomBTN +
              (state?.disabled ? ' ' + style.disabled : '')
            }
            onClick={() =>
              deployCollection(
                {
                  context,
                  ipfsHttpClient,
                  projectionFactory: getGlobalContract('itemProjectionFactory'),
                },
                state
              )
            }>
            Deploy
          </ActionAWeb3Button>
        )}
      </div> */}
    </div>
  )
}

CreateCollection.menuVoice = {
  path: '/items/create/collection',
}

export default CreateCollection
