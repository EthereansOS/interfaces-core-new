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

import getCurrentAddress from 'interfaces-core/lib/web3/getCurrentAddress'

import Select from 'react-select'

const NameAndSymbol = ({ value, onChange, onNext, onPrev }) => {
  const [disabled, setDisabled] = useState()
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

  useEffect(() => {
    setDisabled(value?.name && value?.symbol ? false : true)
  }, [value])

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
        <button
          className={style.WizardFooterNext}
          disabled={disabled}
          onClick={onNext}>
          Next
        </button>
      </div>
    </div>
  )
}

const Host = ({ value, onChange, onNext, onPrev }) => {
  const [disabled, setDisabled] = useState()

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

  useEffect(() => {
    var dis = value?.host && value?.metadataHost ? false : true
    setDisabled(dis)
    try {
      web3Utils.toChecksumAddress(value?.host)
    } catch (e) {
      setDisabled(true)
    }
    try {
      web3Utils.toChecksumAddress(value?.metadataHost)
    } catch (e) {
      setDisabled(true)
    }
    setDisabled(dis)
  }, [value])

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
                host: getCurrentAddress(),
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
          value={value?.host ?? ''}
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
                metadataHost: getCurrentAddress(),
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
          value={value?.metadataHost ?? ''}
          onChange={(e) =>
            onChange({ ...value, metadataHost: e.currentTarget.value })
          }
        />
      </label>
      <div className={style.WizardFooter}>
        <button className={style.WizardFooterBack} onClick={onPrev}>
          Back
        </button>
        <button
          className={style.WizardFooterNext}
          disabled={disabled}
          onClick={onNext}>
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

const Metadata = ({ value, onChange, onNext, onPrev }) => {
  const context = useEthosContext()

  useEffect(() => {
    if (!value?.metadataType) {
      onChange({ ...value, metadataType: 'metadata' })
    }
  }, [value, onChange])

  useEffect(() => {
    if (!value?.metadataType) {
      return
    }
    var ipfsRegex = 'ipfs://ipfs/(([a-z]|[A-Z]|[0-9]){46})$'
    if (value.metadataType === 'metadataLink') {
      setDisabled(
        value.metadataLink && new RegExp(ipfsRegex).test(value.metadataLink)
          ? false
          : true
      )
    }

    if (value.metadataType === 'metadata') {
      setDisabled(!checkCollectionMetadata(value.metadata))
    }
  }, [value, onChange])

  // FIXME
  // useEffect(() => {
  //   if (!value.metadata?.image) {
  //     return
  //   }
  //   setTimeout(async () => {
  //     try {
  //       if (!(await checkCoverSize({ context }, value.metadata.image, true))) {
  //         throw 'Cover size does not match requirements'
  //       }
  //     } catch (e) {
  //       var newMetadata = { ...value.metadata }
  //       delete newMetadata.image
  //       alert(e.message || e)
  //       onStateEntry('metadata', newMetadata)
  //     }
  //   })
  // }, [value.metadata?.image])
  const [disabled, setDisabled] = useState()
  const [selectedImage, setSelectedImage] = useState(null)
  const [triggerTextInput, setTriggerTextInput] = useState(false)
  const [hex, updateHex] = useState('#6f6fae')

  const handleInput = (e) => {
    updateHex(e.target.value)
  }

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
          value={value?.metadataType}
          onChange={(e) =>
            onChange({ ...value, metadataType: e.currentTarget.value })
          }>
          <option value="metadata">Basic</option>
          <option value="metadataLink">Custom</option>
        </select>
      </div>

      {value?.metadataType === 'metadataLink' && (
        <>
          <div>
            <label className={style.CreationPageLabelF}>
              <h6>Link</h6>
              <p>Enter the link for your custom collection's metadata</p>
              <input
                placeholder="ipfs://ipfs/..."
                type="text"
                value={value?.metadataLink ?? ''}
                onChange={(e) =>
                  onChange({ ...value, metadataLink: e.currentTarget.value })
                }
              />
            </label>
          </div>
        </>
      )}
      {value?.metadataType === 'metadata' && (
        <>
          <label className={style.CreationPageLabelF}>
            <h6>Description*</h6>
            <p>Enter the description of your Collection</p>
            <textarea
              value={value?.description}
              onChange={(e) =>
                onChange({ ...value, description: e.currentTarget.value })
              }
              mandatory="true"
              placeholder="Describe your Collection"
            />
            {value?.error?.description && <p>{value.error.description}</p>}
          </label>

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

              {value?.error?.external_url && <p>{value.error.external_url}</p>}
            </label>

            <label className={style.CreationPageLabelF}>
              <h6>Discussion Link</h6>
              <p>
                A link to a social hub and/or discussion channel for the
                collection (if any)
              </p>
              <input
                type="link"
                value={value?.discussion_url}
                placeholder="Discussion link (if any)"
                onChange={(e) =>
                  onChange({ ...value, discussion_url: e.currentTarget.value })
                }
              />

              {value?.error?.discussion_url && (
                <p>{value.error.discussion_url}</p>
              )}
            </label>

            <label className={style.CreationPageLabelF}>
              <h6>Github Link</h6>
              <p>A link to the official repo of this project (if any)</p>
              <input
                type="link"
                value={value?.github_url}
                placeholder="Github link (if any)"
                onChange={(e) =>
                  onChange({ ...value, github_url: e.currentTarget.value })
                }
              />

              {value?.error?.github_url && <p>{value.error.github_url}</p>}
            </label>

            <label className={style.CreationPageLabelF}>
              <h6>Background Color*</h6>
              <p>
                The background color of your collection logo. This color will
                fill any empty space that the logo leaves if it doesn’t match
                any standard box in the interface.
              </p>
              <ColorPicker onChange={handleInput} value={hex} />
              {value?.error?.background_color && (
                <p>{value.error.background_color}</p>
              )}
            </label>
          </div>
        </>
      )}
      <div className={style.WizardFooter}>
        <button className={style.WizardFooterBack} onClick={onPrev}>
          Back
        </button>
        <button
          disabled={disabled}
          className={style.WizardFooterNext}
          onClick={onNext}>
          Next
        </button>
      </div>
    </div>
  )
}

const ColorPicker = (props) => {
  return (
    <div className={style.ColorPickerContainer}>
      <input
        type="color"
        {...props}
        field="background_color"
        mandatory="true"
      />
      <input type="text" {...props} />
    </div>
  )
}

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

  const [success, setSuccess] = useState(null)

  const [step, setStep] = useState(0)

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
            value={state?.hostSection}
            onChange={(value) => setState({ ...state, hostSection: value })}
            onNext={() => setStep(2)}
            onPrev={() => setStep(0)}
          />
        )}

        {step == 2 && (
          <Metadata
            value={state?.metadata}
            onChange={(value) => setState({ ...state, metadata: value })}
            onNext={() => setStep(3)}
            onPrev={() => setStep(1)}
          />
        )}

        {step == 3 && (
          <Confirmation
            value={state?.confirmation}
            onChange={(value) => setState({ ...state, confirmation: value })}
            onPrev={() => setStep(2)}
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
