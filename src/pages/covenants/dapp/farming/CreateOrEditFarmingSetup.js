import React, { useState, useEffect } from 'react'
import { useEthosContext, useWeb3, VOID_ETHEREUM_ADDRESS, fromDecimals, getNetworkElement, formatNumber, isEthereumAddress, formatMoney, blockchainCall } from '@ethereansos/interfaces-core'
import {
    tickToPrice,
    nearestUsableTick,
    TICK_SPACINGS,
    TickMath
} from '@uniswap/v3-sdk/dist/'
import LogoRenderer from '../../../../components/Global/LogoRenderer'
import OurCircularProgress from '../../../../components/Global/OurCircularProgress'
import TokenInputRegular from '../../../../components/Global/TokenInputRegular'
import { findLiquidityPoolToken } from '../../../../logic/farming'

import style from '../../../../all.module.css'
import { useOpenSea } from '../../../../logic/uiUtilities'

export default props => {
    const { rewardToken, generation, gen2SetupType, editSetup, onAddFarmingSetup, onEditFarmingSetup, onCancel } = props

    const context = useEthosContext()

    const seaport = useOpenSea()

    const web3Data = useWeb3()

    // general purpose
    const [loading, setLoading] = useState(false)
    const [blockDuration, setBlockDuration] = useState((editSetup && editSetup.blockDuration && !isNaN(parseInt(editSetup.blockDuration)) && parseInt(editSetup.blockDuration) !== 0) ? editSetup.blockDuration : 0)
    const [startBlock, setStartBlock] = useState((editSetup && editSetup.startBlock && !isNaN(parseInt(editSetup.startBlock)) && parseInt(editSetup.startBlock) !== 0) ? editSetup.startBlock : 0)
    const [hasStartBlock, setHasStartBlock] = useState((editSetup && editSetup.startBlock && !isNaN(parseInt(editSetup.startBlock)) && parseInt(editSetup.startBlock) !== 0) ? true : false)
    const [hasMinStakeable, setHasMinStakeable] = useState((editSetup && editSetup.minStakeable && !isNaN(parseInt(editSetup.minStakeable)) && parseInt(editSetup.minStakeable) !== 0) ? editSetup.minStakeable : false)
    const [minStakeable, setMinSteakeable] = useState((editSetup && editSetup.minStakeable && !isNaN(parseInt(editSetup.minStakeable)) && parseInt(editSetup.minStakeable) !== 0) ? editSetup.minStakeable : 0)
    const [isRenewable, setIsRenewable] = useState((editSetup && editSetup.renewTimes && !isNaN(parseInt(editSetup.renewTimes)) && parseInt(editSetup.renewTimes) !== 0) ? editSetup.renewTimes > 0 : false)
    const [renewTimes, setRenewTimes] = useState((editSetup && editSetup.renewTimes && !isNaN(parseInt(editSetup.renewTimes)) && parseInt(editSetup.renewTimes) !== 0) ? editSetup.renewTimes : 0)
    const [involvingETH, setInvolvingEth] = useState((editSetup && editSetup.involvingETH) ? editSetup.involvingETH : false)
    const [ethSelectData, setEthSelectData] = useState((editSetup && editSetup.ethSelectData) ? editSetup.ethSelectData : null)
    const [tickUpper, setTickUpper] = useState((editSetup && editSetup.tickUpper) ? editSetup.tickUpper : 0)
    const [tickLower, setTickLower] = useState((editSetup && editSetup.tickLower) ? editSetup.tickLower : 0)
    // token state
    const [liquidityPoolToken, setLiquidityPoolToken] = useState((editSetup && editSetup.data) ? editSetup.data : null)
    const [mainTokenIndex, setMainTokenIndex] = useState((editSetup && editSetup.mainTokenIndex) ? editSetup.mainTokenIndex : 0)
    const [mainToken, setMainToken] = useState((editSetup && editSetup.mainToken) ? editSetup.mainToken : null)
    const [rewardPerBlock, setRewardPerBlock] = useState((editSetup && (editSetup.rewardPerBlock || editSetup.originalRewardPerBlock)) ? editSetup.rewardPerBlock || editSetup.originalRewardPerBlock : 0)
    const [ethereumAddress, setEthereumAddress] = useState((editSetup && editSetup.ethereumAddress) ? editSetup.ethereumAddress : "")
    const [uniswapTokens, setUniswapTokens] = useState([])
    const [secondTokenIndex, setSecondTokenIndex] = useState(1)
    const [maxPrice, setMaxPrice] = useState(0)
    const [minPrice, setMinPrice] = useState(0)
    // current step
    const [currentStep, setCurrentStep] = useState(editSetup?.editing && !editSetup?.lastSetup?.active ? 2 : 0)

    const [liquidityPoolTokenAddress, setLiquidityPoolTokenAddress] = useState(editSetup && (editSetup.liquidityPoolTokenAddress || (editSetup.liquidityPoolToken && editSetup.liquidityPoolToken.address)))

    var tickLowerInput
    var tickUpperInput

    useEffect(() => {
        onSelectLiquidityPoolToken(liquidityPoolTokenAddress)
    }, [liquidityPoolTokenAddress])

    useEffect(() => {
        if(!mainToken || !liquidityPoolToken) {
            return
        }
        setMainTokenIndex(liquidityPoolToken.tokens.indexOf(liquidityPoolToken.tokens.filter(it => it.address === mainToken.address)[0]))
    }, [mainToken, liquidityPoolToken])

    useEffect(() => {
        try {
            setMinPrice(minPrice = tickToPrice(uniswapTokens[secondTokenIndex], uniswapTokens[1 - secondTokenIndex], parseInt(tickLowerInput.value = tickLower)).toSignificant(18))
        } catch(e) {
        }
        try {
            setMaxPrice(maxPrice = tickToPrice(uniswapTokens[secondTokenIndex], uniswapTokens[1 - secondTokenIndex], parseInt(tickUpperInput.value = tickUpper)).toSignificant(18))
        } catch(e) {
        }
    }, [tickLower, tickUpper, secondTokenIndex])

    async function onSelectLiquidityPoolToken(address) {
        if (!address || !isEthereumAddress(address)) {
            return setLiquidityPoolToken()
        }
        setLoading(true)
        try {
            const data = await findLiquidityPoolToken({ context, seaport, ...web3Data }, generation, address, gen2SetupType)
            if(data) {
                setTickUpper(data.realTickUpper)
                setTickLower(data.realTickLower)
                setInvolvingEth(data.involvingETH)
                setEthSelectData(data.ethSelectData)
                setEthereumAddress(data.ethereumAddress)
                setLiquidityPoolToken(data)
                setMainToken(data.tokens[0])
                setUniswapTokens(data.uniTokens)
                setSecondTokenIndex(1)
            }
        } catch (error) {
            setInvolvingEth(false)
            setEthSelectData(null)
            setLiquidityPoolToken(null)
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    function onUpdateHasMinStakeable(value) {
        setHasMinStakeable(value)
        setMinSteakeable(0)
    }

    function addSetup() {
        if (!editSetup?.editing && hasMinStakeable && formatNumber(minStakeable) <= 0) {
            return
        }
        if (isRenewable && formatNumber(renewTimes) <= 0) {
            return
        }
        const setup = {
            free: true,
            blockDuration,
            startBlock,
            minStakeable,
            renewTimes,
            involvingETH,
            ethSelectData,
            liquidityPoolToken : liquidityPoolToken || editSetup?.data || editSetup?.liquidityPoolToken,
            mainTokenIndex,
            mainToken,
            rewardPerBlock,
            maxStakeable : 0,
            penaltyFee : 0,
            ethereumAddress,
            tickLower,
            tickUpper,
            gen2SetupType,
            ammPlugin : editSetup?.ammPlugin || editSetup?.data?.ammPlugin || editSetup?.liquidityPoolToken?.ammPlugin || liquidityPoolToken?.ammPlugin,
            index : editSetup?.index,
            editing : editSetup?.editing,
            disable : editSetup?.disable,
            initialRewardPerBlock : editSetup?.initialRewardPerBlock,
            initialRenewTimes : editSetup?.initialRenewTimes,
            lastSetupIndex : editSetup?.lastSetupIndex,
            lastSetup : editSetup?.lastSetup
        }
        editSetup ? onEditFarmingSetup(setup, setup.index) : onAddFarmingSetup(setup)
    }

    function next() {
        if(currentStep === 0 && editSetup?.editing) {
            return parseInt(editSetup.initialRenewTimes) === 0 ? addSetup() : setCurrentStep(2)
        }
        currentStep === 0 && liquidityPoolToken && formatNumber(blockDuration) > 0 && formatNumber(rewardPerBlock) > 0 && setCurrentStep(gen2SetupType === 'diluted' ? 2 : 1)
        currentStep === 1 && tickUpper !== tickLower && tickLower >= TickMath.MIN_TICK && tickUpper <= TickMath.MAX_TICK && tickLower < tickUpper && tickLower % TICK_SPACINGS[liquidityPoolToken.fee] === 0 && tickUpper % TICK_SPACINGS[liquidityPoolToken.fee] === 0 && setCurrentStep(2)
    }

    function updateTick(tick, increment) {
        var tickToUpdate = tick === 0 ? tickLower : tickUpper
        var step = TICK_SPACINGS[liquidityPoolToken.fee]
        increment && (tickToUpdate += step)
        !increment && (tickToUpdate -= step)
        tickToUpdate = tickToUpdate > TickMath.MAX_TICK ? TickMath.MAX_TICK : tickToUpdate < TickMath.MIN_TICK ? TickMath.MIN_TICK : tickToUpdate
        tick === 0 && setTickLower(tickToUpdate)
        tick === 1 && setTickUpper(tickToUpdate)
    }

    function onTickInputBlur(e) {
        var value = nearestUsableTick(formatNumber(e.currentTarget.value) || 0, TICK_SPACINGS[liquidityPoolToken.fee])
        var tick = parseInt(e.currentTarget.dataset.tick)
        tick === 0 && setTickLower(value)
        tick === 1 && setTickUpper(value)
    }

    function getFirstStep() {
        return (
            <div>
                <div className={style.CreationPageLabelF}>
                    <h6>Liquidity Pool</h6>
                    <input disabled={editSetup?.editing} type="text" placeholder='Liquidity pool address' value={liquidityPoolTokenAddress} onChange={e => setLiquidityPoolTokenAddress(e.currentTarget.value)}/>
                    <p>Load the Pool you want to reward for this setup by its Ethereum address.</p>
                    {loading ? <OurCircularProgress/> : <div className={style.LoadedPoolInfo}>
                        {liquidityPoolToken && liquidityPoolToken.tokens.length > 0 && <h6>
                            <b>{liquidityPoolToken.name} | {liquidityPoolToken.tokens.map((token) => <>{!token.isEth ? token.symbol : involvingETH ? 'ETH' : token.symbol} </>)}</b>
                            {liquidityPoolToken.tokens.map(token => <LogoRenderer badge input={!token.isEth ? token.address : involvingETH ? {...token, image: `${process.env.PUBLIC_URL}/img/eth_logo.png`} : token.address} />)}
                        </h6>}
                    </div>}
                </div>
                <div className={style.CreationPageLabelF}>
                    <h6>Reward per block</h6>
                    <TokenInputRegular outputValue={rewardToken ? fromDecimals(rewardPerBlock || '0', rewardToken.decimals, true) : '0'} disabled={editSetup?.editing && !editSetup?.lastSetup?.active} noBalance selected={rewardToken} tokens={[rewardToken]} onElement={(t, b, v) => setRewardPerBlock(v)} />
                    <p>Imput the total ammount of reward per block splitted between farmers</p>
                </div>
                <div className={style.CreationPageLabelF}>
                    <h6>Duration</h6>
                    <select disabled={editSetup?.editing} className={style.CreationSelectW} value={blockDuration} onChange={e => setBlockDuration(e.target.value)}>
                        <option value={0}>Choose setup duration</option>
                        {Object.keys(context.blockIntervals).map(key => <option key={key} value={context.blockIntervals[key]}>{key}</option>)}
                    </select>
                    <p>Select the duration of the setup. The selected timeband will determinate the end block once activated</p>
                </div>
                <p><b>Total reward ({`${blockDuration}`} blocks): {formatMoney(fromDecimals(rewardPerBlock.ethereansosMul(blockDuration), rewardToken.decimals, true), 8)} {rewardToken.symbol}</b></p>
                <div className={style.ActionBTNCreateX}>
                    <a className={style.Web3BackBTN} onClick={onCancel}>Back</a>
                    <a className={style.RegularButton} onClick={next}>{!editSetup || !editSetup.editing || parseInt(editSetup.initialRenewTimes) > 0 ? "Next" : "Edit"}</a>
                </div>
            </div>
        )
    }

    function choosetick() {
        return (
            <div>
                <div className={style.FancyExplanationCreate}>
                    <h6>Price Range</h6>
                    <p className={style.BreefRecapB}>Set the price range of the liquidity curve for the setup.</p>
                </div>

                <div className={style.generationSelector}>
                    <div className={style.InputTokenRegular}>
                        <input className={style.PriceRangeInput} type="number" min={TickMath.MIN_TICK} max={TickMath.MAX_TICK} data-tick="0" ref={ref => tickLowerInput = ref} defaultValue={tickLower} onBlur={onTickInputBlur}/>
                    </div>
                    <div className={style.InputTokenRegular}>
                        <a className={style.tickerchanger} onClick={() => updateTick(0, false)}> - </a>
                        <a className={style.tickerchanger} onClick={() => updateTick(0, true)}> + </a>
                    </div>
                    <div className={style.Priceselections}>
                    <h6>Min Price</h6>
                        <p>1 {liquidityPoolToken.tokens[secondTokenIndex].symbol} = {minPrice} {liquidityPoolToken.tokens[1 - secondTokenIndex].symbol}</p>
                        <p>The minumum price of the curve, all position will be 100% {liquidityPoolToken.tokens[secondTokenIndex].symbol} at this price and will no more earn fees.</p>
                    </div>
                </div>
                <div className={style.generationSelector}>
                    <div className={style.InputTokenRegular}>
                        <input className={style.PriceRangeInput} type="number" min={TickMath.MIN_TICK} max={TickMath.MAX_TICK} data-tick="1" ref={ref => tickUpperInput = ref} defaultValue={tickUpper} onBlur={onTickInputBlur}/>
                    </div>
                    <div className={style.InputTokenRegular}>
                        <a className={style.tickerchanger} onClick={() => updateTick(1, false)}> - </a>
                        <a className={style.tickerchanger} onClick={() => updateTick(1, true)}> + </a>
                    </div>
                    <div className={style.Priceselections}>
                        <h6>Max Price</h6>
                        <p>1 {liquidityPoolToken.tokens[secondTokenIndex].symbol} = {maxPrice} {liquidityPoolToken.tokens[1 - secondTokenIndex].symbol}</p>
                        <p>The maximum price of the curve, all position will be 100% {liquidityPoolToken.tokens[1 - secondTokenIndex].symbol} at this price and will no more earn fees.</p>
                    </div>
                </div>
                <div className={style.generationSelectorB}>
                    <div className={style.PoolTicker}>
                        <p><b>Current Price:</b> <br></br>1 {liquidityPoolToken.tokens[secondTokenIndex].symbol} = {tickToPrice(uniswapTokens[secondTokenIndex], uniswapTokens[1 - secondTokenIndex], parseInt(liquidityPoolToken.tick)).toSignificant(18)} {liquidityPoolToken.tokens[1 - secondTokenIndex].symbol}<br></br><b>Current Tick:</b> <br></br>{liquidityPoolToken.tick}</p>
                    </div>
                    <div className={style.PoolSwitcher}>
                        <h6>{liquidityPoolToken.tokens[secondTokenIndex].symbol} per {liquidityPoolToken.tokens[1 - secondTokenIndex].symbol}</h6>
                        <a onClick={() => setSecondTokenIndex(1 - secondTokenIndex)}><img src={`${process.env.PUBLIC_URL}/img/switch.png`}/></a>
                    </div>
                </div>
                <div className={style.ActionBTNCreateX}>
                    <a className={style.Web3BackBTN} onClick={() => setCurrentStep(0)}>Back</a>
                    <a className={style.RegularButton} onClick={next}>Next</a>
                </div>
            </div>
        )
    }

    function getSecondStep() {
        return (
            <div>
                <div className={style.CreationPageLabelF}>
                    <h6> Start Block</h6>
                    <input disabled={editSetup?.editing} type="checkbox" checked={hasStartBlock} onChange={(e) => {
                        setStartBlock(0)
                        setHasStartBlock(e.target.checked)
                    }} />
                    {
                        hasStartBlock && <div>
                            <input disabled={editSetup?.editing} type="number" value={startBlock} onChange={(e) => setStartBlock(e.target.value)} />
                        </div>
                    }
                    <p>[Optional] Set a start block for this setup. Farmers will be able to activate it after that. This feature helps by giving the host the time needed to send reward tokens to the contract or vote via a DFO/DAO for more complex functionalities. more info in the <a target="_blank" href="https://docs.ethos.wiki/covenants/protocols/farm/manage-farming-setups/activate-disactivate-farming-setup">Grimoire</a></p>
                </div>
                <div className={style.CreationPageLabelF}>
                    <h6>Min stakeable</h6>
                    <input disabled={editSetup?.editing} type="checkbox" checked={hasMinStakeable} onChange={(e) => onUpdateHasMinStakeable(e.target.checked)} id="minStakeable" />
                    {hasMinStakeable && <div>
                        <TokenInputRegular outputValue={mainToken ? fromDecimals(minStakeable || '0', mainToken.decimals, true) : '0'} disabled={editSetup?.editing} noBalance selected={mainToken} tokens={liquidityPoolToken.tokens} onElement={(a, _, v) => void(setMainToken(a), setMinSteakeable(v))}/>
                    </div>}
                    <p>[Optional] You can set a floor for the minimum amount of main tokens required to stake a position.</p>
                </div>
                <div className={style.CreationPageLabelF}>
                    <h6>Repeat</h6>
                    <input type="checkbox" disabled={editSetup?.editing && parseInt(editSetup?.initialRenewTimes) === 0} checked={isRenewable} onChange={(e) => {
                        setRenewTimes(0)
                        setIsRenewable(e.target.checked)
                    }} id="repeat" />
                    {isRenewable && <div>
                        <input type="number" disabled={editSetup?.editing && parseInt(editSetup?.initialRenewTimes) === 0} value={renewTimes} onChange={(e) => setRenewTimes(e.target.value)} />
                    </div>}
                    <p>[Optional] You can customize a setup to automatically repeat itself after the end block.</p>
                </div>
                <div className={style.ActionBTNCreateX}>
                    <a className={style.Web3BackBTN} onClick={() => editSetup?.editing && !editSetup?.lastSetup?.active ? onCancel() : setCurrentStep(gen2SetupType === 'diluted' || editSetup?.editing ? 0 : 1)}>Back</a>
                    <a className={style.RegularButton} onClick={() => addSetup()}>{editSetup ? 'Edit' : 'Add'}</a>
                </div>
            </div>
        )
    }

    var steps = [
        getFirstStep,
        choosetick,
        getSecondStep
    ]

    return steps[currentStep || 0]()
}