import React, { useEffect, useState, useMemo } from 'react'

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

import uploadToIPFS from 'interfaces-core/lib/web3/uploadToIPFS'
import { create as createIpfsHttpClient } from 'ipfs-http-client'
import CircularProgress from '../../../../components/Global/OurCircularProgress'
import getFileFromBlobURL from 'interfaces-core/lib/web3/getFileFromBlobURL'

function initializeIPFSClient(context) {
  var options = {
    ...context.infuraIPFSOptions,
    headers: {
      authorization: 'Basic ' + context.infuraAPIKey,
    },
  }
  var client = createIpfsHttpClient(options)
  return client
}

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
      </div>
      <label className={style.CreationPageLabelF}>
        <h6>Name</h6>
        <p>Insert a name for your collection.</p>
        <input
          type="text"
          value={value?.name ?? ''}
          placeholder="Collection name"
          onChange={(e) => onChange({ ...value, name: e.currentTarget.value })}
        />
        {value?.error?.name && (
          <p className={style.ErrorMessage}>{value.error.name}</p>
        )}
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Symbol</h6>
        <p>Insert a symbol for your collection.</p>
        <input
          type="text"
          value={value?.symbol ?? ''}
          placeholder="Collection symbol"
          onChange={(e) =>
            onChange({ ...value, symbol: e.currentTarget.value })
          }
        />
        {value?.error?.symbol && (
          <p className={style.ErrorMessage}>{value.error.symbol}</p>
        )}
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
  const ipfsHttpClient = useMemo(() => initializeIPFSClient(context), [context])
  const background_color_default = '#6f6fae'
  const [disabled, setDisabled] = useState()
  const [selectedImage, setSelectedImage] = useState(null)
  const [triggerTextInput, setTriggerTextInput] = useState(false)

  useEffect(() => {
    if (!value?.metadataType) {
      onChange({ ...value, metadataType: 'metadata' })
    }
  }, [value, onChange])

  useEffect(() => {
    if (!value) {
      return
    }

    value.error = {}

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
      if (value.background_color == null) {
        value.background_color = background_color_default
      }

      if (value?.image && value.image.includes('ipfs')) {
        if (!new RegExp(ipfsRegex).test(value.image)) {
          value.image = ''
          value.error = {
            image: 'Invalid IPFS link',
          }
        }
      }
      setDisabled(!checkCollectionMetadata(value))
    }
  }, [value, onChange])

  const handleBlur = () => {
    onChange(value)
  }

  useEffect(() => {
    if (!value?.image) {
      return
    }

    setTimeout(async () => {
      try {
        if (!(await checkCoverSize({ context }, value.image, true))) {
          throw 'Cover size does not match requirements'
        }
      } catch (e) {
        value.image = ''
        alert(e.message || e)
      }
    })
  }, [value, onChange])

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      value.image = ''
      setSelectedImage(URL.createObjectURL(e.target.files[0]))
      value.file = selectedImage ?? null
      value.image = selectedImage == null ? value?.image : ''
    }
    setDisabled(!checkCollectionMetadata(value))
  }

  useEffect(() => {
    if (value) {
      if (value.file) setSelectedImage(value.file)
      value.file = selectedImage ?? null
      value.image = selectedImage == null ? value?.image : ''
    }
    setDisabled(!checkCollectionMetadata(value))
  }, [selectedImage, onChange])

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
            {value?.error?.description && (
              <p className={style.ErrorMessage}>{value.error.description}</p>
            )}
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
                  value={value?.image ?? ''}
                  placeholder="Collection Logo URL"
                  onChange={(e) =>
                    onChange({ ...value, image: e.currentTarget.value })
                  }
                  onBlur={handleBlur}
                />
              )}
              {value?.error?.image && (
                <p className={style.ErrorMessage}>{value.error.image}</p>
              )}
            </label>
            <label className={style.CreationPageLabelF}>
              <h6>Website</h6>
              <p>A link to the official website of this project (if any)</p>
              <input
                type="link"
                value={value?.external_url ?? ''}
                placeholder="Website (if any)"
                onChange={(e) =>
                  onChange({ ...value, external_url: e.currentTarget.value })
                }
              />

              {value?.error?.external_url && (
                <p className={style.ErrorMessage}>{value.error.external_url}</p>
              )}
            </label>

            <label className={style.CreationPageLabelF}>
              <h6>Discussion Link</h6>
              <p>
                A link to a social hub and/or discussion channel for the
                collection (if any)
              </p>
              <input
                type="link"
                value={value?.discussion_url ?? ''}
                placeholder="Discussion link (if any)"
                onChange={(e) =>
                  onChange({ ...value, discussion_url: e.currentTarget.value })
                }
              />

              {value?.error?.discussion_url && (
                <p className={style.ErrorMessage}>
                  {value.error.discussion_url}
                </p>
              )}
            </label>

            <label className={style.CreationPageLabelF}>
              <h6>Github Link</h6>
              <p>A link to the official repo of this project (if any)</p>
              <input
                type="link"
                value={value?.github_url ?? ''}
                placeholder="Github link (if any)"
                onChange={(e) =>
                  onChange({ ...value, github_url: e.currentTarget.value })
                }
              />

              {value?.error?.github_url && (
                <p className={style.ErrorMessage}>{value.error.github_url}</p>
              )}
            </label>

            <label className={style.CreationPageLabelF}>
              <h6>Background Color*</h6>
              <p>
                The background color of your collection logo. This color will
                fill any empty space that the logo leaves if it doesn’t match
                any standard box in the interface.
              </p>
              <ColorPicker
                onChange={(e) =>
                  onChange({
                    ...value,
                    background_color: e.currentTarget.value,
                  })
                }
                value={value?.background_color ?? background_color_default}
              />
              {value?.error?.background_color && (
                <p className={style.ErrorMessage}>
                  {value.error.background_color}
                </p>
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
      <input type="color" {...props} mandatory="true" />
      <input type="text" {...props} />
    </div>
  )
}

const Confirmation = ({ value, onChange, onNext, onPrev, state }) => {
  const context = useEthosContext()
  const ipfsHttpClient = useMemo(() => initializeIPFSClient(context), [context])
  const { chainId, web3 } = useWeb3()
  const [isMetadataListOdd, setIsMetadataListOdd] = useState(true)
  const { getGlobalContract } = useWeb3()
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const [collectionId, setCollectionId] = useState()
  const history = useHistory()

  const prepareDeploy = async () => {
    setLoading(true)
    var errorMessage
    try {
      if (state?.metadata?.file) {
        state.metadata.image = await uploadToIPFS(
          { context, ipfsHttpClient },
          await getFileFromBlobURL(state.metadata.file)
        )
      }

      if (state?.metadata) {
        delete state.metadata.error
        delete state.metadata.file
      }

      const result = await deployCollection(
        {
          context,
          ipfsHttpClient,
          projectionFactory: getGlobalContract('itemProjectionFactory'),
        },
        state
      )
      setSuccess(result)
    } catch (e) {
      errorMessage = e.message || e
      setSuccess(false)
    }
    setLoading(false)
    errorMessage && setTimeout(() => alert(errorMessage))
  }

  useEffect(
    () =>
      setTimeout(async () => {
        if (!value || !state) {
          return
        }
        var error

        JSON.stringify(error) !== JSON.stringify(value.error) &&
          onChange({ ...value, error })
      }),
    [value]
  )

  useEffect(
    () =>
      setTimeout(async () => {
        setIsMetadataListOdd(true)

        if (!state || !state.metadata) {
          return
        }

        if (state.metadata.metadataType == 'metadata') {
          const excludedKeys = [
            'metadataType',
            'image',
            'description',
            'error',
            'file',
          ]

          let count = 0
          for (const key in state.metadata) {
            if (!excludedKeys.includes(key)) {
              count++
            }
          }
          setIsMetadataListOdd(count % 2 !== 0)
        }
      }),
    [state]
  )

  useEffect(() => {
    setCollectionId()
    setTimeout(async function () {
      if (!success) {
        return
      }
      const receipt = await web3.eth.getTransactionReceipt(
        success.transactionHash
      )
      const log = receipt.logs.filter(
        (it) =>
          it.topics[0] === web3Utils.sha3('Collection(address,address,bytes32)')
      )[0]
      setCollectionId(log.topics[3])
    })
  }, [success])

  return (
    <>
      {loading && <CircularProgress />}
      {!success && !loading && (
        <div className={style.CreationPageLabel}>
          <div className={style.FancyExplanationCreate}>
            <h2>Confirmation</h2>
          </div>

          <h6
            style={{
              textAlign: 'left',
              paddingLeft: '20px',
              marginBottom: '10px',
              marginTop: '30px',
            }}>
            Review the settings of your collection.
          </h6>
          <p
            style={{
              fontSize: '12px',
              textAlign: 'left',
              paddingLeft: '20px',
            }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean nec
            ex in elit fermentum fermentum. Maecenas fermentum mauris metus, non
            tempus odio sollicitudin a.
          </p>

          <div
            className={style.CreationPageLabelFDivide}
            style={{ marginTop: '30px', marginBottom: '30px' }}>
            <label className={style.CreationPageLabelF}>
              <h6>Name</h6>
              <p>{state.nameandsymbol.name}</p>
            </label>
            <label className={style.CreationPageLabelF}>
              <h6>Symbol</h6>
              <p>{state.nameandsymbol.symbol}</p>
            </label>
            <hr className={style.hrConfirmation}></hr>
            <label className={style.CreationPageLabelF}>
              <h6>Mint Host</h6>
              <p>{state.hostSection.host}</p>
            </label>
            <label className={style.CreationPageLabelF}>
              <h6>Metadata Host</h6>
              <p>{state.hostSection.metadataHost}</p>
            </label>
            <hr className={style.hrConfirmation}></hr>

            {state.metadata.metadataType === 'metadataLink' && (
              <>
                <label className={style.CreationPageLabelF}>
                  <h6>Link</h6>
                  <p>{state.metadata.metadataLink}</p>
                </label>
              </>
            )}

            {state.metadata.metadataType === 'metadata' && (
              <>
                <label
                  className={style.CreationPageLabelF}
                  style={{ width: '100%', textAlign: 'left' }}>
                  <h6>Logo</h6>
                  <span style={{ width: '100%', paddingTop: '10px' }}>
                    <img
                      style={{ paddingTop: '10px' }}
                      src={
                        state.metadata.image == null ||
                        state.metadata.image == ''
                          ? state.metadata.file
                          : state.metadata.image
                      }
                      alt="Collection's logo"
                      width="150"
                      height="auto"
                    />
                  </span>
                </label>
                <label
                  className={style.CreationPageLabelF}
                  style={{ width: '100%' }}>
                  <h6>Description</h6>
                  <span style={{ width: '100%' }}>
                    <p>{state.metadata.description}</p>
                  </span>
                </label>
                <div className={style.CreationPageLabelFDivide}>
                  {state.metadata.external_url && (
                    <>
                      <label className={style.CreationPageLabelF}>
                        <h6>Website</h6>
                        <p>{state.metadata.external_url}</p>
                      </label>
                    </>
                  )}
                  {state.metadata.discussion_url && (
                    <>
                      <label className={style.CreationPageLabelF}>
                        <h6>Discussion Link</h6>
                        <p>{state.metadata.discussion_url}</p>
                      </label>
                    </>
                  )}
                  {state.metadata.github_url && (
                    <>
                      <label className={style.CreationPageLabelF}>
                        <h6>Github Link</h6>
                        <p>{state.metadata.github_url}</p>
                      </label>
                    </>
                  )}
                  <label className={style.CreationPageLabelF}>
                    <h6>Background Color</h6>
                    <p>{state.metadata.background_color}</p>
                  </label>
                  {isMetadataListOdd > 0 && (
                    <>
                      <label className={style.CreationPageLabelF}>
                        <h6></h6>
                        <p></p>
                      </label>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <div className={style.WizardFooter}>
            <button className={style.WizardFooterBack} onClick={onPrev}>
              Back
            </button>
            <button
              className={style.WizardFooterNext}
              onClick={async () => await prepareDeploy()}>
              Deploy
            </button>
          </div>
        </div>
      )}
      {success && (
        <div>
          <h6>&#127881; &#127881; Collection Created! &#127881; &#127881;</h6>
          <p>
            <b>And Now?</b>
          </p>
          <label className={style.CreationPageLabelF}>
            <h6>
              <a
                target="_blank"
                href={`${getNetworkElement(
                  { chainId, context },
                  'etherscanURL'
                )}/tx/${success.transactionHash}`}>
                Transaction
              </a>
            </h6>
          </label>
          {!collectionId && <OurCircularProgress />}
          <label className={style.CreationPageLabelF}>
            {collectionId && (
              <>
                <h6>
                  <Link to={'/items/collections/' + collectionId}>
                    View Collection
                  </Link>
                </h6>
                <h6>
                  <Link to={'/items/create/item/' + collectionId}>
                    Mint Items
                  </Link>
                </h6>
              </>
            )}
          </label>
        </div>
      )}
    </>
  )
}

const CreateCollection = ({}) => {
  const context = useEthosContext()

  const ipfsHttpClient = useMemo(() => initializeIPFSClient(context), [context])

  const [state, setState] = useState({})

  const [step, setStep] = useState(0)

  return (
    <div className={style.CreatePage}>
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
          <li className={step === 3 ? style.WizardStepsListActive : ''}>
            Confirmation
          </li>
        </ul>
      </div>
      <div className={style.WizardHeader}>
        <h3>
          Create a new Collection <span>step {step + 1} of 4</span>
        </h3>
        <div
          className={style.WizardHeaderDescription}
          style={{
            margin: '20px 0px 20px 0px!important',
            fontSize: '16px!important',
          }}>
          Items are a new ERC token super standard, combining functionalities of
          ERC-20 tokens, ERC-721, and ERC-1155 NFT's. This gives them access to
          the best functionalities and platforms of both normal tokens and NFT's
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
            state={state}
          />
        )}
        {step == 4 && (
          <CreateSuccess
            value={state?.success}
            onChange={(value) => setState({ ...state, success: value })}
          />
        )}
      </div>
    </div>
  )
}

CreateCollection.menuVoice = {
  path: '/items/create/collection',
}

export default CreateCollection
