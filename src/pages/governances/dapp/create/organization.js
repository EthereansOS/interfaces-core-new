import React, {useCallback, useEffect, useMemo, useState} from 'react'

import { Style, useEthosContext, useWeb3, web3Utils } from '@ethereansos/interfaces-core'

import ActionAWeb3Button from '../../../../components/Global/ActionAWeb3Button'
import TokenInputRegular from '../../../../components/Global/TokenInputRegular'

import { createOrganization } from '../../../../logic/organization-2'

import CircularProgress from '../../../../components/Global/OurCircularProgress'
import style from '../../../../all.module.css'
import { getAMMs } from '../../../../logic/amm'

import ActionInfoSection from '../../../../components/Global/ActionInfoSection'
import OurCircularProgress from '../../../../components/Global/OurCircularProgress'

const components = [
    "COMPONENT_KEY_TREASURY_MANAGER",
    "COMPONENT_KEY_TREASURY_SPLITTER_MANAGER",
    "COMPONENT_KEY_DELEGATIONS_MANAGER",
    "COMPONENT_KEY_INVESTMENTS_MANAGER"
]

const Metadata = ({value, onChange}) => {

    useEffect(() => setTimeout(async () => {
        if(!value) {
            return
        }
        var error

        JSON.stringify(error) !== JSON.stringify(value.error) && onChange({...value, error})
    }), [value])

    return (
      <div className={style.CreationPageLabel}>
        <div className={style.FancyExplanationCreate}>
          <h6>Basic Info</h6>
        </div>
        <label className={style.CreationPageLabelF}>
          <h6>Name</h6>
          <input type="text" value={value?.name} onChange={e => onChange({...value, name : e.currentTarget.value})}/>
          {value?.error?.name && <p>{value.error.name}</p>}
        </label>
        <label className={style.CreationPageLabelF}>
          <h6>Description</h6>
          <textarea value={value?.description} onChange={e => onChange({...value, description : e.currentTarget.value})}/>
          {value?.error?.description && <p>{value.error.description}</p>}
        </label>
        <label className={style.CreationPageLabelF}>
          <h6>Logo</h6>
          <input type="link" value={value?.image} onChange={e => onChange({...value, image : e.currentTarget.value})}/>
          <p>A valid link for your Organization's logo. Please upload a square picture (.png, .gif or .jpg;) so that it fits perfectly with the EthereansOS interface style.</p>
          {value?.error?.image && <p>{value.error.image}</p>}
        </label>
        <label className={style.CreationPageLabelF}>
          <h6>Website</h6>
          <input type="link" value={value?.url} onChange={e => onChange({...value, url : e.currentTarget.value})}/>
          <p>The official website of your Organization.</p>
          {value?.error?.url && <p>{value.error.url}</p>}
        </label>
      </div>
    )
}

const Governance = ({value, onChange}) => {

    const [token, setToken] = useState(value?.token)
    const [proposalRules, setProposalRules] = useState(value?.proposalRules)

    useEffect(() => onChange && onChange({token, proposalRules}), [token, proposalRules])

    return (
      <div className={style.CreationPageLabel}>
        <div className={style.FancyExplanationCreate}>
          <h6>Governance Rules</h6>
        </div>
        <label className={style.CreationPageLabelF}>
          <h6>Voting Token</h6>
          <TokenInputRegular selected={token} onElement={setToken} noBalance noETH tokenOnly onlySelections={['ERC-20']}/>
        </label>
        <ProposalRules value={proposalRules} onChange={setProposalRules} showHost/>
      </div>
    )
}

const ProposalRules = ({value, onChange, showHost}) => {
    const [host, setHost] = useState(value?.host)
    const [proposalDuration, setProposalDuration] = useState(value?.proposalDuration || 0)
    const [hardCapPercentage, setHardCapPercentage] = useState(value?.hardCapPercentage || 0)
    const [quorumPercentage, setQuorumPercentage] = useState(value?.quorumPercentage || 0)
    const [validationBomb, setValidationBomb] = useState(value?.validationBomb || 0)

    useEffect(() => onChange && onChange({host, proposalDuration, hardCapPercentage, quorumPercentage, validationBomb}), [host, proposalDuration, hardCapPercentage, quorumPercentage, validationBomb])

    const showValidationBombWarning = useMemo(() => validationBomb && proposalDuration ? validationBomb <= proposalDuration : undefined, [proposalDuration, validationBomb])

    return (
      <div className={style.CreationPageLabel}>
        <div className={style.FancyExplanationCreate}>
          <h6>Voting Rules</h6>
        </div>
        {showHost && <label className={style.CreationPageLabelF}>
          <h6>Host address</h6>
          <input type="text" value={host} onChange={e => setHost(e.currentTarget.value)}/>
        </label>}
        <label className={style.CreationPageLabelF}>
          <h6>Proposal duration</h6>
          <input type="number" value={proposalDuration} onChange={e => setProposalDuration(parseInt(e.currentTarget.value))}/>
        </label>
        <label className={style.CreationPageLabelF}>
          <h6>Hard cap percentage</h6>
          <p>
            <h8>{hardCapPercentage} %</h8>
          </p>
          <input type="range" min="0" max="100" value={hardCapPercentage} onChange={e => setHardCapPercentage(parseFloat(e.currentTarget.value))}/>
        </label>
        <label className={style.CreationPageLabelF}>
          <h6>Quorum</h6>
          <p>
            <h8>{quorumPercentage} %</h8>
          </p>
          <input type="range" min="0" max="100" value={quorumPercentage} onChange={e => setQuorumPercentage(parseFloat(e.currentTarget.value))}/>
        </label>
        <label className={style.CreationPageLabelF}>
          <h6>Validation bomb</h6>
          <input type="number" value={validationBomb} onChange={e => setValidationBomb(parseInt(e.currentTarget.value))}/>
          {showValidationBombWarning && <p>WARNING: Validation bomb must be higher than Proposal durration</p>}
        </label>
      </div>
    )
}

const FixedInflation = ({amms, value, onChange}) => {

    const defaultInflationPercentage = useMemo(() => 0.05)

    const [tokenMinterOwner, setTokenMinter] = useState(value?.tokenMinterOwner)
    const [inflationPercentage0, setInflationPercentage0] = useState(value?.inflationPercentage0 || defaultInflationPercentage)
    const [inflationPercentage1, setInflationPercentage1] = useState(value?.inflationPercentage1 || defaultInflationPercentage)
    const [inflationPercentage2, setInflationPercentage2] = useState(value?.inflationPercentage2 || defaultInflationPercentage)
    const [inflationPercentage3, setInflationPercentage3] = useState(value?.inflationPercentage3 || defaultInflationPercentage)
    const [inflationPercentage4, setInflationPercentage4] = useState(value?.inflationPercentage4 || defaultInflationPercentage)
    const [firstExecution, setFirstExecution] = useState(value?.firstExecution)

    const [amm, setAMM] = useState(value?.amm)
    const [uniV3Pool, setUniV3Pool] = useState(value?.uniV3Pool)
    const [_bootstrapFundWalletAddress, set_bootstrapFundWalletAddress] = useState(value?._bootstrapFundWalletAddress)
    const [_bootstrapFundWalletPercentage, set_bootstrapFundWalletPercentage] = useState(value?._bootstrapFundWalletPercentage || 0)
    const [_bootstrapFundIsRaw, set_bootstrapFundIsRaw] = useState(value?._bootstrapFundIsRaw || false)
    const [_rawTokenComponents, set_rawTokenComponents] = useState(value?._rawTokenComponents || [])
    const [_swappedTokenComponents, set_swappedTokenComponents] = useState(value?._swappedTokenComponents || [])

    const [proposalRules, setProposalRules] = useState(value?.proposalRules)

    useEffect(() => onChange && onChange({tokenMinterOwner, inflationPercentage0, inflationPercentage1, inflationPercentage2, inflationPercentage3, inflationPercentage4, amm, uniV3Pool, _bootstrapFundWalletAddress, _bootstrapFundWalletPercentage, _bootstrapFundIsRaw, _rawTokenComponents, _swappedTokenComponents, firstExecution, proposalRules}), [tokenMinterOwner, inflationPercentage0, inflationPercentage1, inflationPercentage2, inflationPercentage3, inflationPercentage4, amm, uniV3Pool, _bootstrapFundWalletAddress, _bootstrapFundWalletPercentage, _bootstrapFundIsRaw, _rawTokenComponents, _swappedTokenComponents, firstExecution, proposalRules])

    return (
      <div className={style.CreationPageLabel}>
        <div className={style.FancyExplanationCreate}>
          <h6>Fixed Inflation</h6>
        </div>
        <label>
            Yes
            <input type="radio" checked={value !== undefined && value !== null} onClick={() => onChange({tokenMinterOwner, inflationPercentage0, inflationPercentage1, inflationPercentage2, inflationPercentage3, inflationPercentage4, amm, uniV3Pool, _bootstrapFundWalletAddress, _bootstrapFundWalletPercentage, _bootstrapFundIsRaw, _rawTokenComponents, _swappedTokenComponents, firstExecution, proposalRules})}/>
        </label>
        {'\u00a0'}
        <label>
            No
            <input type="radio" checked={value === undefined || value === null} onClick={() => onChange(null)}/>
        </label>
        {value && <>
            <label className={style.CreationPageLabelF}>
                <h6>Token minter owner</h6>
                <input type="text" value={tokenMinterOwner} onChange={e => setTokenMinter(e.currentTarget.value)}/>
            </label>
            <label className={style.CreationPageLabelF}>
                <h6>Initial Daily inflation percentage</h6>
                <p>
                    <h8>{inflationPercentage0} %</h8>
                </p>
                <input type="range" min="0.05" max="100" step="0.05" value={inflationPercentage0} onChange={e => setInflationPercentage0(parseFloat(e.currentTarget.value))}/>
            </label>
            <label className={style.CreationPageLabelF}>
                <h6>Other Daily inflation percentages</h6>
                <label>
                    <p>
                        <h8>{inflationPercentage1} %</h8>
                    </p>
                    <input type="range" min="0.05" max="100" step="0.05" value={inflationPercentage1} onChange={e => setInflationPercentage1(parseFloat(e.currentTarget.value))}/>
                </label>
                <label>
                    <p>
                        <h8>{inflationPercentage2} %</h8>
                    </p>
                    <input type="range" min="0.05" max="100" step="0.05" value={inflationPercentage2} onChange={e => setInflationPercentage2(parseFloat(e.currentTarget.value))}/>
                </label>
                <label>
                    <p>
                        <h8>{inflationPercentage3} %</h8>
                    </p>
                    <input type="range" min="0.05" max="100" step="0.05" value={inflationPercentage3} onChange={e => setInflationPercentage3(parseFloat(e.currentTarget.value))}/>
                </label>
                <label>
                    <p>
                        <h8>{inflationPercentage4} %</h8>
                    </p>
                    <input type="range" min="0.05" max="100" step="0.05" value={inflationPercentage4} onChange={e => setInflationPercentage4(parseFloat(e.currentTarget.value))}/>
                </label>
            </label>
            <label className={style.CreationPageLabelF}>
                <h6>First Execution</h6>
                <input type="datetime-local" value={firstExecution} onChange={e => setFirstExecution(e.currentTarget.value)}/>
            </label>
            <label className={style.CreationPageLabelF}>
                <h6>Swap for ETH AMM</h6>
                <ActionInfoSection settings ammsInput={amms} amm={amm} onAMM={setAMM} uniV3Pool={uniV3Pool} onUniV3Pool={setUniV3Pool}/>
            </label>
            <label className={style.CreationPageLabelF}>
                <h6>Boostrap Fund wallet</h6>
                <input type="text" value={_bootstrapFundWalletAddress} onChange={e => set_bootstrapFundWalletAddress(e.currentTarget.value)}/>
            </label>
            <label className={style.CreationPageLabelF}>
                <h6>Bootstrap Fund percentage</h6>
                <p>
                    <h8>{_bootstrapFundWalletPercentage} %</h8>
                </p>
                <input type="range" min="0" max="100" step="0.05" value={_bootstrapFundWalletPercentage} onChange={e => set_bootstrapFundWalletPercentage(parseFloat(e.currentTarget.value))}/>
            </label>
            <label className={style.CreationPageLabelF}>
                <h6>Boostrap Fund is in token?</h6>
                <input type="checkbox" checked={_bootstrapFundIsRaw} onChange={e => set_bootstrapFundIsRaw(e.currentTarget.checked)}/>
            </label>
            <label className={style.CreationPageLabelF}>
                <h6>Components that will receive tokens</h6>
                <ComponentPercentage value={_rawTokenComponents} onChange={set_rawTokenComponents} firstPercentage={_bootstrapFundIsRaw ? _bootstrapFundWalletPercentage || 0 : 0} lastHasPercentage/>
            </label>
            <label className={style.CreationPageLabelF}>
                <h6>Components that will receive ETH</h6>
                <ComponentPercentage value={_swappedTokenComponents} onChange={set_swappedTokenComponents} firstPercentage={_bootstrapFundIsRaw ? 0 : _bootstrapFundWalletPercentage || 0}/>
            </label>
            <ProposalRules value={proposalRules} onChange={setProposalRules}/>
        </>}
      </div>
    )
}

const ComponentPercentage = ({value, onChange, firstPercentage, lastHasPercentage}) => {

    const lastPercentage = useMemo(() => lastHasPercentage ? 0 : 100 - (firstPercentage || 0) - value.reduce((acc, it) => acc + it.percentage, 0) , [value, firstPercentage, lastHasPercentage])

    return (
        <div>
            <div><a onClick={() => onChange([...value, { component : "", percentage : 0}])}><h4>+</h4></a></div>
            {value.map((it, i) => <div key={it.component + "_" + i}>
                <select value={it.component} onChange={e => onChange(value.map((elem, index) => ({...elem, component : i === index ? e.currentTarget.value : elem.component})))}>
                    <option value={""}>=== SELECT COMPONENT ===</option>
                    {components.map(it => <option key={it} value={it}>{it.split('COMPONENT_KEY_').join('').split('_').join(' ')}</option>)}
                </select>
                <div>
                    <h8>{lastHasPercentage || i < value.length - 1 ? it.percentage : lastPercentage} %</h8>
                </div>
                {(lastHasPercentage || i < value.length - 1) && <input type="range" min="0" max="100" step="0.05" value={it.percentage} onChange={e => onChange(value.map((elem, index) => ({...elem, percentage : i === index ? parseFloat(e.currentTarget.value) : elem.percentage})))}/>}
                <a onClick={() => onChange(value.filter((_, index) => index !== i))}>-</a>
            </div>)}
        </div>
    )
}

const TreasuryManager = ({value, onChange}) => {

    const [maxPercentagePerToken, setMaxPercentagePerToken] = useState(value?.maxPercentagePerToken || 0)
    const [proposalRules, setProposalRules] = useState(value?.proposalRules)

    useEffect(() => onChange && onChange({proposalRules, maxPercentagePerToken}), [proposalRules, maxPercentagePerToken])

    return (
        <div className={style.CreationPageLabel}>
            <div className={style.FancyExplanationCreate}>
                <h6>Organization Treasury</h6>
            </div>
            <label className={style.CreationPageLabelF}>
                <h6>Percentage to move</h6>
                <input type="range" min="0" max="100" step="0.05" value={maxPercentagePerToken} onChange={e => setMaxPercentagePerToken(parseFloat(e.currentTarget.value))}/>
                <span>{maxPercentagePerToken} %</span>
            </label>
            <ProposalRules value={proposalRules} onChange={setProposalRules}/>
        </div>
    )
}

const TreasurySplitterManager = ({value, onChange}) => {

    const [splitInterval, setSplitInterval] = useState(value?.splitInterval || 0)
    const [firstSplitEvent, setFirstSplitEvent] = useState(value?.firstSplitEvent || "")
    const [components, setComponents] = useState(value?.components || [])

    useEffect(() => onChange && onChange({splitInterval, firstSplitEvent, components}), [splitInterval, firstSplitEvent, components])

    return (
        <div className={style.CreationPageLabel}>
            <div className={style.FancyExplanationCreate}>
                <h6>Treasury Splitter</h6>
            </div>
            <label className={style.CreationPageLabelF}>
                <h6>Split interval</h6>
                <input type="number" value={splitInterval} onChange={e => setSplitInterval(parseInt(e.currentTarget.value))}/>
            </label>
            <label className={style.CreationPageLabelF}>
                <h6>First split event</h6>
                <input type="datetime-local" value={firstSplitEvent} onChange={e => setFirstSplitEvent(e.currentTarget.value)}/>
            </label>
            <label className={style.CreationPageLabelF}>
                <h6>Components</h6>
                <ComponentPercentage value={components} onChange={setComponents}/>
            </label>
        </div>
    )
}

const DelegationsManager = ({value, onChange}) => {

    const [attachInsurance, setAttachInsurance] = useState(value?.attachInsurance || 0)
    const [proposalRules, setProposalRules] = useState(value?.proposalRules)

    useEffect(() => onChange && onChange({proposalRules, attachInsurance}), [proposalRules, attachInsurance])

    return (
        <div className={style.CreationPageLabel}>
            <div className={style.FancyExplanationCreate}>
                <h6>Delegations Manager</h6>
            </div>
            <label className={style.CreationPageLabelF}>
                <h6>Attach Insurance</h6>
                <input type="number" value={attachInsurance} onChange={e => setAttachInsurance(parseInt(e.currentTarget.value))}/>
            </label>
            <ProposalRules value={proposalRules} onChange={setProposalRules}/>
        </div>
    )
}

const InvestmentsManager = ({amms, value, onChange}) => {

    const [swapToEtherInterval, setSwapToEtherInterval] = useState(value?.swapToEtherInterval || 0)
    const [firstSwapToEtherEvent, setFirstSwapToEtherEvent] = useState(value?.firstSwapToEtherEvent || "")
    const [fromETH, setFromETH] = useState(value?.fromETH || [])
    const [toETH, setToETH] = useState(value?.toETH || [])
    const [maxPercentagePerToken, setMaxPercentagePerToken] = useState(value?.maxPercentagePerToken || 0)

    const [proposalRules, setProposalRules] = useState(value?.proposalRules)

    useEffect(() => onChange && onChange({swapToEtherInterval, firstSwapToEtherEvent, fromETH, toETH, maxPercentagePerToken, proposalRules}), [swapToEtherInterval, firstSwapToEtherEvent, fromETH, toETH, maxPercentagePerToken, proposalRules])

    return (
        <div className={style.CreationPageLabel}>
            <div className={style.FancyExplanationCreate}>
                <h6>Investments Manager</h6>
            </div>
            <label className={style.CreationPageLabelF}>
                <h6>Swap interval</h6>
                <input type="number" value={swapToEtherInterval} onChange={e => setSwapToEtherInterval(parseInt(e.currentTarget.value))}/>
            </label>
            <label className={style.CreationPageLabelF}>
                <h6>First swap event</h6>
                <input type="datetime-local" value={firstSwapToEtherEvent} onChange={e => setFirstSwapToEtherEvent(e.currentTarget.value)}/>
            </label>
            <label className={style.CreationPageLabelF}>
                <h6>Sell ETH to buy</h6>
                <InvestmentsManagerOperation amms={amms} value={fromETH} onChange={setFromETH} burn/>
            </label>
            <label className={style.CreationPageLabelF}>
                <h6>Max Percentage per Token</h6>
                <input type="range" min="0" max="100" step="0.05" value={maxPercentagePerToken} onChange={e => setMaxPercentagePerToken(parseFloat(e.currentTarget.value))}/>
                <span>{maxPercentagePerToken} %</span>
            </label>
            <label className={style.CreationPageLabelF}>
                <h6>Buy ETH selling</h6>
                <InvestmentsManagerOperation amms={amms} value={toETH} onChange={setToETH} maxPercentagePerToken={maxPercentagePerToken}/>
            </label>
            <ProposalRules value={proposalRules} onChange={setProposalRules}/>
        </div>
    )
}

const InvestmentsManagerOperation = ({value, onChange, amms, burn, maxPercentagePerToken}) => {

    const addMore = useMemo(() => !value || value.length < 5, [value])

    useEffect(() => {
        if(!value || isNaN(maxPercentagePerToken) || (value && !isNaN(maxPercentagePerToken) && value.filter(it => it.percentage > maxPercentagePerToken).length == 0)) {
            return
        }
        onChange(value.map(it => ({...it, percentage : it.percentage > maxPercentagePerToken ? maxPercentagePerToken : it.percentage})))
    }, [value, maxPercentagePerToken])

    return (
        <div>
            {addMore && <div><a onClick={() => onChange([...value, { amm : undefined, token : undefined, burn : false, percentage : maxPercentagePerToken }])}><h4>+</h4></a></div>}
            {value && value.map((it, i) => <div key={`${i}_${it.token?.address}_${it.amm?.address}`}>
                <TokenInputRegular selected={it.token} onElement={v => onChange(value.map((elem, index) => index === i ? { ...elem, token : v } : elem))} noBalance tokenOnly noETH onlySelections={['ERC-20']}/>
                <span>On</span>
                <ActionInfoSection settings uniV3Pool={it.uniV3Pool} onUniV3Pool={v => onChange(value.map((elem, index) => index === i ? { ...elem, uniV3Pool : v } : elem))} ammsInput={amms} amm={it.amm} onAMM={v => onChange(value.map((elem, index) => index === i ? { ...elem, amm : v } : elem))}/>
                {burn && <label>
                    <span>Then burn</span>
                    <input type="checkbox" checked={it.burn} onChange={v => onChange(value.map((elem, index) => index === i ? { ...elem, burn : v.currentTarget.checked } : elem))}/>
                </label>}
                {!isNaN(maxPercentagePerToken) && <label>
                    <span>Percentage</span>
                    <input type="range" min="0" max={maxPercentagePerToken} step="0.05" checked={it.percentage} onChange={v => onChange(value.map((elem, index) => index === i ? { ...elem, percentage : parseFloat(v.currentTarget.value) } : elem))}/>
                    <span>{it.percentage} %</span>
                </label>}
                <div><a onClick={() => onChange(value.filter((_, index) => index !== i))}><h4>-</h4></a></div>
            </div>)}
        </div>
    )
}

const CreateOrganization = () => {

    const context = useEthosContext()
    const web3Data = useWeb3()

    const initialData = useMemo(() => ({context, ...web3Data}), [context, web3Data])

    const [loading, setLoading] = useState(false)

    const [state, setState] = useState()

    const [amms, setAMMs] = useState()

    const disabled = useMemo(() => !state || Object.values(state).filter(it => it && it.errors).length > 0, [state])

    const onClick = useCallback(() => !disabled && createOrganization(initialData, state), [disabled, state])

    useEffect(() => getAMMs({context, ...web3Data}).then(setAMMs), [])

    if(!amms) {
        return <OurCircularProgress/>
    }
    return (
      <div className={style.CreatePage}>
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
      </div>
    )
}

CreateOrganization.menuVoice = {
    path : '/guilds/create/organization'
}

export default CreateOrganization