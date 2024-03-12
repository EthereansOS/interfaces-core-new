import React, { useEffect, useMemo, useState } from 'react'

import { Link, useLocation } from 'react-router-dom'
import { Style, useEthosContext, useWeb3, web3Utils } from 'interfaces-core'
import {
  createDelegation,
  finalizeDelegation,
} from '../../../../logic/delegation'
import CircularProgress from '../../../../components/Global/OurCircularProgress'
import style from '../../../../all.module.css'
import uploadToIPFS from 'interfaces-core/lib/web3/uploadToIPFS'
import getFileFromBlobURL from 'interfaces-core/lib/web3/getFileFromBlobURL'

const Deploy = ({ back, finalize }) => {
  const context = useEthosContext()

  const web3Data = useWeb3()

  const {
    getGlobalContract,
    newContract,
    chainId,
    dualChainId,
    ipfsHttpClient,
    web3,
  } = web3Data

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [ticker, setTicker] = useState('')
  const [image, setImage] = useState('')
  const [tokenURI, setTokenURI] = useState('')
  const [background_color, setBackground_color] = useState('')
  const [external_url, setExternal_url] = useState('')
  const [community_url, setCommunity_url] = useState('')
  const [public_polls, setPublic_polls] = useState('')
  const [news_url, setNews_url] = useState('')
  const [blog_url, setBlog_url] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [triggerTextInput, setTriggerTextInput] = useState(false)

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage('')
      setSelectedImage(URL.createObjectURL(e.target.files[0]))
    }
  }

  const [selectedTokenImage, setSelectedTokenImage] = useState(null)
  const [triggerTokenTextInput, setTriggerTokenTextInput] = useState(false)

  const handleTokenImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setTokenURI('')
      setSelectedTokenImage(URL.createObjectURL(e.target.files[0]))
    }
  }

  const [loading, setLoading] = useState(false)

  async function deploy() {
    var metadata = {
      name,
      description,
      ticker,
      image,
      tokenURI,
      background_color,
      external_url,
      community_url,
      public_polls,
      news_url,
      blog_url,
    }

    if (selectedImage) {
      metadata.image = await uploadToIPFS(
        { context, ipfsHttpClient },
        await getFileFromBlobURL(selectedImage)
      )
    }

    if (selectedTokenImage) {
      metadata.tokenURI = await uploadToIPFS(
        { context, ipfsHttpClient },
        await getFileFromBlobURL(selectedTokenImage)
      )
    }

    if (dualChainId) {
      return finalize(undefined, metadata)
    }
    setLoading(true)
    var errorMessage
    try {
      finalize(
        await createDelegation(
          {
            context,
            ...web3Data,
            factoryOfFactories: getGlobalContract('factoryOfFactories'),
          },
          metadata
        )
      )
    } catch (e) {
      errorMessage = e.message || e
    }
    setLoading(false)
    errorMessage && setTimeout(() => alert(errorMessage))
  }

  const [step, setStep] = useState(0);


  return (
    <>
      <div className={style.WizardStepsList}>
        <ul>
          <li className={step === 0 ? style.WizardStepsListActive : ''}>
            Basic Info
          </li>
          <li className={step === 1 ? style.WizardStepsListActive : ''}>
            Token Details
          </li>
        </ul>
      </div>
      
      <div className={style.WizardHeader}>
        <h3>
          Create a new Delegation <span>step {step + 1} of 2</span>
        </h3>
        <div className={style.WizardHeaderDescription}>
          An independent political party that can compete for grant funding from
          one or more Organizations
        </div>
        <div className={style.WizardProgress}>
          <div
            className={style.WizardProgressBar}
            style={{
              width: ((100 / 2) * (step + 1)  > 0 ? (100 / 2) * (step + 1) : 1) + '%',
            }}></div>
        </div>
      </div>

        {step == 0 ? 
      <div className={style.CreationPageLabel}>
        <div className={style.FancyExplanationCreate}>
          <h2>Basic Info</h2>
        </div>
        <label className={style.CreationPageLabelF}>
          <h6>Name*</h6>
          <p>Choose an unique name for your Delegation</p>
          <input
            type="text"
            value={name ?? ''}
            onChange={(e) => setName(e.currentTarget.value)}
          />
        </label>
        <label className={style.CreationPageLabelF}>
          <h6>Description</h6>
          <p>Enter the description of your Delegation</p>
          <textarea
            value={description ?? ''}
            onChange={(e) => setDescription(e.currentTarget.value)}
          />
        </label>
        <div className={style.CreationPageLabelFDivide}>
          <label className={style.CreationPageLabelF}>
            <h6>Community link</h6>
            <p>Insert Discord or Telegram link</p>
            <input
              type="link"
              value={community_url ?? ''}
              onChange={(e) => setCommunity_url(e.currentTarget.value)}
            />
          </label>
          <label className={style.CreationPageLabelF}>
            <h6>News link</h6>
            <p>A place to discuss your Delegation</p>
            <input
              type="link"
              value={news_url ?? ''}
              onChange={(e) => setNews_url(e.currentTarget.value)}
            />
          </label>
        </div>
        <div className={style.CreationPageLabelFDivide}>
          <label className={style.CreationPageLabelF}>
            <h6>Blog link</h6>
            <p>A place to discuss your Delegation</p>
            <input
              type="link"
              value={blog_url ?? ''}
              onChange={(e) => setBlog_url(e.currentTarget.value)}
            />
          </label>
          <label className={style.CreationPageLabelF}>
            <h6>Token Name</h6>
            <p>The token name of your Delegation</p>
            <input
              type="text"
              value={ticker ?? ''}
              onChange={(e) => setTicker(e.currentTarget.value)}
            />
          </label>
        </div>
        
        <div className={style.WizardFooter}>
          {loading && <CircularProgress />}
          {!loading && step != 0 && (
            <button className={style.WizardFooterBack} onClick={() => setStep(0)}>
              Back
            </button>
          )}
          {!loading && (
            <button className={style.WizardFooterNext} onClick={() => setStep(1)}>
             Next
            </button>
          )}
        </div>
      </div> : 
      <div className={style.CreationPageLabel}>
        <div className={style.FancyExplanationCreate}>
          <h2>Token Details</h2>
        </div>
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
                A valid link for your Delegation's logo. Square size recomended.
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
                placeholder="Delegation Logo URL"
                onChange={(e) => setImage(e.currentTarget.value)}
                onBlur={(e) => setImage(e.currentTarget.value)}
                value={image ?? ''}
              />
            )}
          </label>
          <label className={style.CreationPageLabelF}>
            <h6>Website</h6>
            <p>The official website of your Delegation</p>
            <input
              type="link"
              value={external_url ?? ''}
              onChange={(e) => setExternal_url(e.currentTarget.value)}
            />
          </label>
        </div>
        <div className={style.CreationPageLabelFDivide}>
          <label
            className={style.CreationPageLabelF}
            style={{ verticalAlign: 'bottom', Display: 'flex' }}>
            <h6>
              Token Logo*
              {!triggerTokenTextInput && (
                <span
                  className={style.CreationPageLabelFloatRight}
                  onClick={() => setTriggerTokenTextInput(true)}>
                  or indicate an image URL
                </span>
              )}
              {triggerTokenTextInput && (
                <span
                  className={style.CreationPageLabelFloatRight}
                  onClick={() => setTriggerTokenTextInput(false)}>
                  or indicate an image file
                </span>
              )}
            </h6>
            {!triggerTokenTextInput && (
              <p>Select an image file, square size recomended.</p>
            )}
            {triggerTokenTextInput && (
              <p>
                A valid link for your Delegation's token logo. Square size
                recomended.
              </p>
            )}
            {!triggerTokenTextInput && (
              <div className={style.imageSelectorContaine}>
                {!selectedTokenImage && (
                  <input
                    type="file"
                    onChange={handleTokenImageChange}
                    accept="image/*"
                  />
                )}
                {selectedTokenImage && (
                  <div className={style.ImagePreview}>
                    <img src={selectedTokenImage} alt="Selected" />
                    <div
                      className={style.ImagePreviewLabel}
                      onClick={() => setSelectedTokenImage(null)}>
                      Replace Image
                    </div>
                  </div>
                )}
              </div>
            )}

            {triggerTokenTextInput && (
              <input
                type="link"
                placeholder="Delegation Token Logo URL"
                onChange={(e) => setTokenURI(e.currentTarget.value)}
                value={tokenURI ?? ''}
                onBlur={(e) => setTokenURI(e.currentTarget.value)}
              />
            )}
          </label>
          <label className={style.CreationPageLabelF}>
            <h6>Logo Background</h6>
            <p>The background color of your Delegation’s logo</p>
            <input
              type="color"
              value="#ffffff"
              style={{ width: '100%' }}
              onChange={(e) => setBackground_color(e.currentTarget.value)}
            />
          </label>
        </div>
        <label className={style.CreationPageLabelF}>
          <h6>Public polls</h6>
          <div style={{ textAlign: 'left' }}>
            <input
              type="checkbox"
              style={{ width: 'auto', margin: '10px 0px' }}
              onChange={(e) => setPublic_polls(e.currentTarget.checked)}
              checked={public_polls}
            />
          </div>
          <p>
            <b>Public Polls (coming soon)</b><br/> If selected, all polls that involve this
            Delegation will appear on the Delegation’s page. If not, only polls
            created by the Delegation’s host will.
          </p>
        </label>
        <div className={style.WizardFooter}>
          {loading && <CircularProgress />}
          {!loading && step != 0 && (
            <button className={style.WizardFooterBack} onClick={() => setStep(0)}>
              Back
            </button>
          )}
          {!loading && (
            <button className={style.WizardFooterNext} onClick={deploy}>
              {dualChainId ? 'Next' : 'Deploy'}
            </button>
          )}
        </div>
      </div>}
    </>
  )
}

const Duration = ({ value, onChange }) => {
  const context = useEthosContext()

  return (
    <select
      value={value}
      onChange={(e) => onChange(parseInt(e.currentTarget.value))}>
      {Object.entries(context.timeIntervals).map((it) => (
        <option key={it[0]} value={it[1]}>
          {it[0]}
        </option>
      ))}
    </select>
  )
}

const Finalize = ({ back, success, cumulativeData }) => {
  const context = useEthosContext()

  const web3Data = useWeb3()

  const { getGlobalContract, newContract, chainId, dualChainId } = web3Data

  const [delegationAddress, setDelegationAddress] = useState(
    cumulativeData?.delegationAddress
  )
  const [quorumPercentage, setQuorumPercentage] = useState(0)
  const [hardCapPercentage, setHardcapPercentage] = useState(0)
  const [blockLength, setBlockLength] = useState(0)
  const [validationBomb, setValidationBomb] = useState(0)
  const [host, setHost] = useState(null)

  const [loading, setLoading] = useState(false)

  const showValidationBombWarning = useMemo(
    () =>
      validationBomb && blockLength
        ? parseInt(validationBomb) <= parseInt(blockLength)
        : undefined,
    [blockLength, validationBomb]
  )

  async function finalize() {
    setLoading(true)
    var errorMessage
    try {
      var delAddr = delegationAddress
      if (delAddr) {
        await finalizeDelegation(
          {
            context,
            chainId,
            newContract,
            factoryOfFactories: getGlobalContract('factoryOfFactories'),
          },
          delegationAddress,
          host,
          quorumPercentage,
          validationBomb,
          blockLength,
          hardCapPercentage
        )
      } else {
        delAddr = await createDelegation(
          {
            context,
            ...web3Data,
            factoryOfFactories: getGlobalContract('factoryOfFactories'),
          },
          cumulativeData.metadata,
          {
            host,
            quorum: quorumPercentage,
            validationBomb,
            votePeriod: blockLength,
            hardCap: hardCapPercentage,
          }
        )
      }

      success(delAddr)
    } catch (e) {
      errorMessage = e.message || e
    }
    setLoading(false)
    errorMessage && setTimeout(() => alert(errorMessage))
  }

  return (
    <div className={style.CreationPageLabel}>
      <div className={style.FancyExplanationCreate}>
          <h2>Host</h2>
      </div>

      <div className={style.CreationPageLabelFDivide} style={{
            marginTop: '30px',
            display: 'flex',
            marginBottom: '30px',
            paddingBottom: '20px',
            borderBottom: '1px solid #e7ecf4',
          }}>
      {!dualChainId && (
        <label className={style.CreationPageLabelF}>
          <h6>Delegation address</h6>
          <input
            type="text"
            value={delegationAddress ?? ''}
            onChange={(e) => setDelegationAddress(e.currentTarget.value)}
          />
        </label>
      )}
      <label className={style.CreationPageLabelF}>
        <h6>Host</h6>
        <input
          type="text"
          value={host ?? ''}
          onChange={(e) => setHost(e.currentTarget.value)}
        />
        <p>
          This is the address (wallet, MultiSig, Organization or contract) that
          manages this Delegation. The host is able to create proposals to spend
          funds, change metadata and change governance rules.
        </p>
      </label>
      </div>
      <div className={style.CreationPageLabelFDivide} style={{
            marginTop: '30px',
            display: 'flex',
            marginBottom: '30px',
            paddingBottom: '20px',
            borderBottom: '1px solid #e7ecf4',
          }}>
      <label className={style.CreationPageLabelF}>
        <h6>Survey Duration</h6>
        {!dualChainId && (
          <input
            type="number"
            value={blockLength}
            onChange={(e) => setBlockLength(e.currentTarget.value)}
          />
        )}
        {dualChainId && (
          <Duration
            value={blockLength}
            onChange={(value) => setBlockLength(value)}
          />
        )}
        <p>
          The duration (in {dualChainId ? 'seconds' : 'blocks'}) that Proposals
          will be open for.
        </p>
      </label>
      
      <label className={style.CreationPageLabelF}>
        <h6>Validation Bomb</h6>
        {!dualChainId && (
          <input
            type="number"
            value={validationBomb}
            onChange={(e) => setValidationBomb(e.currentTarget.value)}
          />
        )}
        {dualChainId && (
          <Duration
            value={validationBomb}
            onChange={(value) => setValidationBomb(value)}
          />
        )}
        <p>
          An optional duration (in {dualChainId ? 'seconds' : 'blocks'}) after
          which a passed Proposal can never be executed. If set as zero, there
          is no time before which a Proposal can be executed.
        </p>
        {showValidationBombWarning && (
          <h6>WARNING: Validation Bomb must be higher than Survey Duration</h6>
        )}
      </label>
      </div>
      <div className={style.CreationPageLabelFDivide} style={{
            marginTop: '30px',
            display: 'flex',
            marginBottom: '30px',
            paddingBottom: '20px'
          }}>
      <label className={style.CreationPageLabelF}>
        <h6>Quorum {quorumPercentage || '0'}%</h6>
        <input
          className={style.perchentageThing}
          type="range"
          min="0"
          max="100"
          value={quorumPercentage}
          onChange={(e) => setQuorumPercentage(e.currentTarget.value)}
        />
        <p>
          A minimum amount of votes (calculated as a percentage of the
          Delegation token’s total supply) required for a Proposal to pass.
        </p>
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Hard Cap {hardCapPercentage || '0'}%</h6>
        <input
          className={style.perchentageThing}
          type="range"
          min="0"
          max="100"
          value={hardCapPercentage}
          onChange={(e) => setHardcapPercentage(e.currentTarget.value)}
        />
        <p>
          An optional minimum amount of votes (calculated as a percentage of the
          Delegation token’s total supply) required to end a Proposal,
          regardless of how long it is still set to remain open.
        </p>
      </label>
      </div>
      <div className={style.WizardFooter}>
        {loading && <CircularProgress />}
        {!loading && (
          <button className={style.WizardFooterBack} onClick={back}>
            Back
          </button>
        )}
        {!loading && (
          <button className={style.WizardFooterNext} onClick={finalize}>
            {dualChainId ? 'Deploy' : 'Finalize'}
          </button>
        )}
      </div>
    </div>
  )
}

const Success = ({ cumulativeData }) => {
  return (
    <div className={style.CreationPageLabel} style={{padding:'30px', textAlign:'center'}}>
      <h3>&#127881; &#127881; Delegation Created! &#127881; &#127881;</h3>
      <br/>
      <br/>
      <p>
        <b>And Now?</b>
      </p>
      <label className={style.CreationPageLabelF}>
        <h6 style={{textAlign:'center', marginTop: '50px'}}>
          <Link
            style={{padding: '10px'}}
            to={`/organizations/delegations/${cumulativeData.delegationAddress}`}  className={style.RegularButton}>
            Explore your Delegation
          </Link>
        </h6>
      </label>
    </div>
  )
}

const DelegationsCreate = ({}) => {
  const { pathname } = useLocation()

  const [cumulativeData, setCumulativeData] = useState({
    step: 'deploy',
  })

  useEffect(() => {
    try {
      var delegationAddress = pathname.split('/')
      var index = delegationAddress.length - 1
      if (delegationAddress[index] === '') {
        index--
      }
      delegationAddress = delegationAddress[index]
      delegationAddress = web3Utils.toChecksumAddress(delegationAddress)
      setCumulativeData((oldValue) => ({
        ...oldValue,
        delegationAddress,
        step: 'finalize',
      }))
    } catch (e) {}
  }, [pathname])

  var steps = {
    deploy: () => (
      <Deploy
        finalize={(delegationAddress, metadata) =>
          setCumulativeData((oldValue) => ({
            ...oldValue,
            delegationAddress,
            metadata,
            step: 'finalize',
          }))
        }
      />
    ),
    finalize: () => (
      <Finalize
        cumulativeData={cumulativeData}
        back={() => setCumulativeData({ step: 'deploy' })}
        success={(delegationAddress) =>
          setCumulativeData((oldValue) => ({
            ...oldValue,
            delegationAddress,
            step: 'success',
          }))
        }
      />
    ),
    success: () => <Success cumulativeData={cumulativeData} />,
  }

  return <div className={style.CreatePage}>{steps[cumulativeData.step]()}</div>
}

DelegationsCreate.menuVoice = {
  path: '/organizations/create/delegation',
}

export default DelegationsCreate
