import React, { useCallback, useEffect, useMemo, useState } from 'react'

import {
  Style,
  useEthosContext,
  useWeb3,
  VOID_ETHEREUM_ADDRESS,
  web3Utils,
} from 'interfaces-core'

import { useHistory } from 'react-router-dom'

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

const components = [
  'COMPONENT_KEY_TREASURY_MANAGER',
  'COMPONENT_KEY_TREASURY_SPLITTER_MANAGER',
  'COMPONENT_KEY_DELEGATIONS_MANAGER',
  'COMPONENT_KEY_INVESTMENTS_MANAGER',
]

import AreaClosed from '@visx/shape/lib/shapes/AreaClosed'
import { curveMonotoneX } from '@visx/curve'
import {
  scaleUtc,
  scaleLinear,
  scaleLog,
  scaleBand,
  coerceNumber,
} from '@visx/scale'
import { Orientation } from '@visx/axis'
import {
  AnimatedAxis,
  AnimatedGridRows,
  AnimatedGridColumns,
} from '@visx/react-spring'
import { LinearGradient } from '@visx/gradient'
import { timeFormat } from 'd3-time-format'
import { GradientPinkBlue } from '@visx/gradient'
import Pie, { ProvidedProps, PieArcDatum } from '@visx/shape/lib/shapes/Pie'
import letterFrequency, {
  LetterFrequency,
} from '@visx/mock-data/lib/mocks/letterFrequency'
import browserUsage, {
  BrowserUsage as Browsers,
} from '@visx/mock-data/lib/mocks/browserUsage'
import { scaleOrdinal } from '@visx/scale'

import { animated, useTransition, interpolate } from '@react-spring/web'

import { Group } from '@visx/group'
export const backgroundColor = '#da7cff'
const axisColor = '#fff'
const tickLabelColor = '#fff'
export const labelColor = '#340098'
const gridColor = '#6e0fca'
const margin = {
  top: 40,
  right: 150,
  bottom: 20,
  left: 50,
}

const tickLabelProps = () => ({
  fill: tickLabelColor,
  fontSize: 12,
  fontFamily: 'sans-serif',
  textAnchor: 'middle',
})

const letters = [
  { frequency: 0.2, letter: 'SubValue 1' },
  { frequency: 0.49, letter: 'SubValue 2' },
  { frequency: 0.1, letter: 'SubValue 3' },
]
const browserNames = Object.keys(browserUsage[0]).filter((k) => k !== 'date')
const browsers = [
  {
    label: 'Value 1',
    usage: 0.3,
  },
  {
    label: 'Value 2',
    usage: 0.3,
  },
  {
    label: 'Value 3',
    usage: 0.3,
  },
]

// accessor functions
const usage = (d) => d.usage
const frequency = (d) => d.frequency

// color scales
const getBrowserColor = scaleOrdinal({
  domain: browserNames,
  range: [
    'rgba(179,33,86,0.7)',
    'rgba(179,33,86,0.6)',
    'rgba(151,213,244,0.6)',
    'rgba(40,40,40,0.4)',
    'rgba(40,40,40,0.3)',
    'rgba(40,40,40,0.2)',
    'rgba(40,40,40,0.1)',
  ],
})
const getLetterFrequencyColor = scaleOrdinal({
  domain: letters.map((l) => l.letter),
  range: [
    'rgba(231,57,197, 0.8)',
    'rgba(121,135,228,0.8)',
    'rgba(242,142,221,0.6)',
    'rgba(93,30,91,0.4)',
  ],
})

const defaultMargin = { top: 20, right: 20, bottom: 20, left: 20 }

const getMinMax = (vals) => {
  const numericVals = vals.map(coerceNumber)
  return [(Math.min(...numericVals), Math.max(...numericVals))]
}

function Example({
  width: outerWidth = 600,
  height: outerHeight = 600,
  showControls = true,
  margin = defaultMargin,
  animate = true,
}) {
  const width = outerWidth - margin.left - margin.right
  const height = outerHeight - margin.top - margin.bottom

  const [selectedBrowser, setSelectedBrowser] = useState(null)
  const [selectedAlphabetLetter, setSelectedAlphabetLetter] = useState(null)

  if (width < 10) return null

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom
  const radius = Math.min(innerWidth, innerHeight) / 2
  const centerY = innerHeight / 2
  const centerX = innerWidth / 2
  const donutThickness = 50

  const [dataToggle] = useState(true)
  const [animationTrajectory] = useState('center')

  const axes = useMemo(() => {
    const linearValues = dataToggle ? [0, 2, 4, 6, 8, 10] : [6, 8, 10, 12]
    console.log(letters)
    return [
      {
        scale: scaleLinear({
          domain: getMinMax(linearValues),
          range: [0, width],
        }),
        values: linearValues,
        tickFormat: (v, index, ticks) =>
          index === 0
            ? 'first'
            : index === ticks[ticks.length - 1].index
            ? 'last'
            : `${v}`,
        label: 'linear',
      },
    ]
  }, [dataToggle, width])

  if (width < 10) return null

  const scalePadding = 40
  const scaleHeight = height / axes.length - scalePadding

  const yScale = scaleLinear({
    domain: [100, 0],
    range: [scaleHeight, 0],
  })

  return (
    <>
      <svg width={width} height={height}>
        <rect rx={14} width={width} height={height} fill="#fff" />
        <Group top={centerY + margin.top} left={centerX + margin.left}>
          <Pie
            data={
              selectedBrowser
                ? browsers.filter(({ label }) => label === selectedBrowser)
                : browsers
            }
            pieValue={usage}
            outerRadius={radius}
            innerRadius={radius - donutThickness}
            cornerRadius={3}
            padAngle={0.005}>
            {(pie) => (
              <AnimatedPie
                {...pie}
                animate={animate}
                getKey={(arc) => arc.data.label}
                onClickDatum={({ data: { label } }) =>
                  animate &&
                  setSelectedBrowser(
                    selectedBrowser && selectedBrowser === label ? null : label
                  )
                }
                getColor={(arc) => getBrowserColor(arc.data.label)}
              />
            )}
          </Pie>
          <Pie
            data={
              selectedAlphabetLetter
                ? letters.filter(
                    ({ letter }) => letter === selectedAlphabetLetter
                  )
                : letters
            }
            pieValue={frequency}
            pieSortValues={() => -1}
            outerRadius={radius - donutThickness * 1.3}>
            {(pie) => (
              <AnimatedPie
                {...pie}
                animate={animate}
                getKey={({ data: { letter } }) => letter}
                onClickDatum={({ data: { letter } }) =>
                  animate &&
                  setSelectedAlphabetLetter(
                    selectedAlphabetLetter && selectedAlphabetLetter === letter
                      ? null
                      : letter
                  )
                }
                getColor={({ data: { letter } }) =>
                  getLetterFrequencyColor(letter)
                }
              />
            )}
          </Pie>
        </Group>
        {animate && (
          <text
            textAnchor="end"
            x={width - 16}
            y={height - 16}
            fill="white"
            fontSize={11}
            fontWeight={300}
            pointerEvents="none"></text>
        )}
      </svg>
    </>
  )
}

const fromLeaveTransition = ({ endAngle }) => ({
  // enter from 360° if end angle is > 180°
  startAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  endAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  opacity: 0,
})
const enterUpdateTransition = ({ startAngle, endAngle }) => ({
  startAngle,
  endAngle,
  opacity: 1,
})

function AnimatedPie({ animate, arcs, path, getKey, getColor, onClickDatum }) {
  const transitions = useTransition(arcs, {
    from: animate ? fromLeaveTransition : enterUpdateTransition,
    enter: enterUpdateTransition,
    update: enterUpdateTransition,
    leave: animate ? fromLeaveTransition : enterUpdateTransition,
    keys: getKey,
  })
  return transitions((props, arc, { key }) => {
    const [centroidX, centroidY] = path.centroid(arc)
    const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1

    return (
      <g key={key}>
        <animated.path
          // compute interpolated path d attribute from intermediate angle values
          d={interpolate(
            [props.startAngle, props.endAngle],
            (startAngle, endAngle) =>
              path({
                ...arc,
                startAngle,
                endAngle,
              })
          )}
          fill={getColor(arc)}
          onClick={() => onClickDatum(arc)}
          onTouchStart={() => onClickDatum(arc)}
        />
        {hasSpaceForLabel && (
          <animated.g style={{ opacity: props.opacity }}>
            <text
              fill="white"
              x={centroidX}
              y={centroidY}
              dy=".33em"
              fontSize={9}
              textAnchor="middle"
              pointerEvents="none">
              {getKey(arc)}
            </text>
          </animated.g>
        )}
      </g>
    )
  })
}

const Metadata = ({ value, onChange, onNext, onPrev }) => {
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
        <h2>Basic Info</h2>
      </div>
      <label className={style.CreationPageLabelF}>
        <h6>Name*</h6>
        <p>Choose an unique name for your ogranization</p>
        <input
          type="text"
          value={value?.name}
          placeholder="Organization name"
          onChange={(e) => onChange({ ...value, name: e.currentTarget.value })}
        />
        {value?.error?.name && <p>{value.error.name}</p>}
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Description*</h6>
        <p>Enter the description of your Organization</p>
        <textarea
          value={value?.description}
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
              value={value?.image}
              placeholder="Organization Logo URL"
              onChange={(e) =>
                onChange({ ...value, image: e.currentTarget.value })
              }
            />
          )}
          {value?.error?.image && <p>{value.error.image}</p>}
        </label>
        <label className={style.CreationPageLabelF}>
          <h6>Website</h6>
          <p>The official website of your Organization</p>
          <input
            type="link"
            value={value?.url}
            placeholder="Organziation Website URL"
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
            value={value?.social_link}
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
            value={value?.community_link}
            placeholder="Community Invite Link"
            onChange={(e) =>
              onChange({ ...value, community_link: e.currentTarget.value })
            }
          />

          {value?.error?.community_link && <p>{value.error.community_link}</p>}
        </label>
      </div>
      <div className={style.WizardFooter}>
        <button className={style.WizardFooterNext} onClick={onNext}>
          Next
        </button>
      </div>
    </div>
  )
}

const Confirmation = ({ value, onChange, onNext, onPrev }) => {
  const [token, setToken] = useState(value?.token)
  const [proposalRules, setProposalRules] = useState(value?.proposalRules)

  const [hardCapValue, setHardCapValue] = useState(0)
  const [quorum, setQuorum] = useState(0)

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
    <div className={style.CreationPageLabel}>
      <div className={style.FancyExplanationCreate}>
        <h2>Confirmation</h2>
      </div>

      <h6
        style={{
          'text-align': 'left',
          'padding-left': '20px',
          'margin-bottom': '10px',
          'margin-top': '30px',
        }}>
        Review the settings of your fully granular Organization.
      </h6>
      <p
        style={{
          fontSize: '12px',
          textAlign: 'left',
          'padding-left': '20px',
        }}>
        Once you deploy, all changes will need to be made through a successful
        governance proposal and executed by holders of the governance token
        chosen.
      </p>

      <div
        className={style.CreationPageLabelFDivide}
        style={{ marginTop: '30px', marginBottom: '30px' }}>
        <label className={style.CreationPageLabelF}>
          <Example></Example>
        </label>
        <label className={style.CreationPageLabelF} key={quorumKey}></label>
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

const VotingRules = ({ value, onChange, onNext, onPrev }) => {
  const [token, setToken] = useState(value?.token)
  const [proposalRules, setProposalRules] = useState(value?.proposalRules)

  const [hardCapValue, setHardCapValue] = useState(0)
  const [quorum, setQuorum] = useState(0)

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
    <div className={style.CreationPageLabel}>
      <div className={style.FancyExplanationCreate}>
        <h2>Voting Rules</h2>
      </div>
      {/*
      <h6
        style={{
          'text-align': 'left',
          'padding-left': '20px',
          'margin-bottom': '10px',
          'margin-top': '30px',
        }}>
        Lorem ipsum sim dolor amed
      </h6>*/}
      <p
        style={{
          fontSize: '12px',
          textAlign: 'left',
          'padding-left': '20px',
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
          <label className={style.CreationPageLabelF} key={quorumKey}>
            <h6>Quorum</h6>
            <p>Selelct the value of Quorum</p>
            <br />
            <br />
            <br />
            <CircularSlider
              label="Quorum"
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
              initialValue={quorum}
              onChange={(value) => {
                setQuorum(value)
              }}
            />
          </label>

          <label className={style.CreationPageLabelF}>
            <h6>Hard cap</h6>
            <p>Selelct the value of Hard cap</p>
            <br />
            <br />
            <br />
            <CircularSlider
              label="Hard cap"
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
              onChange={(value) => {
                setHardCapValue(value)
              }}
            />
          </label>
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
            <p>Selelct the duration of Proposal</p>
            <br />
            <br />
            <br />
            <CircularSlider
              progressLineCap="flat"
              dataIndex={0}
              label="Duration"
              data={[
                '30min',
                '6h',
                '12h',
                '1 Day',
                '2 Days',
                '3 Days',
                '4 Days',
                '5 Days',
                '1 Week',
                '1 Month',
                '6 Months',
                '1 Year',
                '3 Years',
                '5 Years',
              ]}
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
            />
          </label>
          <label className={style.CreationPageLabelF}>
            <h6>Validation Bomb</h6>
            <p>Selelct Validation Bomb value</p>
            <br />
            <br />
            <br />
            <CircularSlider
              progressLineCap="flat"
              dataIndex={3}
              label="Duration"
              data={[
                '30min',
                '6h',
                '12h',
                '1 Day',
                '2 Days',
                '3 Days',
                '4 Days',
                '5 Days',
                '1 Week',
                '1 Month',
                '6 Months',
                '1 Year',
                '3 Years',
                '5 Years',
              ]}
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
            />
          </label>
        </div>
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

const Organization = ({ value, onChange, onNext, onPrev }) => {
  const [token, setToken] = useState(value?.token)
  const [proposalRules, setProposalRules] = useState(value?.proposalRules)

  const [hardCapValue, setHardCapValue] = useState(0)
  const [quorum, setQuorum] = useState(0)

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
    <div className={style.CreationPageLabel}>
      <div className={style.FancyExplanationCreate}>
        <h2>Organization Treasury</h2>
      </div>

      <div
        className={style.CreationPageLabelFDivide}
        style={{ display: 'flex' }}>
        <label className={style.CreationPageLabelF}>
          <ProgressComponent></ProgressComponent>
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
  const [token, setToken] = useState(value?.token)
  const [proposalRules, setProposalRules] = useState(value?.proposalRules)

  const [hardCapValue, setHardCapValue] = useState(0)
  const [quorum, setQuorum] = useState(0)

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
    <div className={style.CreationPageLabel}>
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
            selected={token}
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
                onChange({
                  ...value,
                  name: getCurrentAddress(),
                })
              }>
              Insert your current address
            </span>
          </h6>
          <p>Insert the host Address</p>
          <input
            type="text"
            value={value?.name}
            placeholder="The Organization host address"
            onChange={(e) =>
              onChange({ ...value, name: e.currentTarget.value })
            }
          />
          {value?.error?.name && <p>{value.error.name}</p>}
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
            <p>Selelct the value of Quorum</p>
            <br />
            <br />
            <br />
            <CircularSlider
              label="Quorum"
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
              initialValue={quorum}
              onChange={(value) => {
                setQuorum(value)
              }}
            />
          </label>
          <label className={style.CreationPageLabelF}>
            <h6>Hard cap</h6>
            <p>Selelct the value of Hard cap</p>
            <br />
            <br />
            <br />
            <CircularSlider
              label="Hard cap"
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
              onChange={(value) => {
                setHardCapValue(value)
              }}
            />
          </label>
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
            <p>Selelct the duration of Proposal</p>
            <br />
            <br />
            <br />
            <CircularSlider
              progressLineCap="flat"
              dataIndex={0}
              label="Duration"
              data={[
                '30min',
                '6h',
                '12h',
                '1 Day',
                '2 Days',
                '3 Days',
                '4 Days',
                '5 Days',
                '1 Week',
                '1 Month',
                '6 Months',
                '1 Year',
                '3 Years',
                '5 Years',
              ]}
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
            />
          </label>
          <label className={style.CreationPageLabelF}>
            <h6>Validation Bomb</h6>
            <p>Selelct Validation Bomb value</p>
            <br />
            <br />
            <br />
            <CircularSlider
              progressLineCap="flat"
              dataIndex={3}
              label="Duration"
              data={[
                '30min',
                '6h',
                '12h',
                '1 Day',
                '2 Days',
                '3 Days',
                '4 Days',
                '5 Days',
                '1 Week',
                '1 Month',
                '6 Months',
                '1 Year',
                '3 Years',
                '5 Years',
              ]}
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
            />
          </label>
        </div>
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

const Duration = ({ value, onChange, from }) => {
  return (
    <select
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

const ProposalRules = ({ value, onChange, showHost, title }) => {
  const [host, setHost] = useState(value?.host)
  const [proposalDuration, setProposalDuration] = useState(
    value?.proposalDuration || 0
  )
  const [hardCapPercentage, setHardCapPercentage] = useState(
    value?.hardCapPercentage || 0
  )
  const [quorumPercentage, setQuorumPercentage] = useState(
    value?.quorumPercentage || 0
  )
  const [validationBomb, setValidationBomb] = useState(
    value?.validationBomb || 0
  )

  useEffect(
    () =>
      onChange &&
      onChange({
        host,
        proposalDuration,
        hardCapPercentage,
        quorumPercentage,
        validationBomb,
      }),
    [
      host,
      proposalDuration,
      hardCapPercentage,
      quorumPercentage,
      validationBomb,
    ]
  )

  const showValidationBombWarning = useMemo(
    () =>
      validationBomb && proposalDuration
        ? validationBomb <= proposalDuration
        : undefined,
    [proposalDuration, validationBomb]
  )

  return (
    <div className={style.CreationPageLabel}>
      <div className={style.FancyExplanationCreate}>
        <h6>{title || 'Voting Rules'}</h6>
      </div>
      {showHost && (
        <label className={style.CreationPageLabelF}>
          <h6>Host address</h6>
          <input
            type="text"
            value={host}
            onChange={(e) => setHost(e.currentTarget.value)}
          />
        </label>
      )}
      <label className={style.CreationPageLabelF}>
        <h6>Proposal duration</h6>
        <Duration value={proposalDuration} onChange={setProposalDuration} />
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Hard cap percentage</h6>
        <p>
          <h8>{hardCapPercentage} %</h8>
        </p>
        <input
          type="range"
          min="0"
          max="100"
          value={hardCapPercentage}
          onChange={(e) =>
            setHardCapPercentage(parseFloat(e.currentTarget.value))
          }
        />
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Quorum</h6>
        <p>
          <h8>{quorumPercentage} %</h8>
        </p>
        <input
          type="range"
          min="0"
          max="100"
          value={quorumPercentage}
          onChange={(e) =>
            setQuorumPercentage(parseFloat(e.currentTarget.value))
          }
        />
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Validation bomb</h6>
        <Duration value={validationBomb} onChange={setValidationBomb} />
        {showValidationBombWarning && (
          <p>WARNING: Validation bomb must be higher than Proposal durration</p>
        )}
      </label>
    </div>
  )
}

const FixedInflation = ({ amms, value, onChange, onNext, onPrev }) => {
  const { account } = useWeb3()

  const defaultInflationPercentage = useMemo(() => 0.05)

  const [tokenMinterOwner, setTokenMinter] = useState(value?.tokenMinterOwner)
  const [giveBackOwnershipSeconds, setGiveBackOwnershipSeconds] = useState(
    value?.giveBackOwnershipSeconds
  )
  const [inflationPercentage0, setInflationPercentage0] = useState(
    value?.inflationPercentage0 || defaultInflationPercentage
  )
  const [inflationPercentage1, setInflationPercentage1] = useState(
    value?.inflationPercentage1 || defaultInflationPercentage
  )
  const [inflationPercentage2, setInflationPercentage2] = useState(
    value?.inflationPercentage2 || defaultInflationPercentage
  )
  const [inflationPercentage3, setInflationPercentage3] = useState(
    value?.inflationPercentage3 || defaultInflationPercentage
  )
  const [inflationPercentage4, setInflationPercentage4] = useState(
    value?.inflationPercentage4 || defaultInflationPercentage
  )
  const [inflationPercentage5, setInflationPercentage5] = useState(
    value?.inflationPercentage5 || defaultInflationPercentage
  )
  const [firstExecution, setFirstExecution] = useState(value?.firstExecution)

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

  const [proposalRules, setProposalRules] = useState(value?.proposalRules)

  const [hardCapValue, setHardCapValue] = useState(0)
  const [quorum, setQuorum] = useState(0)

  const [token, setToken] = useState(value?.token)

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

  useEffect(
    () =>
      onChange &&
      onChange({
        tokenMinterOwner,
        giveBackOwnershipSeconds,
        inflationPercentage0,
        inflationPercentage1,
        inflationPercentage2,
        inflationPercentage3,
        inflationPercentage4,
        inflationPercentage5,
        amm,
        uniV3Pool,
        _bootstrapFundWalletAddress,
        _bootstrapFundWalletPercentage,
        _bootstrapFundIsRaw,
        _rawTokenComponents,
        _swappedTokenComponents,
        firstExecution,
        proposalRules,
      }),
    [
      tokenMinterOwner,
      giveBackOwnershipSeconds,
      inflationPercentage0,
      inflationPercentage1,
      inflationPercentage2,
      inflationPercentage3,
      inflationPercentage4,
      inflationPercentage5,
      amm,
      uniV3Pool,
      _bootstrapFundWalletAddress,
      _bootstrapFundWalletPercentage,
      _bootstrapFundIsRaw,
      _rawTokenComponents,
      _swappedTokenComponents,
      firstExecution,
      proposalRules,
    ]
  )

  return (
    <div className={style.CreationPageLabel}>
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
            onClick={() =>
              onChange({
                tokenMinterOwner,
                inflationPercentage0,
                inflationPercentage1,
                inflationPercentage2,
                inflationPercentage3,
                inflationPercentage4,
                inflationPercentage5,
                amm,
                uniV3Pool,
                _bootstrapFundWalletAddress,
                _bootstrapFundWalletPercentage,
                _bootstrapFundIsRaw,
                _rawTokenComponents,
                _swappedTokenComponents,
                firstExecution,
                proposalRules,
              })
            }
          />
          <label for="fixedYes">Yes</label>
          <input
            type="radio"
            name="fixed"
            id="fixedNo"
            checked={value === undefined || value === null}
            onClick={() => onChange(null)}
          />
          <label for="fixedNo">No</label>
        </div>
      </div>

      {value && (
        <>
          <div
            className={style.CreationPageLabelFDivide}
            style={{
              marginTop: '20px',
              marginBottom: '20px',
              borderBottom: '1px solid #e7ecf4',
            }}>
            <label className={style.CreationPageLabelF}>
              <label>
                <h6>Give back mint permissions of the token</h6>
                <input
                  type="checkbox"
                  checked={tokenMinterOwner !== undefined}
                  onClick={() =>
                    setTokenMinter(
                      tokenMinterOwner !== undefined ? undefined : account
                    )
                  }
                />
              </label>
              {tokenMinterOwner !== undefined && (
                <>
                  <label className={style.CreationPageLabelF}>
                    <h6>To this address</h6>
                    <input
                      type="text"
                      value={tokenMinterOwner}
                      onChange={(e) => setTokenMinter(e.currentTarget.value)}
                    />
                  </label>
                  <label className={style.CreationPageLabelF}>
                    <h6>After</h6>
                    <Duration
                      value={giveBackOwnershipSeconds}
                      onChange={setGiveBackOwnershipSeconds}
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
                value={firstExecution}
                onChange={(e) => setFirstExecution(e.currentTarget.value)}
              />
            </label>
          </div>

          <label className={style.CreationPageLabelF}>
            <h6>Inflation percentages</h6>
            <DonutAndLegend></DonutAndLegend>
          </label>

          {/* <label className={style.CreationPageLabelF}>
            <h6>Token minter owner</h6>
            <input
              type="text"
              value={tokenMinterOwner}
              onChange={(e) => setTokenMinter(e.currentTarget.value)}
            />
          </label> */}
          {/*
          <label className={style.CreationPageLabelF}>
            <h6>Initial Daily inflation percentage</h6>
            <p>
              <h8>{inflationPercentage0} %</h8>
            </p>
            <input
              type="range"
              min="0.05"
              max="100"
              step="0.05"
              value={inflationPercentage0}
              onChange={(e) =>
                setInflationPercentage0(parseFloat(e.currentTarget.value))
              }
            />
          </label>
          <label className={style.CreationPageLabelF}>
            <h6>Other Daily inflation percentages</h6>
            <label>
              <p>
                <h8>{inflationPercentage1} %</h8>
              </p>
              <input
                type="range"
                min="0.05"
                max="100"
                step="0.05"
                value={inflationPercentage1}
                onChange={(e) =>
                  setInflationPercentage1(parseFloat(e.currentTarget.value))
                }
              />
            </label>
            <label>
              <p>
                <h8>{inflationPercentage2} %</h8>
              </p>
              <input
                type="range"
                min="0.05"
                max="100"
                step="0.05"
                value={inflationPercentage2}
                onChange={(e) =>
                  setInflationPercentage2(parseFloat(e.currentTarget.value))
                }
              />
            </label>
            <label>
              <p>
                <h8>{inflationPercentage3} %</h8>
              </p>
              <input
                type="range"
                min="0.05"
                max="100"
                step="0.05"
                value={inflationPercentage3}
                onChange={(e) =>
                  setInflationPercentage3(parseFloat(e.currentTarget.value))
                }
              />
            </label>
            <label>
              <p>
                <h8>{inflationPercentage4} %</h8>
              </p>
              <input
                type="range"
                min="0.05"
                max="100"
                step="0.05"
                value={inflationPercentage4}
                onChange={(e) =>
                  setInflationPercentage4(parseFloat(e.currentTarget.value))
                }
              />
            </label>
            <label>
              <p>
                <h8>{inflationPercentage5} %</h8>
              </p>
              <input
                type="range"
                min="0.05"
                max="100"
                step="0.05"
                value={inflationPercentage5}
                onChange={(e) =>
                  setInflationPercentage5(parseFloat(e.currentTarget.value))
                }
              />
            </label>
          </label>
          */}

          <div className={style.CreationPageLabelFDivide}>
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
          <label className={style.CreationPageLabelF}>
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
          <label className={style.CreationPageLabelF}>
            <h6>Boostrap Fund is in token?</h6>
            <input
              type="checkbox"
              checked={_bootstrapFundIsRaw}
              onChange={(e) => set_bootstrapFundIsRaw(e.currentTarget.checked)}
            />
          </label>
          <label className={style.CreationPageLabelF}>
            <h6>Components that will receive tokens</h6>
            <ComponentPercentage
              value={_rawTokenComponents}
              onChange={set_rawTokenComponents}
              firstPercentage={
                _bootstrapFundIsRaw ? _bootstrapFundWalletPercentage || 0 : 0
              }
              lastHasPercentage
            />
          </label>
          <label className={style.CreationPageLabelF}>
            <h6>Components that will receive ETH</h6>
            <ComponentPercentage
              value={_swappedTokenComponents}
              onChange={set_swappedTokenComponents}
              firstPercentage={
                _bootstrapFundIsRaw ? 0 : _bootstrapFundWalletPercentage || 0
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
                <h6>Hard cap</h6>
                <p>Selelct the value of Hard cap</p>
                <br />
                <br />
                <br />
                <CircularSlider
                  label="Hard cap"
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
                  onChange={(value) => {
                    setHardCapValue(value)
                  }}
                />
              </label>
              <label className={style.CreationPageLabelF} key={quorumKey}>
                <h6>Quorum</h6>
                <p>Selelct the value of Quorum</p>
                <br />
                <br />
                <br />
                <CircularSlider
                  label="Quorum"
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
                  min={hardCapValue}
                  max={100}
                  initialValue={quorum}
                  onChange={(value) => {
                    setQuorum(value)
                  }}
                />
              </label>
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
                <p>Selelct the duration of Proposal</p>
                <br />
                <br />
                <br />
                <CircularSlider
                  progressLineCap="flat"
                  dataIndex={0}
                  label="Duration"
                  data={[
                    '30min',
                    '6h',
                    '12h',
                    '1 Day',
                    '2 Days',
                    '3 Days',
                    '4 Days',
                    '5 Days',
                    '1 Week',
                    '1 Month',
                    '6 Months',
                    '1 Year',
                    '3 Years',
                    '5 Years',
                  ]}
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
                />
              </label>
              <label className={style.CreationPageLabelF}>
                <h6>Validation Bomb</h6>
                <p>Selelct Validation Bomb value</p>
                <br />
                <br />
                <br />
                <CircularSlider
                  progressLineCap="flat"
                  dataIndex={3}
                  label="Duration"
                  data={[
                    '30min',
                    '6h',
                    '12h',
                    '1 Day',
                    '2 Days',
                    '3 Days',
                    '4 Days',
                    '5 Days',
                    '1 Week',
                    '1 Month',
                    '6 Months',
                    '1 Year',
                    '3 Years',
                    '5 Years',
                  ]}
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
                />
              </label>
            </div>
          </div>
        </>
      )}
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
          <h4>+</h4>
        </a>
      </div>
      {value.map((it, i) => (
        <div key={it.component + '_' + i}>
          <select
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
          <div>
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
          <a onClick={() => onChange(value.filter((_, index) => index !== i))}>
            -
          </a>
        </div>
      ))}
    </div>
  )
}

const TreasuryManager = ({ value, onChange }) => {
  const [maxPercentagePerToken, setMaxPercentagePerToken] = useState(
    value?.maxPercentagePerToken || 0
  )
  const [proposalRules, setProposalRules] = useState(value?.proposalRules)

  useEffect(
    () => onChange && onChange({ proposalRules, maxPercentagePerToken }),
    [proposalRules, maxPercentagePerToken]
  )

  return (
    <div className={style.CreationPageLabel}>
      <div className={style.FancyExplanationCreate}>
        <h6>Organization Treasury</h6>
      </div>
      <label className={style.CreationPageLabelF}>
        <h6>Percentage to move</h6>
        <input
          type="range"
          min="0"
          max="100"
          step="0.05"
          value={maxPercentagePerToken}
          onChange={(e) =>
            setMaxPercentagePerToken(parseFloat(e.currentTarget.value))
          }
        />
        <span>{maxPercentagePerToken} %</span>
      </label>
      <ProposalRules value={proposalRules} onChange={setProposalRules} />
    </div>
  )
}

const TreasurySplitterManager = ({ value, onChange }) => {
  const [splitInterval, setSplitInterval] = useState(value?.splitInterval || 0)
  const [firstSplitEvent, setFirstSplitEvent] = useState(
    value?.firstSplitEvent || ''
  )
  const [components, setComponents] = useState(value?.components || [])

  useEffect(
    () => onChange && onChange({ splitInterval, firstSplitEvent, components }),
    [splitInterval, firstSplitEvent, components]
  )

  return (
    <div className={style.CreationPageLabel}>
      <div className={style.FancyExplanationCreate}>
        <h6>Treasury Splitter</h6>
      </div>
      <label className={style.CreationPageLabelF}>
        <h6>Split interval</h6>
        <Duration value={splitInterval} onChange={setSplitInterval} />
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>First split event</h6>
        <input
          type="datetime-local"
          value={firstSplitEvent}
          onChange={(e) => setFirstSplitEvent(e.currentTarget.value)}
        />
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Components</h6>
        <ComponentPercentage value={components} onChange={setComponents} />
      </label>
    </div>
  )
}

const DelegationsManager = ({ value, onChange }) => {
  const [proposalRulesToBan, setProposalRulesToBan] = useState(
    value?.proposalRulesToBan
  )
  const [attachInsurance0, setAttachInsurance0] = useState(
    value?.attachInsurance0 || 0
  )
  const [attachInsurance1, setAttachInsurance1] = useState(
    value?.attachInsurance1 || 0
  )
  const [attachInsurance2, setAttachInsurance2] = useState(
    value?.attachInsurance2 || 0
  )
  const [attachInsurance3, setAttachInsurance3] = useState(
    value?.attachInsurance3 || 0
  )
  const [attachInsurance4, setAttachInsurance4] = useState(
    value?.attachInsurance4 || 0
  )
  const [attachInsurance5, setAttachInsurance5] = useState(
    value?.attachInsurance5 || 0
  )
  const [proposalRulesForInsurance, setProposalRulesForInsurance] = useState(
    value?.proposalRulesForInsurance
  )
  useEffect(
    () =>
      onChange &&
      onChange({
        proposalRulesToBan,
        attachInsurance0,
        attachInsurance1,
        attachInsurance2,
        attachInsurance3,
        attachInsurance4,
        attachInsurance5,
        proposalRulesForInsurance,
      }),
    [
      proposalRulesToBan,
      attachInsurance0,
      attachInsurance1,
      attachInsurance2,
      attachInsurance3,
      attachInsurance4,
      attachInsurance5,
      proposalRulesForInsurance,
    ]
  )

  return (
    <div className={style.CreationPageLabel}>
      <div className={style.FancyExplanationCreate}>
        <h6>Delegations Manager</h6>
      </div>
      <ProposalRules
        value={proposalRulesToBan}
        onChange={setProposalRulesToBan}
        title="Proposal Rules to ban bad delegations"
      />
      <label className={style.CreationPageLabelF}>
        <h6>Attach Insurance</h6>
        <input
          type="number"
          value={attachInsurance0}
          onChange={(e) => setAttachInsurance0(parseInt(e.currentTarget.value))}
        />
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Other Attach Insurance values</h6>
        <label>
          <input
            type="number"
            value={attachInsurance1}
            onChange={(e) =>
              setAttachInsurance1(parseInt(e.currentTarget.value))
            }
          />
        </label>
        <label>
          <input
            type="number"
            value={attachInsurance2}
            onChange={(e) =>
              setAttachInsurance2(parseInt(e.currentTarget.value))
            }
          />
        </label>
        <label>
          <input
            type="number"
            value={attachInsurance3}
            onChange={(e) =>
              setAttachInsurance3(parseInt(e.currentTarget.value))
            }
          />
        </label>
        <label>
          <input
            type="number"
            value={attachInsurance4}
            onChange={(e) =>
              setAttachInsurance4(parseInt(e.currentTarget.value))
            }
          />
        </label>
        <label>
          <input
            type="number"
            value={attachInsurance5}
            onChange={(e) =>
              setAttachInsurance5(parseInt(e.currentTarget.value))
            }
          />
        </label>
      </label>
      <ProposalRules
        value={proposalRulesForInsurance}
        onChange={setProposalRulesForInsurance}
      />
    </div>
  )
}

const InvestmentsManager = ({ amms, value, onChange }) => {
  const [swapToEtherInterval, setSwapToEtherInterval] = useState(
    value?.swapToEtherInterval || 0
  )
  const [firstSwapToEtherEvent, setFirstSwapToEtherEvent] = useState(
    value?.firstSwapToEtherEvent || ''
  )
  const [fromETH, setFromETH] = useState(value?.fromETH || [])
  const [toETH, setToETH] = useState(value?.toETH || [])
  const [maxPercentagePerToken, setMaxPercentagePerToken] = useState(
    value?.maxPercentagePerToken || 0
  )

  const [proposalRules, setProposalRules] = useState(value?.proposalRules)

  useEffect(
    () =>
      onChange &&
      onChange({
        swapToEtherInterval,
        firstSwapToEtherEvent,
        fromETH,
        toETH,
        maxPercentagePerToken,
        proposalRules,
      }),
    [
      swapToEtherInterval,
      firstSwapToEtherEvent,
      fromETH,
      toETH,
      maxPercentagePerToken,
      proposalRules,
    ]
  )

  return (
    <div className={style.CreationPageLabel}>
      <div className={style.FancyExplanationCreate}>
        <h6>Investments Manager</h6>
      </div>
      <label className={style.CreationPageLabelF}>
        <h6>Swap interval</h6>
        <Duration
          value={swapToEtherInterval}
          onChange={setSwapToEtherInterval}
        />
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>First swap event</h6>
        <input
          type="datetime-local"
          value={firstSwapToEtherEvent}
          onChange={(e) => setFirstSwapToEtherEvent(e.currentTarget.value)}
        />
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Sell ETH to buy</h6>
        <InvestmentsManagerOperation
          amms={amms}
          value={fromETH}
          onChange={setFromETH}
          burn
        />
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Max Percentage per Token</h6>
        <input
          type="range"
          min="0"
          max="100"
          step="0.05"
          value={maxPercentagePerToken}
          onChange={(e) =>
            setMaxPercentagePerToken(parseFloat(e.currentTarget.value))
          }
        />
        <span>{maxPercentagePerToken} %</span>
      </label>
      <label className={style.CreationPageLabelF}>
        <h6>Buy ETH selling</h6>
        <InvestmentsManagerOperation
          amms={amms}
          value={toETH}
          onChange={setToETH}
          maxPercentagePerToken={maxPercentagePerToken}
        />
      </label>
      <ProposalRules value={proposalRules} onChange={setProposalRules} />
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
                onClick={() =>
                  onChange(value.filter((_, index) => index !== i))
                }>
                <h4>-</h4>
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
  const history = useHistory()

  const initialData = useMemo(
    () => ({ context, ...web3Data }),
    [context, web3Data]
  )

  const [loading, setLoading] = useState(false)

  const [state, setState] = useState()

  const [amms, setAMMs] = useState()

  const [step, setStep] = useState(0)

  const disabled = useMemo(
    () =>
      !state || Object.values(state).filter((it) => it && it.errors).length > 0,
    [state]
  )

  const onClick = useCallback(
    () =>
      !disabled &&
      createOrganization(initialData, state).then((address) =>
        history.push(`/organizations/${address}`)
      ),
    [disabled, state]
  )

  useEffect(() => getAMMs({ context, ...web3Data }).then(setAMMs), [])

  if (!amms) {
    return <OurCircularProgress />
  }
  return (
    <div className={style.CreatePage}>
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
            Confirmation
          </li>
        </ul>
      </div>
      <div className={style.WizardHeader}>
        <h3>
          Create a new Organization <span>step {step + 1} of 6</span>
        </h3>
        <div className={style.WizardHeaderDescription}>
          Organizations are fully decentralized DAOs with modular economic
          components
        </div>
        <div className={style.WizardProgress}>
          <div
            className={style.WizardProgressBar}
            style={{
              width: ((100 / 5) * step > 0 ? (100 / 5) * step : 1) + '%',
            }}></div>
        </div>
      </div>
      <div className={style.WizardStep}>
        {step == 0 && (
          <Metadata
            value={state?.metadata}
            onChange={(value) => setState({ ...state, metadata: value })}
            onNext={() => setStep(1)}
            onPrev={() => setStep(0)}
          />
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
            value={state?.governance}
            onChange={(value) => setState({ ...state, governance: value })}
            onNext={() => setStep(3)}
            onPrev={() => setStep(1)}
          />
        )}

        {step == 3 && (
          <VotingRules
            value={state?.governance}
            onChange={(value) => setState({ ...state, governance: value })}
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
          <Confirmation
            value={state?.governance}
            onChange={(value) => setState({ ...state, governance: value })}
            onNext={() => setStep(5)}
            onPrev={() => setStep(3)}
          />
        )}
      </div>
    </div>

    /*<div className={style.CreatePage}>
        <div className={style.FancyExplanationCreate}>
            <h4>Create a new Organization (ALPHA)</h4>
        </div>
        <div className={style.FancyExplanationCreate}>
            <div>
                <h6>Disclaimer</h6>
                <br/>
                <div style={{"textAlign" : "justify"}}>
                    This form for the creation of an Organization, as well as the associated Smart Contracts and this entire website, are currently in an ALPHA phase and in continuous development and experimental testing. Given the completely decentralized nature, the protocol does not guarantee in any way the absolute quality or reliability of the services offered. Users participating in this testing phase are aware of the risks and agree to act at their own risk, therefore declaring that they understand and accept the risks associated with participation in the ALPHA testing phase.
                </div>
            </div>
            <br/><br/>
            <div>
                <h6>Warnings</h6>
                <br/>
                <div style={{"textAlign" : "justify"}}>
                    Risk of loss of funds: Participation in an organization created with this form carries the risk of losing funds or digital assets due to security vulnerabilities, bugs or errors in the implementation of Smart Contracts and in the Frontend.<br/>
                    Limitation of Liability: The developers and operators of the Protocol will not be held responsible for any loss of funds, damages or inconvenience resulting from the organizations use in this experimental ALPHA phase. The software created is released "AS IS" and no express or implicit guarantee of merchantability, suitability for a purpose or correct functioning of the same is provided.<br/>
                    Code Review: Users are encouraged to carefully review the source code of the Created Organization and fully understand how Smart Contracts work before participating. It is advisable to consult IT security experts to assess the robustness of the Organization.<br/>
                    No support: No official technical support is provided during this ALPHA phase.<br/>
                    Users are responsible for independently managing their participation in the Organizations created through this form.<br/>
                </div>
            </div>
        </div>
        <Metadata value={state?.metadata} onChange={value => setState({...state, metadata : value})}/>
        <Governance value={state?.governance} onChange={value => setState({...state, governance : value})}/>
        <TreasuryManager value={state?.treasuryManager} onChange={value => setState({...state, treasuryManager : value})}/>
        <FixedInflation amms={amms} value={state?.fixedInflation} onChange={value => setState({...state, fixedInflation : value})}/>
        <TreasurySplitterManager value={state?.treasurySplitter} onChange={value => setState({...state, treasurySplitter : value})}/>
        <DelegationsManager value={state?.delegationsManager} onChange={value => setState({...state, delegationsManager : value})}/>
        <InvestmentsManager amms={amms} value={state?.investmentsManager} onChange={value => setState({...state, investmentsManager : value})}/>
        <div className={style.ActionDeploy}>
            {loading && <CircularProgress/>}
            {!loading && <ActionAWeb3Button onClick={onClick} disabled={disabled}>Deploy</ActionAWeb3Button>}
        </div>
      </div>*/
  )
}

CreateOrganization.menuVoice = {
  path: '/organizations/create/organization',
}

export default CreateOrganization
