import React, { useCallback, useEffect, useMemo, useState } from 'react'

import {
  Style,
  useEthosContext,
  useWeb3,
  VOID_ETHEREUM_ADDRESS,
  web3Utils,
  getNetworkElement,
} from 'interfaces-core'

import { Link, useHistory } from 'react-router-dom'

import ActionAWeb3Button from '../../../../components/Global/ActionAWeb3Button'
import TokenInputRegular from '../../../../components/Global/TokenInputRegular'

import { createOrganization } from '../../../../logic/organization-2'

import ProgressComponent from '../../../../components/Global/LiquidProgress/ProgressComponent'
import DonutAndLegend from '../../../../components/Global/DonutChart'

import CircularProgress from '../../../../components/Global/OurCircularProgress'
import style from '../../../../all.module.css'
import { getAMMs } from '../../../../logic/amm'

import ActionInfoSection from '../../../../components/Global/ActionInfoSection'
import OurCircularProgress from '../../../../components/Global/OurCircularProgress'
import CircularSlider from '@fseehawer/react-circular-slider'

import getCurrentAddress from 'interfaces-core/lib/web3/getCurrentAddress'
import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'

const components = [
  'COMPONENT_KEY_TREASURY_MANAGER',
  'COMPONENT_KEY_TREASURY_SPLITTER_MANAGER',
  'COMPONENT_KEY_DELEGATIONS_MANAGER',
  'COMPONENT_KEY_INVESTMENTS_MANAGER',
]

import { create as createIpfsHttpClient } from 'ipfs-http-client'
import uploadToIPFS from 'interfaces-core/lib/web3/uploadToIPFS'
import getFileFromBlobURL from 'interfaces-core/lib/web3/getFileFromBlobURL'
import {
  checkOrganizationMetadata,
  checkGovernance,
  prepareInputData,
} from 'logic/organization'

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

function isValidationBombValid(validationBomb, duration) {
  const index_validation = dataTime.indexOf(validationBomb)
  const index_duration = dataTime.indexOf(duration)

  if (index_validation > index_duration) {
    return true
  } else {
    return false
  }
}

const getCurrentDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  let month = now.getMonth() + 1
  if (month < 10) {
    month = `0${month}`
  }
  let day = now.getDate()
  if (day < 10) {
    day = `0${day}`
  }
  let hours = now.getHours()
  if (hours < 10) {
    hours = `0${hours}`
  }
  let minutes = now.getMinutes()
  if (minutes < 10) {
    minutes = `0${minutes}`
  }
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const isValidDateTime = (inputValue, currentDate) => {
  const currentYear = new Date().getFullYear()
  const year = new Date(inputValue).getFullYear()

  const currentMillennium = Math.floor(currentYear / 1000)
  const inputYearMillenium = Math.floor(year / 1000)
  if (currentMillennium === inputYearMillenium && inputValue >= currentDate) {
    return true
  } else {
    return false
  }
}

export const backgroundColor = '#da7cff'
export const labelColor = '#340098'
var dataTime = []

const Metadata = ({ value, onChange, onNext, onPrev }) => {
  const [disabled, setDisabled] = useState()
  const [selectedImage, setSelectedImage] = useState(null)
  const [triggerTextInput, setTriggerTextInput] = useState(false)

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

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      value.image = ''
      setSelectedImage(URL.createObjectURL(e.target.files[0]))
      value.file = selectedImage ?? null
      value.image = selectedImage == null ? value?.image : ''
    }
    setDisabled(!checkOrganizationMetadata(value))
  }

  const handleBlur = () => {
    onChange(value)
  }

  useEffect(() => {
    if (value) {
      if (value.file) setSelectedImage(value.file)
      value.file = selectedImage ?? null
      value.image = selectedImage == null ? value?.image : ''
    }
    setDisabled(!checkOrganizationMetadata(value))
  }, [selectedImage, onChange])

  return (
    <div className={style.CreationPageLabel}>
      <ScrollToTopOnMount />

      <div className={style.FancyExplanationCreate}>
        <h2>Basic Info</h2>
      </div>
      <label className={style.CreationPageLabelF}>
        <h6>Name*</h6>
        <p>Choose an unique name for your Ogranization</p>
        <input
          type="text"
          value={value?.name ?? ''}
          placeholder="Organization name"
          onChange={(e) => onChange({ ...value, name: e.currentTarget.value })}
        />
        {value?.error?.name && <p>{value.error.name}</p>}
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Description*</h6>
        <p>Enter the description of your Organization</p>
        <textarea
          value={value?.description ?? ''}
          onChange={(e) =>
            onChange({ ...value, description: e.currentTarget.value })
          }
          placeholder="Describe your Organization"
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
              A valid link for your Organization's logo. Square size recomended.
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
              placeholder="Organization Logo URL"
              onChange={(e) =>
                onChange({ ...value, image: e.currentTarget.value })
              }
              onBlur={handleBlur}
            />
          )}
          {value?.error?.image && <p>{value.error.image}</p>}
        </label>
        <label className={style.CreationPageLabelF}>
          <h6>Website</h6>
          <p>The official website of your Organization</p>
          <input
            type="link"
            value={value?.url ?? ''}
            placeholder="Organization Website URL"
            onChange={(e) => onChange({ ...value, url: e.currentTarget.value })}
          />

          {value?.error?.url && <p>{value.error.url}</p>}
        </label>
      </div>
      <div className={style.CreationPageLabelFDivide}>
        <label className={style.CreationPageLabelF}>
          <h6>Social Link</h6>
          <p>Insert link for your organization's social</p>
          <input
            type="link"
            value={value?.social_link ?? ''}
            placeholder="Organization Social Link"
            onChange={(e) =>
              onChange({ ...value, social_link: e.currentTarget.value })
            }
          />

          {value?.error?.social_link && <p>{value.error.social_link}</p>}
        </label>
        <label className={style.CreationPageLabelF}>
          <h6>Community Link</h6>
          <p>Insert Discord or Telegram link</p>
          <input
            type="link"
            value={value?.community_link ?? ''}
            placeholder="Community Invite Link"
            onChange={(e) =>
              onChange({ ...value, community_link: e.currentTarget.value })
            }
          />

          {value?.error?.community_link && <p>{value.error.community_link}</p>}
        </label>
      </div>
      <div className={style.WizardFooter}>
        <button
          className={style.WizardFooterNext}
          onClick={onNext}
          disabled={disabled}>
          Next
        </button>
      </div>
    </div>
  )
}

const Confirmation = ({
  value,
  onChange,
  onNext,
  onPrev,
  disabled,
  state,
  dataTime,
}) => {
  const context = useEthosContext()
  const { chainId } = useWeb3()
  const web3Data = useWeb3()
  const initialData = useMemo(
    () => ({ context, ...web3Data }),
    [context, web3Data]
  )
  const [token, setToken] = useState(value?.token)
  const [proposalRules, setProposalRules] = useState(value?.proposalRules)
  const ipfsHttpClient = useMemo(() => initializeIPFSClient(context), [context])

  const [hardCapValue, setHardCapValue] = useState(0)
  const [quorum, setQuorum] = useState(0)

  const [success, setSuccess] = useState(null)
  const [address, setAddress] = useState()
  const [loading, setLoading] = useState(false)

  const onClick = useCallback(
    async function () {
      var errorMessage
      try {
        if (state?.metadata?.file) {
          state.metadata.image = await uploadToIPFS(
            { context, ipfsHttpClient },
            await getFileFromBlobURL(state.metadata.file)
          )
        }

        if (state?.metadata) {
          delete state?.metadata?.error
          delete state?.metadata?.file
        }

        var finalInputData = prepareInputData(
          initialData.context,
          state,
          dataTime
        )

        if (!disabled) {
          var trx = await createOrganization(initialData, finalInputData)
          setSuccess(trx)
        }
      } catch (e) {
        errorMessage = e.message || e
        setLoading(false)
      }
      setLoading(false)
      errorMessage && setTimeout(() => alert(errorMessage))
    },
    [disabled, state]
  ) // Update the block number and broadcast it to the listeners

  useEffect(() => {
    setAddress()
    setTimeout(async function () {
      if (!success) {
        return
      }
      const transaction = await web3.eth.getTransactionReceipt(
        success.transactionHash
      )
      var log = transaction.logs.filter(
        (it) =>
          it.topics[0] ===
          web3Utils.sha3('Deployed(address,address,address,bytes)')
      )
      log = log[log.length - 1]
      var address = log.topics[2]
      address = abi.decode(['address'], address)[0].toString()
      setAddress(address)
    })
  }, [success])

  useEffect(
    () => onChange && onChange({ token, proposalRules }),
    [token, proposalRules]
  )

  const [quorumKey, setQuorumKey] = useState(0) // Add a key state for the Quorum slider

  useEffect(() => {
    setQuorum(hardCapValue)
    setQuorumKey((prevKey) => prevKey + 1)
  }, [hardCapValue])

  useEffect(() => {
    onChange && onChange({ token, proposalRules, hardCapValue, quorum })
  }, [token, proposalRules, hardCapValue, quorum])

  return (
    <>
      <ScrollToTopOnMount />
      {!success && (
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
            Confirm the Organization deploy.
          </h6>
          <p
            style={{
              fontSize: '12px',
              textAlign: 'left',
              paddingLeft: '20px',
            }}>
            Once you deploy, all changes will need to be made through a
            successful governance proposal and executed by holders of the
            governance token chosen.
          </p>

          <div
            className={style.CreationPageLabelFDivide}
            style={{ marginTop: '30px', marginBottom: '30px' }}>
            <label className={style.CreationPageLabelF} key={quorumKey}></label>
          </div>

          <div className={style.WizardFooter}>
            <button className={style.WizardFooterBack} onClick={onPrev}>
              Back
            </button>
            {loading && <CircularProgress />}
            {!loading && (
              <ActionAWeb3Button
                className={'WizardFooterNext'}
                onClick={onClick}
                disabled={disabled}>
                Deploy
              </ActionAWeb3Button>
            )}
          </div>
        </div>
      )}
      {success && (
        <div
          className={style.CreationPageLabel}
          style={{ padding: '30px', textAlign: 'center' }}>
          <h3>&#127881; &#127881; Organization Created! &#127881; &#127881;</h3>
          <br />
          <br />
          <p>
            <b>And Now?</b>
          </p>
          <label className={style.CreationPageLabelF}>
            <h6 style={{ textAlign: 'center', marginTop: '50px' }}>
              <a
                className={style.RegularButton}
                style={{ padding: '10px' }}
                target="_blank"
                href={`${getNetworkElement(
                  { chainId, context },
                  'etherscanURL'
                )}/tx/${success.transactionHash}`}>
                Transaction
              </a>
            </h6>
          </label>
          {!address && <OurCircularProgress />}
          <label className={style.CreationPageLabelF}>
            {address && (
              <>
                <h6 style={{ textAlign: 'center', marginTop: '50px' }}>
                  <Link
                    to={'/organizations/' + address}
                    style={{ padding: '10px' }}
                    className={style.RegularButton}>
                    View Organization
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

const VotingRules = ({ value, onChange, onNext, onPrev }) => {
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    if (!value) return
    if (!value?.error) value.error = {}
    let disabled = false
    value.proposalRulesHardCapPercentage =
      value.proposalRulesHardCapPercentage ?? 0
    value.proposalRulesQuorumPercentage =
      value.proposalRulesQuorumPercentage ?? 0
    value.proposalRulesValidationBomb =
      value.proposalRulesValidationBomb ?? dataTime[1]
    value.proposalRulesProposalDuration =
      value.proposalRulesProposalDuration ?? dataTime[0]

    if (
      !isValidationBombValid(
        value.proposalRulesValidationBomb,
        value.proposalRulesProposalDuration
      )
    ) {
      value.error.proposalRulesProposalDuration =
        'Proposal Duration must be less than the Validation Bomb'
      disabled = true
    } else {
      delete value?.error?.proposalRulesProposalDuration
    }

    if (
      value.proposalRulesQuorumPercentage > value.proposalRulesHardCapPercentage
    ) {
      value.error.proposalRulesQuorumPercentage =
        'Quorum must be less than the Hard cap'
      disabled = true
    } else {
      delete value?.error?.proposalRulesQuorumPercentage
    }

    onChange && onChange(value)

    setDisabled(disabled)
  }, [value])

  return (
    <div className={style.CreationPageLabel}>
      <ScrollToTopOnMount />

      <div className={style.FancyExplanationCreate}>
        <h2>Voting Rules</h2>
      </div>
      <p
        style={{
          fontSize: '12px',
          textAlign: 'left',
          paddingLeft: '20px',
        }}>
        Set granular voting rules for how proposals are handled in the
        organization.
      </p>

      <div
        className={style.CreationPageLabelFDivideGroup}
        style={{ marginTop: '20px', marginBottom: '30px' }}>
        <div
          className={style.CreationPageLabelFDivide}
          style={{ marginTop: '30px', marginBottom: '30px' }}>
          <label className={style.CreationPageLabelF}>
            <h6>Quorum</h6>
            <p>Select the value of Quorum</p>
            <br />
            <br />
            <br />
            <CircularSlider
              label="Quorum"
              dataIndex={value?.proposalRulesQuorumPercentage ?? 0}
              labelColor="#fff"
              knobColor="#000000"
              width="120"
              knobSize="25"
              progressSize="9"
              trackSize="14"
              labelFontSize="10"
              valueFontSize="20"
              appendToValue="%"
              progressColorFrom="#000000"
              progressColorTo="#444444"
              trackColor="#eeeeee"
              min={0}
              max={100}
              initialValue={0}
              onChange={(e) => {
                onChange({
                  ...value,
                  proposalRulesQuorumPercentage: e,
                })
              }}
            />
          </label>

          <label className={style.CreationPageLabelF}>
            <h6>Hard cap</h6>
            <p>Select the value of Hard cap</p>
            <br />
            <br />
            <br />
            <CircularSlider
              label="Hard cap"
              dataIndex={value?.proposalRulesHardCapPercentage ?? 0}
              labelColor="#fff"
              width="120"
              knobSize="25"
              progressSize="9"
              trackSize="14"
              labelFontSize="10"
              valueFontSize="20"
              knobColor="#000000"
              progressColorFrom="#000000"
              progressColorTo="#444444"
              appendToValue="%"
              trackColor="#eeeeee"
              min={0}
              max={100}
              onChange={(e) =>
                onChange({
                  ...value,
                  proposalRulesHardCapPercentage: e,
                })
              }
            />
          </label>
          {value?.error?.proposalRulesQuorumPercentage && (
            <p className={style.ErrorMessage}>
              {value.error.proposalRulesQuorumPercentage}
            </p>
          )}
        </div>

        <div
          className={style.CreationPageLabelFDivide}
          style={{
            marginTop: '30px',
            marginBottom: '30px',
            borderLeft: '1px solid #e7ecf4',
          }}>
          <label className={style.CreationPageLabelF}>
            <h6>Proposal Duration</h6>
            <p>Select the duration of Proposal</p>
            <br />
            <br />
            <br />
            <CircularSlider
              progressLineCap="flat"
              label="Duration"
              dataIndex={
                value?.proposalRulesProposalDuration != null
                  ? dataTime.indexOf(value?.proposalRulesProposalDuration)
                  : 0
              }
              data={dataTime}
              labelColor="#fff"
              knobColor="#000000"
              width="120"
              knobSize="25"
              progressSize="9"
              trackSize="14"
              labelFontSize="10"
              valueFontSize="20"
              verticalOffset="1rem"
              progressColorFrom="#000000"
              progressColorTo="#444444"
              trackColor="#eeeeee"
              onChange={(e) =>
                onChange({
                  ...value,
                  proposalRulesProposalDuration: e,
                })
              }
            />
          </label>
          <label className={style.CreationPageLabelF}>
            <h6>Validation Bomb</h6>
            <p>Select Validation Bomb value</p>
            <br />
            <br />
            <br />
            <CircularSlider
              progressLineCap="flat"
              dataIndex={
                value?.proposalRulesValidationBomb != null
                  ? dataTime.indexOf(value?.proposalRulesValidationBomb)
                  : 1
              }
              label="Duration"
              data={dataTime}
              labelColor="#fff"
              knobColor="#000000"
              width="120"
              knobSize="25"
              progressSize="9"
              trackSize="14"
              labelFontSize="10"
              valueFontSize="20"
              verticalOffset="1rem"
              progressColorFrom="#000000"
              progressColorTo="#444444"
              trackColor="#eeeeee"
              onChange={(e) =>
                onChange({
                  ...value,
                  proposalRulesValidationBomb: e,
                })
              }
            />
          </label>
          {value?.error?.proposalRulesProposalDuration && (
            <p className={style.ErrorMessage}>
              {value.error.proposalRulesProposalDuration}
            </p>
          )}
        </div>
      </div>

      <div className={style.WizardFooter}>
        <button className={style.WizardFooterBack} onClick={onPrev}>
          Back
        </button>
        <button
          className={style.WizardFooterNext}
          onClick={onNext}
          disabled={disabled}>
          Next
        </button>
      </div>
    </div>
  )
}

const Organization = ({ value, onChange, onNext, onPrev }) => {
  function onChangeProgressComponent(progressValue) {
    if (!value) {
      value = {}
    }
    value.maxPercentagePerToken = progressValue
    onChange && onChange(value)
  }

  return (
    <div className={style.CreationPageLabel}>
      <ScrollToTopOnMount />

      <div className={style.FancyExplanationCreate}>
        <h2>Organization Treasury</h2>
      </div>
      <div
        className={style.CreationPageLabelFDivide}
        style={{ display: 'flex' }}>
        <label className={style.CreationPageLabelF}>
          <ProgressComponent
            maxPercentagePerToken={value?.maxPercentagePerToken ?? 0}
            onChange={(e) => onChangeProgressComponent(e)}></ProgressComponent>
        </label>

        <label className={style.CreationPageLabelF}>
          <h4 style={{ textAlign: 'left' }}>Percentage to move </h4>
          <p>
            This limits the percentage of the treasury that can be transferred
            in a single proposal. It serves as an anti rug feature, ensuring
            that the entire treasury cannot be moved at once.
          </p>
          <br />
        </label>
      </div>

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

const Governance = ({ value, onChange, onNext, onPrev }) => {
  const [disabled, setDisabled] = useState(false)
  const [token, setToken] = useState(value?.token)

  useEffect(() => {
    if (!value) return
    if (!value?.error) value.error = {}
    let disabled = false

    value.proposalRulesHardCapPercentage =
      value.proposalRulesHardCapPercentage ?? 0
    value.proposalRulesQuorumPercentage =
      value.proposalRulesQuorumPercentage ?? 0
    value.proposalRulesValidationBomb =
      value.proposalRulesValidationBomb ?? dataTime[1]
    value.proposalRulesProposalDuration =
      value.proposalRulesProposalDuration ?? dataTime[0]

    if (
      !isValidationBombValid(
        value.proposalRulesValidationBomb,
        value.proposalRulesProposalDuration
      )
    ) {
      value.error.proposalRulesProposalDuration =
        'Proposal Duration must be less than the Validation Bomb'
      disabled = true
      onChange && onChange(value)
    } else {
      delete value?.error?.proposalRulesProposalDuration
    }

    if (
      value.proposalRulesQuorumPercentage > value.proposalRulesHardCapPercentage
    ) {
      value.error.proposalRulesQuorumPercentage =
        'Quorum must be less than the Hard cap'

      disabled = true
      onChange && onChange(value)
    } else {
      delete value?.error?.proposalRulesQuorumPercentage
    }

    try {
      web3Utils.toChecksumAddress(value?.proposalRulesHost)
      delete value?.error?.proposalRulesHost
    } catch (e) {
      value.error.proposalRulesHost = 'Invalid host'
      disabled = true
      onChange && onChange(value)
    }

    if (disabled) {
      setDisabled(disabled)
      return
    }

    setDisabled(!checkGovernance(value))
  }, [value])

  useEffect(() => {
    if (value) {
      onChange({ ...value, token: token })
    }
  }, [token])

  const [quorumKey, setQuorumKey] = useState(0) // Add a key state for the Quorum slider

  return (
    <div className={style.CreationPageLabel}>
      <ScrollToTopOnMount />

      <div className={style.FancyExplanationCreate}>
        <h2>Governance Rules</h2>
      </div>

      <div
        className={style.CreationPageLabelFDivide}
        style={{ display: 'flex' }}>
        <label className={style.CreationPageLabelF}>
          <h6>Voting Token</h6>
          <p>Select the Voting Token</p>
          <TokenInputRegular
            selected={value?.token ?? token}
            onElement={setToken}
            noBalance
            noETH
            tokenOnly
          />
        </label>

        <label className={style.CreationPageLabelF}>
          <h6>
            Host address*{' '}
            <span
              className={style.CreationPageLabelFloatRight}
              onClick={() =>
                onChange({ ...value, proposalRulesHost: getCurrentAddress() })
              }>
              Insert your current address
            </span>
          </h6>
          <p>Insert the host Address</p>
          <input
            type="text"
            value={value?.proposalRulesHost ?? ''}
            placeholder="The Organization host address"
            onChange={(e) =>
              onChange({ ...value, proposalRulesHost: e.currentTarget.value })
            }
            onBlur={(e) =>
              onChange({ ...value, proposalRulesHost: e.currentTarget.value })
            }
          />
          {value?.error?.proposalRulesHost && (
            <p className={style.ErrorMessage}>
              {value.error.proposalRulesHost}
            </p>
          )}
        </label>
      </div>

      <div
        className={style.CreationPageLabelFDivideGroup}
        style={{ marginTop: '30px', marginBottom: '30px' }}>
        <div
          className={style.CreationPageLabelFDivide}
          style={{ marginTop: '30px', marginBottom: '30px' }}>
          <label className={style.CreationPageLabelF} key={quorumKey}>
            <h6>Quorum</h6>
            <p>Select the value of Quorum</p>
            <br />
            <br />
            <br />
            <CircularSlider
              label="Quorum"
              dataIndex={value?.proposalRulesQuorumPercentage ?? 0}
              labelColor="#fff"
              knobColor="#000000"
              width="120"
              knobSize="25"
              progressSize="9"
              trackSize="14"
              labelFontSize="10"
              valueFontSize="20"
              appendToValue="%"
              progressColorFrom="#000000"
              progressColorTo="#444444"
              trackColor="#eeeeee"
              min={0}
              max={100}
              onChange={(e) => {
                onChange({
                  ...value,
                  proposalRulesQuorumPercentage: e,
                })
              }}
            />
          </label>
          <label className={style.CreationPageLabelF}>
            <h6>Hard cap</h6>
            <p>Select the value of Hard cap</p>
            <br />
            <br />
            <br />
            <CircularSlider
              label="Hard cap"
              dataIndex={value?.proposalRulesHardCapPercentage ?? 0}
              labelColor="#fff"
              width="120"
              knobSize="25"
              progressSize="9"
              trackSize="14"
              labelFontSize="10"
              valueFontSize="20"
              knobColor="#000000"
              progressColorFrom="#000000"
              progressColorTo="#444444"
              appendToValue="%"
              trackColor="#eeeeee"
              min={0}
              max={100}
              onChange={(e) =>
                onChange({
                  ...value,
                  proposalRulesHardCapPercentage: e,
                })
              }
            />
          </label>
          {value?.error?.proposalRulesQuorumPercentage && (
            <p className={style.ErrorMessage}>
              {value.error.proposalRulesQuorumPercentage}
            </p>
          )}
        </div>

        <div
          className={style.CreationPageLabelFDivide}
          style={{
            marginTop: '30px',
            marginBottom: '30px',
            borderLeft: '1px solid #e7ecf4',
          }}>
          <label className={style.CreationPageLabelF}>
            <h6>Proposal Duration</h6>
            <p>Select the duration of Proposal</p>
            <br />
            <br />
            <br />
            <CircularSlider
              progressLineCap="flat"
              dataIndex={
                value?.proposalRulesProposalDuration != null
                  ? dataTime.indexOf(value?.proposalRulesProposalDuration)
                  : 0
              }
              label="Duration"
              data={dataTime}
              labelColor="#fff"
              knobColor="#000000"
              width="120"
              knobSize="25"
              progressSize="9"
              trackSize="14"
              labelFontSize="10"
              valueFontSize="20"
              verticalOffset="1rem"
              progressColorFrom="#000000"
              progressColorTo="#444444"
              trackColor="#eeeeee"
              onChange={(e) =>
                onChange({
                  ...value,
                  proposalRulesProposalDuration: e,
                })
              }
            />
          </label>
          <label className={style.CreationPageLabelF}>
            <h6>Validation Bomb</h6>
            <p>Select Validation Bomb value</p>
            <br />
            <br />
            <br />
            <CircularSlider
              progressLineCap="flat"
              dataIndex={
                value?.proposalRulesValidationBomb != null
                  ? dataTime.indexOf(value?.proposalRulesValidationBomb)
                  : 1
              }
              label="Duration"
              data={dataTime}
              labelColor="#fff"
              knobColor="#000000"
              width="120"
              knobSize="25"
              progressSize="9"
              trackSize="14"
              labelFontSize="10"
              valueFontSize="20"
              verticalOffset="1rem"
              progressColorFrom="#000000"
              progressColorTo="#444444"
              trackColor="#eeeeee"
              onChange={(e) =>
                onChange({
                  ...value,
                  proposalRulesValidationBomb: e,
                })
              }
            />
          </label>
          {value?.error?.proposalRulesProposalDuration && (
            <p className={style.ErrorMessage}>
              {value.error.proposalRulesProposalDuration}
            </p>
          )}
        </div>
      </div>

      <div className={style.WizardFooter}>
        <button className={style.WizardFooterBack} onClick={onPrev}>
          Back
        </button>
        <button
          className={style.WizardFooterNext}
          onClick={onNext}
          disabled={disabled}>
          Next
        </button>
      </div>
    </div>
  )
}

const Duration = ({ value, onChange, from }) => {
  return (
    <select
      style={{
        width: '100%',
        border: '2px solid #e7ecf4',
        padding: '10px 10px 10px 10px',
        borderRadius: '8px',
        marginTop: '10px',
      }}
      value={value}
      onChange={(e) => onChange(parseInt(e.currentTarget.value))}>
      {Object.entries(context.timeIntervals)
        .filter((_, i) => !from || i >= parseInt(from))
        .map((it) => (
          <option key={it[0]} value={it[1]}>
            {it[0]}
          </option>
        ))}
    </select>
  )
}

const FixedInflation = ({ amms, value, onChange, onNext, onPrev }) => {
  const { account } = useWeb3()
  const [disabled, setDisabled] = useState(false)

  const defaultInflationPercentage = useMemo(() => 0.05)

  const [amm, setAMM] = useState(value?.amm)
  const [uniV3Pool, setUniV3Pool] = useState(value?.uniV3Pool)
  const [_bootstrapFundWalletAddress, set_bootstrapFundWalletAddress] =
    useState(value?._bootstrapFundWalletAddress)
  const [_bootstrapFundWalletPercentage, set_bootstrapFundWalletPercentage] =
    useState(value?._bootstrapFundWalletPercentage || 0)
  const [_bootstrapFundIsRaw, set_bootstrapFundIsRaw] = useState(
    value?._bootstrapFundIsRaw || false
  )
  const [_rawTokenComponents, set_rawTokenComponents] = useState(
    value?._rawTokenComponents || []
  )
  const [_swappedTokenComponents, set_swappedTokenComponents] = useState(
    value?._swappedTokenComponents || []
  )

  const [internalStepValue, setInternalStepValue] = useState(0)
  const [dateError, setDateError] = useState(null)

  useEffect(() => {
    setDateError(null)
    if (!value) return
    if (!value.error) value.error = {}
    let disabled = false
    value.giveBackOwnershipSeconds =
      value?.giveBackOwnershipSeconds ?? Object.values(context.timeIntervals)[0]

    value.proposalRulesHardCapPercentage =
      value.proposalRulesHardCapPercentage ?? 0
    value.proposalRulesQuorumPercentage =
      value.proposalRulesQuorumPercentage ?? 0
    value.proposalRulesValidationBomb =
      value.proposalRulesValidationBomb ?? dataTime[1]
    value.proposalRulesProposalDuration =
      value.proposalRulesProposalDuration ?? dataTime[0]

    if (internalStepValue == 0) {
      try {
        web3Utils.toChecksumAddress(value?.tokenMinterOwner)
        delete value?.error?.tokenMinterOwner
      } catch (e) {
        value.error.tokenMinterOwner = 'Invalid address'
        disabled = true
      }
      if (!value?.firstExecution) {
        disabled = true
      } else if (!isValidDateTime(value.firstExecution, getCurrentDateTime())) {
        setDateError('Invalid date')
        disabled = true
      }
    }

    if (internalStepValue == 1) {
      if (
        !isValidationBombValid(
          value.proposalRulesValidationBomb,
          value.proposalRulesProposalDuration
        )
      ) {
        value.error.proposalRulesProposalDuration =
          'Proposal Duration must be less than the Validation Bomb'
        disabled = true
        onChange && onChange(value)
      } else {
        delete value?.error?.proposalRulesProposalDuration
      }

      if (
        value.proposalRulesQuorumPercentage >
        value.proposalRulesHardCapPercentage
      ) {
        value.error.proposalRulesQuorumPercentage =
          'Quorum must be less than the Hard cap'
        disabled = true
        onChange && onChange(value)
      } else {
        delete value?.error?.proposalRulesQuorumPercentage
      }
    }

    if (!disabled) {
      delete value.error
    }

    onChange && onChange(value)
    setDisabled(disabled)
  }, [value])

  return (
    <div className={style.CreationPageLabel}>
      <ScrollToTopOnMount />

      <div className={style.FancyExplanationCreate}>
        <h2>Fixed Inflation</h2>
        <p>
          Fixed inflation is a novel funding mechanism to bootstrap the
          development team and the economy of an Organization. <br />
          Funding to both the team and different economic components can be
          customized.
        </p>

        <div className={style.OrganizationToggle}>
          <input
            type="radio"
            name="fixed"
            id="fixedYes"
            checked={value !== undefined && value !== null}
            onClick={() => onChange({})}
          />
          <label htmlFor="fixedYes">Yes</label>
          <input
            type="radio"
            name="fixed"
            id="fixedNo"
            checked={value === undefined || value === null}
            onClick={() => {
              onChange(null)
              setDisabled(false)
            }}
          />
          <label htmlFor="fixedNo">No</label>
        </div>
      </div>

      {value && (
        <>
          {internalStepValue == 0 ? (
            <>
              <div
                className={style.CreationPageLabelFDivide}
                style={{
                  marginTop: '20px',
                  marginBottom: '20px',
                  display: 'flex',
                  borderBottom: '1px solid #e7ecf4',
                }}>
                <label className={style.CreationPageLabelF}>
                  <label>
                    <h6>Give back mint permissions of the token</h6>
                    <input
                      type="checkbox"
                      checked={value?.tokenMinterOwner !== undefined}
                      className={style.CheckboxAlign}
                      onClick={() =>
                        onChange({
                          ...value,
                          tokenMinterOwner:
                            value?.tokenMinterOwner !== undefined
                              ? undefined
                              : account,
                        })
                      }
                    />
                  </label>
                  {value?.tokenMinterOwner !== undefined && (
                    <>
                      <label
                        className={style.CreationPageLabelF}
                        style={{
                          width: '100%',
                          margin: '0px',
                          padding: '0px',
                        }}>
                        <h6>To this address</h6>
                        <input
                          type="text"
                          value={value?.tokenMinterOwner ?? ''}
                          onChange={(e) =>
                            onChange({
                              ...value,
                              tokenMinterOwner: e.currentTarget.value,
                            })
                          }
                          onBlur={(e) =>
                            onChange({
                              ...value,
                              tokenMinterOwner: e.currentTarget.value,
                            })
                          }
                        />
                        {value?.error?.tokenMinterOwner && (
                          <p className={style.ErrorMessage}>
                            {value.error.tokenMinterOwner}
                          </p>
                        )}
                      </label>
                      <label
                        className={style.CreationPageLabelF}
                        style={{
                          width: '100%',
                          margin: '0px',
                          padding: '0px',
                        }}>
                        <h6>After</h6>
                        <Duration
                          value={
                            value?.giveBackOwnershipSeconds ??
                            Object.values(context.timeIntervals)[0]
                          }
                          onChange={(e) =>
                            onChange({
                              ...value,
                              giveBackOwnershipSeconds: e,
                            })
                          }
                          from="16"
                        />
                      </label>
                    </>
                  )}
                  {value?.error?.name && <p>{value.error.name}</p>}
                </label>

                <label className={style.CreationPageLabelF}>
                  <h6>First Execution</h6>
                  <input
                    type="datetime-local"
                    value={value?.firstExecution ?? ''}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        firstExecution: e.currentTarget.value,
                      })
                    }
                    min={getCurrentDateTime()}
                    step="60"
                  />
                  {dateError && (
                    <p className={style.ErrorMessage}>{dateError}</p>
                  )}
                </label>
              </div>

              <label
                className={style.CreationPageLabelF}
                style={{
                  borderBottom: '1px solid rgb(231, 236, 244)',
                  marginBottom: '20px',
                  paddingBottom: '20px',
                  textAlign:'center',
                }}>
                <h6 style={{ textAlign:'center'}}>Inflation percentages</h6>
                <DonutAndLegend
                  inflationPercentage0={
                    value?.inflationPercentage0 ?? defaultInflationPercentage
                  }
                  inflationPercentage1={
                    value?.inflationPercentage1 ?? defaultInflationPercentage
                  }
                  inflationPercentage2={
                    value?.inflationPercentage2 ?? defaultInflationPercentage
                  }
                  inflationPercentage3={
                    value?.inflationPercentage3 ?? defaultInflationPercentage
                  }
                  inflationPercentage4={
                    value?.inflationPercentage4 ?? defaultInflationPercentage
                  }
                  inflationPercentage5={
                    value?.inflationPercentage5 ?? defaultInflationPercentage
                  }></DonutAndLegend>
              </label>

              <div
                className={style.CreationPageLabelFDivide}
                style={{
                  borderBottom: '1px solid rgb(231, 236, 244)',
                  marginBottom: '20px',
                  paddingBottom: '20px',
                }}>
                <label className={style.CreationPageLabelF}>
                  <h6>Swap for ETH AMM</h6>
                  <ActionInfoSection
                    settings
                    ammsInput={amms}
                    amm={amm}
                    onAMM={setAMM}
                    uniV3Pool={uniV3Pool}
                    onUniV3Pool={setUniV3Pool}
                  />
                </label>
                <label className={style.CreationPageLabelF}>
                  <h6>Boostrap Fund wallet</h6>
                  <input
                    type="text"
                    value={_bootstrapFundWalletAddress}
                    onChange={(e) =>
                      set_bootstrapFundWalletAddress(e.currentTarget.value)
                    }
                  />
                </label>
              </div>
            </>
          ) : (
            <>
              <label
                className={style.CreationPageLabelF}
                style={{
                  borderBottom: '1px solid rgb(231, 236, 244)',
                  marginBottom: '20px',
                  paddingBottom: '20px',
                }}>
                <h6>Bootstrap Fund percentage</h6>
                <p>
                  <h8>{_bootstrapFundWalletPercentage} %</h8>
                </p>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.05"
                  value={_bootstrapFundWalletPercentage}
                  onChange={(e) =>
                    set_bootstrapFundWalletPercentage(
                      parseFloat(e.currentTarget.value)
                    )
                  }
                />
              </label>
              <label
                className={style.CreationPageLabelF}
                style={{
                  borderBottom: '1px solid rgb(231, 236, 244)',
                  marginBottom: '20px',
                  paddingBottom: '20px',
                }}>
                <h6>Boostrap Fund is in token?</h6>
                <input
                  type="checkbox"
                  className={style.CheckboxAlign}
                  checked={_bootstrapFundIsRaw}
                  onChange={(e) =>
                    set_bootstrapFundIsRaw(e.currentTarget.checked)
                  }
                />
              </label>
              <label
                className={style.CreationPageLabelF}
                style={{
                  borderBottom: '1px solid rgb(231, 236, 244)',
                  marginBottom: '20px',
                  paddingBottom: '20px',
                }}>
                <h6>Components that will receive tokens</h6>
                <ComponentPercentage
                  value={_rawTokenComponents}
                  onChange={set_rawTokenComponents}
                  firstPercentage={
                    _bootstrapFundIsRaw
                      ? _bootstrapFundWalletPercentage || 0
                      : 0
                  }
                  lastHasPercentage
                />
              </label>
              <label
                className={style.CreationPageLabelF}
                style={{
                  borderBottom: '1px solid rgb(231, 236, 244)',
                  marginBottom: '20px',
                  paddingBottom: '20px',
                }}>
                <h6>Components that will receive ETH</h6>
                <ComponentPercentage
                  value={_swappedTokenComponents}
                  onChange={set_swappedTokenComponents}
                  firstPercentage={
                    _bootstrapFundIsRaw
                      ? 0
                      : _bootstrapFundWalletPercentage || 0
                  }
                />
              </label>
              <div
                className={style.CreationPageLabelFDivideGroup}
                style={{ marginTop: '20px', marginBottom: '30px' }}>
                <div
                  className={style.CreationPageLabelFDivide}
                  style={{ marginTop: '30px', marginBottom: '30px' }}>
                  <label className={style.CreationPageLabelF}>
                    <h6>Quorum</h6>
                    <p>Select the value of Quorum</p>
                    <br />
                    <br />
                    <br />
                    <CircularSlider
                      label="Quorum"
                      dataIndex={value?.proposalRulesQuorumPercentage ?? 0}
                      labelColor="#fff"
                      knobColor="#000000"
                      width="120"
                      knobSize="25"
                      progressSize="9"
                      trackSize="14"
                      labelFontSize="10"
                      valueFontSize="20"
                      appendToValue="%"
                      progressColorFrom="#000000"
                      progressColorTo="#444444"
                      trackColor="#eeeeee"
                      min={0}
                      max={100}
                      initialValue={0}
                      onChange={(e) => {
                        onChange({
                          ...value,
                          proposalRulesQuorumPercentage: e,
                        })
                      }}
                    />
                  </label>
                  <label className={style.CreationPageLabelF}>
                    <h6>Hard cap</h6>
                    <p>Select the value of Hard cap</p>
                    <br />
                    <br />
                    <br />
                    <CircularSlider
                      label="Hard cap"
                      dataIndex={value?.proposalRulesHardCapPercentage ?? 0}
                      labelColor="#fff"
                      width="120"
                      knobSize="25"
                      progressSize="9"
                      trackSize="14"
                      labelFontSize="10"
                      valueFontSize="20"
                      knobColor="#000000"
                      progressColorFrom="#000000"
                      progressColorTo="#444444"
                      appendToValue="%"
                      trackColor="#eeeeee"
                      min={0}
                      max={100}
                      onChange={(e) =>
                        onChange({
                          ...value,
                          proposalRulesHardCapPercentage: e,
                        })
                      }
                    />
                  </label>
                  {value?.error?.proposalRulesQuorumPercentage && (
                    <p className={style.ErrorMessage}>
                      {value.error.proposalRulesQuorumPercentage}
                    </p>
                  )}
                </div>

                <div
                  className={style.CreationPageLabelFDivide}
                  style={{
                    marginTop: '30px',
                    marginBottom: '30px',
                    borderLeft: '1px solid #e7ecf4',
                  }}>
                  <label className={style.CreationPageLabelF}>
                    <h6>Proposal Duration</h6>
                    <p>Select the duration of Proposal</p>
                    <br />
                    <br />
                    <br />
                    <CircularSlider
                      progressLineCap="flat"
                      dataIndex={
                        value?.proposalRulesProposalDuration != null
                          ? dataTime.indexOf(
                              value?.proposalRulesProposalDuration
                            )
                          : 0
                      }
                      label="Duration"
                      data={dataTime}
                      labelColor="#fff"
                      knobColor="#000000"
                      width="120"
                      knobSize="25"
                      progressSize="9"
                      trackSize="14"
                      labelFontSize="10"
                      valueFontSize="20"
                      verticalOffset="1rem"
                      progressColorFrom="#000000"
                      progressColorTo="#444444"
                      trackColor="#eeeeee"
                      onChange={(e) =>
                        onChange({
                          ...value,
                          proposalRulesProposalDuration: e,
                        })
                      }
                    />
                  </label>
                  <label className={style.CreationPageLabelF}>
                    <h6>Validation Bomb</h6>
                    <p>Select Validation Bomb value</p>
                    <br />
                    <br />
                    <br />
                    <CircularSlider
                      progressLineCap="flat"
                      dataIndex={
                        value?.proposalRulesValidationBomb != null
                          ? dataTime.indexOf(value?.proposalRulesValidationBomb)
                          : 1
                      }
                      label="Duration"
                      data={dataTime}
                      labelColor="#fff"
                      knobColor="#000000"
                      width="120"
                      knobSize="25"
                      progressSize="9"
                      trackSize="14"
                      labelFontSize="10"
                      valueFontSize="20"
                      verticalOffset="1rem"
                      progressColorFrom="#000000"
                      progressColorTo="#444444"
                      trackColor="#eeeeee"
                      onChange={(e) =>
                        onChange({
                          ...value,
                          proposalRulesValidationBomb: e,
                        })
                      }
                    />
                  </label>
                  {value?.error?.proposalRulesProposalDuration && (
                    <p className={style.ErrorMessage}>
                      {value.error.proposalRulesProposalDuration}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
      <div className={style.WizardFooter}>
        <button
          className={style.WizardFooterBack}
          onClick={
            internalStepValue == 1
              ? () => {
                  setInternalStepValue(0)
                }
              : onPrev
          }>
          Back
        </button>
        <button
          className={style.WizardFooterNext}
          onClick={
            internalStepValue == 0
              ? () => {
                  setInternalStepValue(1)
                }
              : onNext
          }
          disabled={disabled}>
          Next
        </button>
      </div>
    </div>
  )
}

const ComponentPercentage = ({
  value,
  onChange,
  firstPercentage,
  lastHasPercentage,
}) => {
  const lastPercentage = useMemo(
    () =>
      lastHasPercentage
        ? 0
        : 100 -
          (firstPercentage || 0) -
          value.reduce((acc, it) => acc + it.percentage, 0),
    [value, firstPercentage, lastHasPercentage]
  )

  return (
    <div>
      <div>
        <a
          onClick={() =>
            onChange([...value, { component: '', percentage: 0 }])
          }>
          <span className={style.PercentageComponentPlus}>+</span>
        </a>
      </div>
      {value.map((it, i) => (
        <div
          key={it.component + '_' + i}
          className={style.PercentageComponentBoxArea}>
          <select
            className={style.PercentageComponentBoxAreaSelect}
            value={it.component}
            onChange={(e) =>
              onChange(
                value.map((elem, index) => ({
                  ...elem,
                  component:
                    i === index ? e.currentTarget.value : elem.component,
                }))
              )
            }>
            <option value={''}>=== SELECT COMPONENT ===</option>
            {components.map((it) => (
              <option key={it} value={it}>
                {it.split('COMPONENT_KEY_').join('').split('_').join(' ')}
              </option>
            ))}
          </select>
          <div className={style.PercentageComponentBoxAreaPreview}>
            <h8>
              {lastHasPercentage || i < value.length - 1
                ? it.percentage
                : lastPercentage}{' '}
              %
            </h8>
          </div>
          {(lastHasPercentage || i < value.length - 1) && (
            <input
              type="range"
              min="0"
              max="100"
              step="0.05"
              className={style.PercentageComponentBoxAreaInput}
              value={it.percentage}
              onChange={(e) =>
                onChange(
                  value.map((elem, index) => ({
                    ...elem,
                    percentage:
                      i === index
                        ? parseFloat(e.currentTarget.value)
                        : elem.percentage,
                  }))
                )
              }
            />
          )}
          <a
            onClick={() => onChange(value.filter((_, index) => index !== i))}
            className={style.PercentageComponentBoxAreaMinus}>
            -
          </a>
        </div>
      ))}
    </div>
  )
}

const TreasurySplitterManager = ({ value, onChange, onNext, onPrev }) => {
  const [splitInterval, setSplitInterval] = useState(value?.splitInterval || 0)
  const [firstSplitEvent, setFirstSplitEvent] = useState(
    value?.firstSplitEvent || ''
  )
  const [components, setComponents] = useState(value?.components || [])
  const [disabled, setDisabled] = useState(true)
  const [dateError, setDateError] = useState(null)

  useEffect(
    () => onChange && onChange({ splitInterval, firstSplitEvent, components }),
    [splitInterval, firstSplitEvent, components]
  )

  useEffect(() => {
    setDisabled(false)
    setDateError(null)
    if (!firstSplitEvent) {
      setDisabled(true)
      return
    }
    if (!isValidDateTime(firstSplitEvent, getCurrentDateTime())) {
      setDateError('Invalid date')
      setDisabled(true)
    }
  }, [firstSplitEvent])

  return (
    <div className={style.CreationPageLabel}>
      <ScrollToTopOnMount />

      <div className={style.FancyExplanationCreate}>
        <h2>Treasury Splitter</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur at
          accumsan ligula. Nulla iaculis ligula tellus, eu eleifend purus
          pharetra vitae.
        </p>
      </div>

      <div className={style.CreationPageLabelFDivide}>
        <label className={style.CreationPageLabelF}>
          <h6>Split interval</h6>
          <Duration value={splitInterval} onChange={setSplitInterval} />
        </label>
        <label className={style.CreationPageLabelF}>
          <h6>First split event</h6>
          <input
            type="datetime-local"
            value={firstSplitEvent ?? ''}
            onChange={(e) => {
              setFirstSplitEvent(e.currentTarget.value)
            }}
            min={getCurrentDateTime()}
            step="60"
          />
          {dateError && <p className={style.ErrorMessage}>{dateError}</p>}
        </label>
      </div>
      <label className={style.CreationPageLabelF}>
        <h6>Components</h6>
        <ComponentPercentage value={components} onChange={setComponents} />
      </label>
      <div className={style.WizardFooter}>
        <button className={style.WizardFooterBack} onClick={onPrev}>
          Back
        </button>
        <button
          className={style.WizardFooterNext}
          onClick={onNext}
          disabled={disabled}>
          Next
        </button>
      </div>
    </div>
  )
}

const DelegationsManager = ({ value, onChange, onNext, onPrev }) => {
  const [disabled, setDisabled] = useState(true)

  useEffect(() => {
    if (!value) return
    if (!value.error) value.error = {}
    let disabled = false

    value.hardCapPercentageBad = value.hardCapPercentageBad ?? 0
    value.quorumPercentageBad = value.quorumPercentageBad ?? 0
    value.validationBombBad = value.validationBombBad ?? dataTime[1]
    value.proposalDurationBad = value.proposalDurationBad ?? dataTime[0]
    value.attachInsurance0 = value.attachInsurance0 ?? 0
    value.attachInsurance1 = value.attachInsurance1 ?? 0
    value.attachInsurance2 = value.attachInsurance2 ?? 0
    value.attachInsurance3 = value.attachInsurance3 ?? 0
    value.attachInsurance4 = value.attachInsurance4 ?? 0
    value.attachInsurance5 = value.attachInsurance5 ?? 0
    value.hardCapPercentageInsurance = value.hardCapPercentageInsurance ?? 0
    value.quorumPercentageInsurance = value.quorumPercentageInsurance ?? 0
    value.validationBombInsurance = value.validationBombInsurance ?? dataTime[1]
    value.proposalDurationInsurance =
      value.proposalDurationInsurance ?? dataTime[0]

    if (
      !isValidationBombValid(value.validationBombBad, value.proposalDurationBad)
    ) {
      value.error.proposalDurationBad =
        'Proposal Duration must be less than the Validation Bomb'
      disabled = true
      onChange && onChange(value)
    } else {
      delete value?.error?.proposalDurationBad
    }

    if (value.quorumPercentageBad > value.hardCapPercentageBad) {
      value.error.quorumPercentageBad = 'Quorum must be less than the Hard cap'
      disabled = true
      onChange && onChange(value)
    } else {
      delete value?.error?.quorumPercentageBad
    }

    if (
      !isValidationBombValid(
        value.validationBombInsurance,
        value.proposalDurationInsurance
      )
    ) {
      value.error.proposalDurationInsurance =
        'Proposal Duration must be less than the Validation Bomb'
      disabled = true
      onChange && onChange(value)
    } else {
      delete value?.error?.proposalDurationInsurance
    }

    if (value.quorumPercentageInsurance > value.hardCapPercentageInsurance) {
      value.error.quorumPercentageInsurance =
        'Quorum must be less than the Hard cap'
      disabled = true
      onChange && onChange(value)
    } else {
      delete value?.error?.quorumPercentageInsurance
    }

    if (!disabled) {
      delete value.error
    }

    onChange && onChange(value)
    setDisabled(disabled)
  }, [value])

  return (
    <div className={style.CreationPageLabel}>
      <ScrollToTopOnMount />

      <div className={style.FancyExplanationCreate}>
        <h2>Delegations Manager</h2>
        <p>
          Delegations are subDAOs that can attach to an Organization and compete for
          funding by providing services to an Organization in exchange for a portion of
          the treasury split determined by holder staking.
        </p>
      </div>

      <label className="CreationPageLabelF">
        <h6
          style={{
            width: '100%',
            marginLeft: '20px',
            textAlign: 'left',
            marginTop: '20px',
          }}>
          Proposal Rules to ban bad delegations
        </h6>
      </label>
      <div
        className={style.CreationPageLabelFDivideGroup}
        style={{
          marginTop: '0px',
          marginBottom: '30px',
          borderBottom: '1px solid #e7ecf4',
          paddingBottom: '20px',
        }}>
        <div
          className={style.CreationPageLabelFDivide}
          style={{ marginTop: '30px', marginBottom: '30px' }}>
          <label className={style.CreationPageLabelF}>
            <h6>Quorum</h6>
            <p>Select the value of Quorum</p>
            <br />
            <br />
            <br />
            <CircularSlider
              label="Quorum"
              dataIndex={value?.quorumPercentageBad ?? 0}
              labelColor="#fff"
              knobColor="#000000"
              width="120"
              knobSize="25"
              progressSize="9"
              trackSize="14"
              labelFontSize="10"
              valueFontSize="20"
              appendToValue="%"
              progressColorFrom="#000000"
              progressColorTo="#444444"
              trackColor="#eeeeee"
              min={0}
              max={100}
              initialValue={0}
              onChange={(e) => {
                onChange({
                  ...value,
                  quorumPercentageBad: e,
                })
              }}
            />
          </label>

          <label className={style.CreationPageLabelF}>
            <h6>Hard cap</h6>
            <p>Select the value of Hard cap</p>
            <br />
            <br />
            <br />
            <CircularSlider
              label="Hard cap"
              dataIndex={value?.hardCapPercentageBad ?? 0}
              labelColor="#fff"
              width="120"
              knobSize="25"
              progressSize="9"
              trackSize="14"
              labelFontSize="10"
              valueFontSize="20"
              knobColor="#000000"
              progressColorFrom="#000000"
              progressColorTo="#444444"
              appendToValue="%"
              trackColor="#eeeeee"
              min={0}
              max={100}
              onChange={(e) =>
                onChange({
                  ...value,
                  hardCapPercentageBad: e,
                })
              }
            />
          </label>
          {value?.error?.quorumPercentageBad && (
            <p className={style.ErrorMessage}>
              {value.error.quorumPercentageBad}
            </p>
          )}
        </div>

        <div
          className={style.CreationPageLabelFDivide}
          style={{
            marginTop: '30px',
            marginBottom: '30px',
            borderLeft: '1px solid #e7ecf4',
          }}>
          <label className={style.CreationPageLabelF}>
            <h6>Proposal Duration</h6>
            <p>Select the duration of Proposal</p>
            <br />
            <br />
            <br />
            <CircularSlider
              progressLineCap="flat"
              dataIndex={
                value?.proposalDuration != null
                  ? dataTime.indexOf(value?.proposalDurationBad)
                  : 0
              }
              label="Duration"
              data={dataTime}
              labelColor="#fff"
              knobColor="#000000"
              width="120"
              knobSize="25"
              progressSize="9"
              trackSize="14"
              labelFontSize="10"
              valueFontSize="20"
              verticalOffset="1rem"
              progressColorFrom="#000000"
              progressColorTo="#444444"
              trackColor="#eeeeee"
              onChange={(e) =>
                onChange({
                  ...value,
                  proposalDurationBad: e,
                })
              }
            />
          </label>
          <label className={style.CreationPageLabelF}>
            <h6>Validation Bomb</h6>
            <p>Select Validation Bomb value</p>
            <br />
            <br />
            <br />
            <CircularSlider
              progressLineCap="flat"
              dataIndex={
                value?.validationBombBad != null
                  ? dataTime.indexOf(value?.validationBombBad)
                  : 1
              }
              label="Duration"
              data={dataTime}
              labelColor="#fff"
              knobColor="#000000"
              width="120"
              knobSize="25"
              progressSize="9"
              trackSize="14"
              labelFontSize="10"
              valueFontSize="20"
              verticalOffset="1rem"
              progressColorFrom="#000000"
              progressColorTo="#444444"
              trackColor="#eeeeee"
              onChange={(e) =>
                onChange({
                  ...value,
                  validationBombBad: e,
                })
              }
            />
          </label>
          {value?.error?.proposalDurationBad && (
            <p className={style.ErrorMessage}>
              {value.error.proposalDurationBad}
            </p>
          )}
        </div>
      </div>

      <label
        className={style.CreationPageLabelF}
        style={{
          marginTop: '0px',
          paddingBottom: '20px',
          marginBottom: '20px',
          borderBottom: '1px solid #e7ecf4',
        }}>
        <h6>Attach Insurance</h6>
        <input
          type="number"
          value={value?.attachInsurance0 ?? 0}
          onChange={(e) =>
            onChange({
              ...value,
              attachInsurance0: e.currentTarget.value,
            })
          }
        />
      </label>
      <label
        className={style.CreationPageLabelF}
        style={{
          marginTop: '0px',
          paddingBottom: '20px',
          marginBottom: '20px',
          borderBottom: '1px solid #e7ecf4',
        }}>
        <h6>Other Attach Insurance values</h6>

        <div className={style.CreationPageLabelFDivide}>
          <label
            className={style.CreationPageLabelF}
            style={{ padding: '0px' }}>
            <input
              type="number"
              value={value?.attachInsurance1 ?? 0}
              onChange={(e) =>
                onChange({
                  ...value,
                  attachInsurance1: e.currentTarget.value,
                })
              }
            />
          </label>
          <label
            className={style.CreationPageLabelF}
            style={{ paddingRight: '0px' }}>
            <input
              type="number"
              value={value?.attachInsurance2 ?? 0}
              onChange={(e) =>
                onChange({
                  ...value,
                  attachInsurance2: e.currentTarget.value,
                })
              }
            />
          </label>
        </div>
        <div className={style.CreationPageLabelFDivide}>
          <label
            className={style.CreationPageLabelF}
            style={{ padding: '0px' }}>
            <input
              type="number"
              value={value?.attachInsurance3 ?? 0}
              onChange={(e) =>
                onChange({
                  ...value,
                  attachInsurance3: e.currentTarget.value,
                })
              }
            />
          </label>
          <label
            className={style.CreationPageLabelF}
            style={{ paddingRight: '0px' }}>
            <input
              type="number"
              value={value?.attachInsurance4 ?? 0}
              onChange={(e) =>
                onChange({
                  ...value,
                  attachInsurance4: e.currentTarget.value,
                })
              }
            />
          </label>
        </div>
        <label>
          <input
            type="number"
            value={value?.attachInsurance5 ?? 0}
            onChange={(e) =>
              onChange({
                ...value,
                attachInsurance5: e.currentTarget.value,
              })
            }
          />
        </label>
      </label>

      <label className="CreationPageLabelF">
        <h6
          style={{
            width: '100%',
            marginLeft: '20px',
            textAlign: 'left',
            marginTop: '20px',
          }}>
          Voting Rules
        </h6>
      </label>
      <div
        className={style.CreationPageLabelFDivideGroup}
        style={{ marginTop: '0px', marginBottom: '30px' }}>
        <div
          className={style.CreationPageLabelFDivide}
          style={{ marginTop: '30px', marginBottom: '30px' }}>
          <label className={style.CreationPageLabelF}>
            <h6>Quorum</h6>
            <p>Select the value of Quorum</p>
            <br />
            <br />
            <br />
            <CircularSlider
              label="Quorum"
              dataIndex={value?.quorumPercentageInsurance ?? 0}
              labelColor="#fff"
              knobColor="#000000"
              width="120"
              knobSize="25"
              progressSize="9"
              trackSize="14"
              labelFontSize="10"
              valueFontSize="20"
              appendToValue="%"
              progressColorFrom="#000000"
              progressColorTo="#444444"
              trackColor="#eeeeee"
              min={0}
              max={100}
              onChange={(e) => {
                onChange({
                  ...value,
                  quorumPercentageInsurance: e,
                })
              }}
            />
          </label>

          <label className={style.CreationPageLabelF}>
            <h6>Hard cap</h6>
            <p>Select the value of Hard cap</p>
            <br />
            <br />
            <br />
            <CircularSlider
              label="Hard cap"
              dataIndex={value?.hardCapPercentageInsurance ?? 0}
              labelColor="#fff"
              width="120"
              knobSize="25"
              progressSize="9"
              trackSize="14"
              labelFontSize="10"
              valueFontSize="20"
              knobColor="#000000"
              progressColorFrom="#000000"
              progressColorTo="#444444"
              appendToValue="%"
              trackColor="#eeeeee"
              min={0}
              max={100}
              onChange={(e) =>
                onChange({
                  ...value,
                  hardCapPercentageInsurance: e,
                })
              }
            />
          </label>
          {value?.error?.quorumPercentageInsurance && (
            <p className={style.ErrorMessage}>
              {value.error.quorumPercentageInsurance}
            </p>
          )}
        </div>

        <div
          className={style.CreationPageLabelFDivide}
          style={{
            marginTop: '30px',
            marginBottom: '30px',
            borderLeft: '1px solid #e7ecf4',
          }}>
          <label className={style.CreationPageLabelF}>
            <h6>Proposal Duration</h6>
            <p>Select the duration of Proposal</p>
            <br />
            <br />
            <br />
            <CircularSlider
              progressLineCap="flat"
              dataIndex={
                value?.proposalDurationInsurance != null
                  ? dataTime.indexOf(value?.proposalDurationInsurance)
                  : 0
              }
              label="Duration"
              data={dataTime}
              labelColor="#fff"
              knobColor="#000000"
              width="120"
              knobSize="25"
              progressSize="9"
              trackSize="14"
              labelFontSize="10"
              valueFontSize="20"
              verticalOffset="1rem"
              progressColorFrom="#000000"
              progressColorTo="#444444"
              trackColor="#eeeeee"
              onChange={(e) =>
                onChange({
                  ...value,
                  proposalDurationInsurance: e,
                })
              }
            />
          </label>
          <label className={style.CreationPageLabelF}>
            <h6>Validation Bomb</h6>
            <p>Select Validation Bomb value</p>
            <br />
            <br />
            <br />
            <CircularSlider
              progressLineCap="flat"
              dataIndex={
                value?.validationBombInsurance != null
                  ? dataTime.indexOf(value?.validationBombInsurance)
                  : 1
              }
              label="Duration"
              data={dataTime}
              labelColor="#fff"
              knobColor="#000000"
              width="120"
              knobSize="25"
              progressSize="9"
              trackSize="14"
              labelFontSize="10"
              valueFontSize="20"
              verticalOffset="1rem"
              progressColorFrom="#000000"
              progressColorTo="#444444"
              trackColor="#eeeeee"
              onChange={(e) =>
                onChange({
                  ...value,
                  validationBombInsurance: e,
                })
              }
            />
          </label>
          {value?.error?.proposalDurationInsurance && (
            <p className={style.ErrorMessage}>
              {value.error.proposalDurationInsurance}
            </p>
          )}
        </div>
      </div>
      <div className={style.WizardFooter}>
        <button className={style.WizardFooterBack} onClick={onPrev}>
          Back
        </button>
        <button
          className={style.WizardFooterNext}
          onClick={onNext}
          disabled={disabled}>
          Next
        </button>
      </div>
    </div>
  )
}

const InvestmentsManager = ({ amms, value, onChange, onNext, onPrev }) => {
  const [disabled, setDisabled] = useState(true)

  const [fromETH, setFromETH] = useState(value?.fromETH || [])
  const [toETH, setToETH] = useState(value?.toETH || [])

  const [toETHDateError, setToETHDateError] = useState(null)
  const [firstToETHDateError, setFirstToETHDateError] = useState(null)

  useEffect(() => {
    if (value) {
      onChange({ ...value, fromETH: fromETH })
    }
  }, [fromETH])

  useEffect(() => {
    if (value) {
      onChange({ ...value, toETH: toETH })
    }
  }, [toETH])

  useEffect(() => {
    setFirstToETHDateError(null)
    if (!value) return
    if (!value.error) value.error = {}
    let disabled = false

    value.hardCapPercentage = value.hardCapPercentage ?? 0
    value.quorumPercentage = value.quorumPercentage ?? 0
    value.validationBomb = value.validationBomb ?? dataTime[1]
    value.proposalDuration = value.proposalDuration ?? dataTime[0]
    value.swapToEtherInterval =
      value.swapToEtherInterval ?? Object.values(context.timeIntervals)[0]
    value.firstSwapToEtherEvent = value.firstSwapToEtherEvent ?? ''
    value.fromETH = value?.fromETH ?? fromETH
    value.toETH = value?.toETH ?? toETH

    if (!isValidationBombValid(value.validationBomb, value.proposalDuration)) {
      value.error.proposalDuration =
        'Proposal Duration must be less than the Validation Bomb'
      disabled = true
      onChange && onChange(value)
    } else {
      delete value?.error?.proposalDuration
    }

    if (value.quorumPercentage > value.hardCapPercentage) {
      value.error.quorumPercentage = 'Quorum must be less than the Hard cap'
      disabled = true
      onChange && onChange(value)
    } else {
      delete value?.error?.quorumPercentage
    }

    onChange && onChange(value)

    if (!value.firstSwapToEtherEvent) {
      setDisabled(true)
    } else if (
      !isValidDateTime(value.firstSwapToEtherEvent, getCurrentDateTime())
    ) {
      setFirstToETHDateError('Invalid date')
      setDisabled(true)
    } else {
      setDisabled(disabled)
      if (!disabled) {
        delete value.error
      }
    }
  }, [value])

  return (
    <div className={style.CreationPageLabel}>
      <ScrollToTopOnMount />

      <div className={style.FancyExplanationCreate}>
        <h2>Investments Manager</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur at
          accumsan ligula. Nulla iaculis ligula tellus, eu eleifend purus
          pharetra vitae. Cras tristique diam in dolor ultrices, nec facilisis
          diam tempus. Aliquam quis mattis massa. Duis imperdiet mauris congue
          lectus dignis
        </p>
      </div>
      <div
        className={style.CreationPageLabelFDivide}
        style={{
          marginTop: '0px',
          paddingBottom: '10px',
          marginBottom: '20px',
          borderBottom: '1px solid #e7ecf4',
        }}>
        <label className={style.CreationPageLabelF}>
          <h6>Swap interval</h6>
          <Duration
            value={
              value?.swapToEtherInterval ??
              Object.values(context.timeIntervals)[0]
            }
            onChange={(e) =>
              onChange({
                ...value,
                swapToEtherInterval: e,
              })
            }
          />
        </label>
        <label className={style.CreationPageLabelF}>
          <h6>First swap event</h6>
          <input
            type="datetime-local"
            value={value?.firstSwapToEtherEvent ?? ''}
            onChange={(e) =>
              onChange({
                ...value,
                firstSwapToEtherEvent: e.currentTarget.value,
              })
            }
            min={getCurrentDateTime()}
            step="60"
          />
          {firstToETHDateError && (
            <p className={style.ErrorMessage}>{firstToETHDateError}</p>
          )}
        </label>
      </div>
      <label
        className={style.CreationPageLabelF}
        style={{
          marginTop: '0px',
          paddingBottom: '10px',
          marginBottom: '20px',
          borderBottom: '1px solid #e7ecf4',
        }}>
        <h6>Sell ETH to buy</h6>
        <InvestmentsManagerOperation
          amms={amms}
          value={value?.fromETH ?? fromETH}
          onChange={setFromETH}
          burn
        />
      </label>
      <label
        className={style.CreationPageLabelF}
        style={{
          marginTop: '0px',
          paddingBottom: '10px',
          marginBottom: '20px',
          borderBottom: '1px solid #e7ecf4',
        }}>
        <h6>Max Percentage per Token</h6>
        <input
          type="range"
          min="0"
          max="100"
          step="0.05"
          value={value?.maxPercentagePerToken ?? 0}
          onChange={(e) =>
            onChange({
              ...value,
              maxPercentagePerToken: e.currentTarget.value,
            })
          }
        />
        <span>{value?.maxPercentagePerToken ?? 0} %</span>
      </label>
      <label
        className={style.CreationPageLabelF}
        style={{
          marginTop: '0px',
          paddingBottom: '10px',
          marginBottom: '20px',
          borderBottom: '1px solid #e7ecf4',
        }}>
        <h6>Buy ETH selling</h6>
        <InvestmentsManagerOperation
          amms={amms}
          value={value?.toETH ?? toETH}
          onChange={setToETH}
          maxPercentagePerToken={value?.maxPercentagePerToken ?? 0}
        />
      </label>

      <label className="CreationPageLabelF">
        <h6
          style={{
            width: '100%',
            marginLeft: '20px',
            textAlign: 'left',
            marginTop: '20px',
          }}>
          Voting Rules
        </h6>
      </label>
      <div
        className={style.CreationPageLabelFDivideGroup}
        style={{ marginTop: '0px', marginBottom: '30px' }}>
        <div
          className={style.CreationPageLabelFDivide}
          style={{ marginTop: '30px', marginBottom: '30px' }}>
          <label className={style.CreationPageLabelF}>
            <h6>Quorum</h6>
            <p>Select the value of Quorum</p>
            <br />
            <br />
            <br />
            <CircularSlider
              label="Quorum"
              dataIndex={value?.quorumPercentage ?? 0}
              labelColor="#fff"
              knobColor="#000000"
              width="120"
              knobSize="25"
              progressSize="9"
              trackSize="14"
              labelFontSize="10"
              valueFontSize="20"
              appendToValue="%"
              progressColorFrom="#000000"
              progressColorTo="#444444"
              trackColor="#eeeeee"
              min={0}
              max={100}
              initialValue={0}
              onChange={(e) => {
                onChange({
                  ...value,
                  quorumPercentage: e,
                })
              }}
            />
          </label>

          <label className={style.CreationPageLabelF}>
            <h6>Hard cap</h6>
            <p>Select the value of Hard cap</p>
            <br />
            <br />
            <br />
            <CircularSlider
              label="Hard cap"
              dataIndex={value?.hardCapPercentage ?? 0}
              labelColor="#fff"
              width="120"
              knobSize="25"
              progressSize="9"
              trackSize="14"
              labelFontSize="10"
              valueFontSize="20"
              knobColor="#000000"
              progressColorFrom="#000000"
              progressColorTo="#444444"
              appendToValue="%"
              trackColor="#eeeeee"
              min={0}
              max={100}
              onChange={(e) =>
                onChange({
                  ...value,
                  hardCapPercentage: e,
                })
              }
            />
          </label>
          {value?.error?.quorumPercentage && (
            <p className={style.ErrorMessage}>{value.error.quorumPercentage}</p>
          )}
        </div>

        <div
          className={style.CreationPageLabelFDivide}
          style={{
            marginTop: '30px',
            marginBottom: '30px',
            borderLeft: '1px solid #e7ecf4',
          }}>
          <label className={style.CreationPageLabelF}>
            <h6>Proposal Duration</h6>
            <p>Select the duration of Proposal</p>
            <br />
            <br />
            <br />
            <CircularSlider
              progressLineCap="flat"
              dataIndex={
                value?.proposalDuration != null
                  ? dataTime.indexOf(value?.proposalDuration)
                  : 0
              }
              label="Duration"
              data={dataTime}
              labelColor="#fff"
              knobColor="#000000"
              width="120"
              knobSize="25"
              progressSize="9"
              trackSize="14"
              labelFontSize="10"
              valueFontSize="20"
              verticalOffset="1rem"
              progressColorFrom="#000000"
              progressColorTo="#444444"
              trackColor="#eeeeee"
              onChange={(e) =>
                onChange({
                  ...value,
                  proposalDuration: e,
                })
              }
            />
          </label>
          <label className={style.CreationPageLabelF}>
            <h6>Validation Bomb</h6>
            <p>Select Validation Bomb value</p>
            <br />
            <br />
            <br />
            <CircularSlider
              progressLineCap="flat"
              dataIndex={
                value?.validationBomb != null
                  ? dataTime.indexOf(value?.validationBomb)
                  : 1
              }
              label="Duration"
              data={dataTime}
              labelColor="#fff"
              knobColor="#000000"
              width="120"
              knobSize="25"
              progressSize="9"
              trackSize="14"
              labelFontSize="10"
              valueFontSize="20"
              verticalOffset="1rem"
              progressColorFrom="#000000"
              progressColorTo="#444444"
              trackColor="#eeeeee"
              onChange={(e) =>
                onChange({
                  ...value,
                  validationBomb: e,
                })
              }
            />
          </label>
          {value?.error?.proposalDuration && (
            <p className={style.ErrorMessage}>{value.error.proposalDuration}</p>
          )}
        </div>
      </div>

      <div className={style.WizardFooter}>
        <button className={style.WizardFooterBack} onClick={onPrev}>
          Back
        </button>
        <button
          className={style.WizardFooterNext}
          onClick={onNext}
          disabled={disabled}>
          Next
        </button>
      </div>
    </div>
  )
}

const InvestmentsManagerOperation = ({
  value,
  onChange,
  amms,
  burn,
  maxPercentagePerToken,
}) => {
  const addMore = useMemo(() => !value || value.length < 5, [value])

  useEffect(() => {
    if (
      !value ||
      isNaN(maxPercentagePerToken) ||
      (value &&
        !isNaN(maxPercentagePerToken) &&
        value.filter((it) => it.percentage > maxPercentagePerToken).length == 0)
    ) {
      return
    }
    onChange(
      value.map((it) => ({
        ...it,
        percentage:
          it.percentage > maxPercentagePerToken
            ? maxPercentagePerToken
            : it.percentage,
      }))
    )
  }, [value, maxPercentagePerToken])

  return (
    <div>
      {addMore && (
        <div>
          <a
            className={style.PercentageComponentPlus}
            onClick={() =>
              onChange([
                ...value,
                {
                  amm: undefined,
                  token: undefined,
                  burn: false,
                  percentage: maxPercentagePerToken,
                },
              ])
            }>
            <h4>+</h4>
          </a>
        </div>
      )}
      {value &&
        value.map((it, i) => (
          <div key={`${i}_${it.token?.address}_${it.amm?.address}`}>
            <TokenInputRegular
              selected={it.token}
              onElement={(v) =>
                onChange(
                  value.map((elem, index) =>
                    index === i ? { ...elem, token: v } : elem
                  )
                )
              }
              noBalance
              tokenOnly
              noETH
              onlySelections={['ERC-20']}
            />
            <span>On</span>
            <ActionInfoSection
              settings
              uniV3Pool={it.uniV3Pool}
              onUniV3Pool={(v) =>
                onChange(
                  value.map((elem, index) =>
                    index === i ? { ...elem, uniV3Pool: v } : elem
                  )
                )
              }
              ammsInput={amms}
              amm={it.amm}
              onAMM={(v) =>
                onChange(
                  value.map((elem, index) =>
                    index === i ? { ...elem, amm: v } : elem
                  )
                )
              }
            />
            {burn && (
              <label>
                <span>Then burn</span>
                <input
                  type="checkbox"
                  checked={it.burn}
                  onChange={(v) =>
                    onChange(
                      value.map((elem, index) =>
                        index === i
                          ? { ...elem, burn: v.currentTarget.checked }
                          : elem
                      )
                    )
                  }
                />
              </label>
            )}
            {!isNaN(maxPercentagePerToken) && (
              <label>
                <span>Percentage</span>
                <input
                  type="range"
                  min="0"
                  max={maxPercentagePerToken}
                  step="0.05"
                  checked={it.percentage}
                  value={it.percentage}
                  onChange={(v) =>
                    onChange(
                      value.map((elem, index) =>
                        index === i
                          ? {
                              ...elem,
                              percentage: parseFloat(v.currentTarget.value),
                            }
                          : elem
                      )
                    )
                  }
                />
                <span>{it.percentage} %</span>
              </label>
            )}
            <div>
              <a
                className={style.RoundedButton}
                onClick={() =>
                  onChange(value.filter((_, index) => index !== i))
                }>
                <h4>X</h4>
              </a>
            </div>
          </div>
        ))}
    </div>
  )
}

const CreateOrganization = () => {
  const context = useEthosContext()
  const web3Data = useWeb3()

  const [state, setState] = useState()

  const [amms, setAMMs] = useState()

  const [step, setStep] = useState(0)

  const disabled = useMemo(
    () =>
      !state || Object.values(state).filter((it) => it && it.errors).length > 0,
    [state]
  )

  dataTime = Object.keys(context.timeIntervals)

  useEffect(() => getAMMs({ context, ...web3Data }).then(setAMMs), [])

  if (!amms) {
    return <OurCircularProgress />
  }
  return (
    <div className={style.CreatePage}>
      <ScrollToTopOnMount />

      <div className={style.WizardStepsList}>
        <ul>
          <li className={step === 0 ? style.WizardStepsListActive : ''}>
            Basic Info
          </li>
          <li className={step === 1 ? style.WizardStepsListActive : ''}>
            Governance Rules
          </li>
          <li className={step === 2 ? style.WizardStepsListActive : ''}>
            Organization Treasury
          </li>
          <li className={step === 3 ? style.WizardStepsListActive : ''}>
            Voting Rules
          </li>
          <li className={step === 4 ? style.WizardStepsListActive : ''}>
            Fixed Inflation
          </li>
          <li className={step === 5 ? style.WizardStepsListActive : ''}>
            Treasury Splitter
          </li>
          <li className={step === 6 ? style.WizardStepsListActive : ''}>
            Delegations Manager
          </li>
          <li className={step === 7 ? style.WizardStepsListActive : ''}>
            Investments Manager
          </li>
          <li className={step === 8 ? style.WizardStepsListActive : ''}>
            Confirmation
          </li>
        </ul>
      </div>
      <div className={style.WizardHeader}>
        <h3>
          Create a new Organization <span>step {step + 1} of 9</span>
        </h3>
        <div className={style.WizardHeaderDescription}>
          Organizations are fully decentralized DAOs with modular economic
          components
        </div>
        <div className={style.WizardProgress}>
          <div
            className={style.WizardProgressBar}
            style={{
              width: ((100 / 8) * step > 0 ? (100 / 8) * step : 1) + '%',
            }}></div>
        </div>
      </div>
      <div className={style.WizardStep}>
        {step == 0 && (<>
            <div className={style.FancyExplanationCreate}>
              <div>
                  <h6>Disclaimer</h6>
                  <br/>
                  <div style={{"textAlign" : "justify"}}>
                      This Smart Contracts associated to this Organization creation form, are currently in a BETA phase and in continuous development and experimental testing. Given the completely decentralized nature, the protocol does not guarantee in any way the absolute quality or reliability of the services offered. Users participating in this testing phase are aware of the risks and agree to act at their own risk, therefore declaring that they understand and accept the risks associated with participation in the BETA testing phase.
                  </div>
              </div>
              <br/><br/>
              <div>
                  <h6>Warnings</h6>
                  <br/>
                  <div style={{"textAlign" : "justify"}}>
                      Risk of loss of funds: Participation in an organization created with this form carries the risk of losing funds or digital assets due to security vulnerabilities, bugs or errors in the implementation of Smart Contracts and in the Frontend.<br/>
                      Limitation of Liability: The developers and operators of the Protocol will not be held responsible for any loss of funds, damages or inconvenience resulting from the organizations use in this experimental BETA phase. The software created is released "AS IS" and no express or implicit guarantee of merchantability, suitability for a purpose or correct functioning of the same is provided.<br/>
                      Code Review: Users are encouraged to carefully review the source code of the Created Organization and fully understand how Smart Contracts work before participating. It is advisable to consult IT security experts to assess the robustness of the Organization.<br/>
                      No support: No official technical support is provided during this BETA phase.<br/>
                      Users are responsible for independently managing their participation in the Organizations created through this form.<br/>
                  </div>
              </div>
          </div>
          <Metadata
            value={state?.metadata}
            onChange={(value) => setState({ ...state, metadata: value })}
            onNext={() => setStep(1)}
            onPrev={() => setStep(0)}
          />
          </>
        )}
        {step == 1 && (
          <Governance
            value={state?.governance}
            onChange={(value) => setState({ ...state, governance: value })}
            onNext={() => setStep(2)}
            onPrev={() => setStep(0)}
          />
        )}

        {step == 2 && (
          <Organization
            value={state?.organization}
            onChange={(value) => setState({ ...state, organization: value })}
            onNext={() => setStep(3)}
            onPrev={() => setStep(1)}
          />
        )}

        {step == 3 && (
          <VotingRules
            value={state?.votingRules}
            onChange={(value) => setState({ ...state, votingRules: value })}
            onNext={() => setStep(4)}
            onPrev={() => setStep(2)}
          />
        )}

        {step == 4 && (
          <FixedInflation
            value={state?.fixedInflation}
            onChange={(value) => setState({ ...state, fixedInflation: value })}
            onNext={() => setStep(5)}
            onPrev={() => setStep(3)}
          />
        )}

        {step == 5 && (
          <TreasurySplitterManager
            value={state?.treasurySplitter}
            onChange={(value) =>
              setState({ ...state, treasurySplitter: value })
            }
            onNext={() => setStep(6)}
            onPrev={() => setStep(4)}
          />
        )}

        {step == 6 && (
          <DelegationsManager
            value={state?.delegationsManager}
            onChange={(value) =>
              setState({ ...state, delegationsManager: value })
            }
            onNext={() => setStep(7)}
            onPrev={() => setStep(5)}
          />
        )}

        {step == 7 && (
          <InvestmentsManager
            amms={amms}
            value={state?.investmentsManager}
            onChange={(value) =>
              setState({ ...state, investmentsManager: value })
            }
            onNext={() => setStep(8)}
            onPrev={() => setStep(6)}
          />
        )}

        {step == 8 && (
          <Confirmation
            value={state?.confirmation}
            disabled={disabled}
            onChange={(value) => setState({ ...state, confirmation: value })}
            onNext={() => setStep(5)}
            onPrev={() => setStep(7)}
            state={state}
            dataTime={dataTime}
          />
        )}
      </div>
    </div>
  )
}

CreateOrganization.menuVoice = {
  path: '/organizations/create/organization',
}

export default CreateOrganization
