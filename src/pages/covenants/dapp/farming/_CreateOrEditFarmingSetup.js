import React, { useState, useEffect } from 'react'

import { VOID_ETHEREUM_ADDRESS, web3Data, formatNumber, useEthosContext, formatMoney, fromDecimals, blockchainCall, useWeb3 } from '@ethereansos/interfaces-core'

import LogoRenderer from '../../../../components/Global/LogoRenderer'
import OurCircularProgress from '../../../../components/Global/OurCircularProgress'
import TokenInputRegular from '../../../../components/Global/TokenInputRegular'
import { loadTokenFromAddress } from '../../../../logic/erc20'

export default props => {

    const context = useEthosContext()

    const web3Data = useWeb3()

    const { rewardToken, onAddFarmingSetup, editSetup, onEditFarmingSetup, dfoCore, onCancel, editSetupIndex } = props
    const selectedFarmingType = editSetup ? (editSetup.free ? "free" : "locked") : props.selectedFarmingType
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
    // token state
    const [liquidityPoolToken, setLiquidityPoolToken] = useState((editSetup && editSetup.data) ? editSetup.data : null)
    const [mainTokenIndex, setMainTokenIndex] = useState((editSetup && editSetup.mainTokenIndex) ? editSetup.mainTokenIndex : 0)
    const [mainToken, setMainToken] = useState((editSetup && editSetup.mainToken) ? editSetup.mainToken : null)
    const [rewardPerBlock, setRewardPerBlock] = useState((editSetup && editSetup.rewardPerBlock) ? editSetup.rewardPerBlock : 0)
    const [maxStakeable, setMaxStakeable] = useState((editSetup && editSetup.maxStakeable) ? editSetup.maxStakeable : 0)
    const [hasPenaltyFee, setHasPenaltyFee] = useState((editSetup && editSetup.penaltyFee) ? editSetup.penaltyFee > 0 : false)
    const [penaltyFee, setPenaltyFee] = useState((editSetup && editSetup.penaltyFee) ? editSetup.penaltyFee : 0)
    const [ethAddress, setEthAddress] = useState((editSetup && editSetup.ethAddress) ? editSetup.ethAddress : "")
    // current step
    const [currentStep, setCurrentStep] = useState(0)

    const [liquidityPoolTokenAddress, setLiquidityPoolTokenAddress] = useState(editSetup && (editSetup.liquidityPoolTokenAddress || (editSetup.liquidityPoolToken && editSetup.liquidityPoolToken.address)))

    useEffect(() => {
        onSelectLiquidityPoolToken(liquidityPoolTokenAddress)
    }, [liquidityPoolTokenAddress])

    useEffect(() => {
        if(!mainToken || !liquidityPoolToken) {
            return
        }
        setMainTokenIndex(liquidityPoolToken.tokens.indexOf(liquidityPoolToken.tokens.filter(it => it.address === mainToken.address)[0]))
    }, [mainToken, liquidityPoolToken])

    const onSelectLiquidityPoolToken = async (address) => {
        if (!address) return
        setLoading(true)
        try {
            const ammAggregator = await dfoCore.getContract(dfoCore.getContextElement('AMMAggregatorABI'), dfoCore.getContextElement('ammAggregatorAddress'))
            const res = await blockchainCall(ammAggregator.methods.info, address)
            const name = res['name']
            const ammAddress = res['amm']
            const ammContract = await dfoCore.getContract(dfoCore.getContextElement('AMMABI'), ammAddress)
            const ammData = await blockchainCall(ammContract.methods.data)
            const lpInfo = await blockchainCall(ammContract.methods.byLiquidityPool, address)
            const tokens = []
            let ethTokenFound = false
            setInvolvingEth(false)
            await Promise.all(lpInfo[2].map(async (tkAddress) => {
                if (tkAddress.toLowerCase() === ammData[0].toLowerCase()) {
                    setInvolvingEth(true)
                    ethTokenFound = true
                    setEthAddress(ammData[0])
                    if (ammData[0] === dfoCore.voidEthereumAddress) {
                        setEthSelectData(null)
                    } else {
                        const notEthToken = await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), ammData[0])
                        const notEthTokenSymbol = await blockchainCall(notEthToken.methods.symbol)
                        setEthSelectData({ symbol: notEthTokenSymbol })
                    }
                }
                const currentToken = await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), tkAddress)
                const symbol = tkAddress === VOID_ETHEREUM_ADDRESS ? "ETH" : await blockchainCall(currentToken.methods.symbol)
                tokens.push({... await loadTokenFromAddress({context, ...web3Data}, tkAddress), isEth: tkAddress.toLowerCase() === ammData[0].toLowerCase() })
            }))
            const lpTokenContract = await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), address)
            const decimals = await blockchainCall(lpTokenContract.methods.decimals)
            if (!ethTokenFound) setEthSelectData(null)
            setLiquidityPoolToken({
                address,
                name,
                tokens,
                decimals,
            })
            setMainToken(tokens[0])
        } catch (error) {
            setInvolvingEth(false)
            setEthSelectData(null)
            setLiquidityPoolToken(null)
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const onUpdateHasMinStakeable = (value) => {
        setHasMinStakeable(value)
        setMinSteakeable(0)
    }

    const onUpdateHasPenaltyFee = (value) => {
        setHasPenaltyFee(value)
        setPenaltyFee(0)
    }

    const onUpdatePenaltyFee = (value) => {
        setPenaltyFee(value > 100 ? 100 : value)
    }

    const onFreeRewardPerBlockUpdate = (value) => {
        const parsedValue = dfoCore.fromDecimals(value, rewardToken.decimals)
        setRewardPerBlock(parsedValue < 1 ? 0 : value)
    }

    const addSetup = () => {
        if(hasMinStakeable && formatNumber(minStakeable) <= 0) {
            return
        }
        if(isRenewable && formatNumber(renewTimes) <= 0) {
            return
        }
        const setup = {
            free: selectedFarmingType === 'free',
            blockDuration,
            startBlock,
            minStakeable,
            renewTimes,
            involvingETH,
            ethSelectData,
            liquidityPoolToken,
            mainTokenIndex,
            mainToken,
            rewardPerBlock,
            maxStakeable,
            penaltyFee,
            ethAddress
        }
        editSetup ? onEditFarmingSetup(setup, editSetupIndex) : onAddFarmingSetup(setup)
    }

    function next() {
        if(selectedFarmingType === 'locked' && formatNumber(maxStakeable) <= 0) {
            return
        }
        liquidityPoolToken && formatNumber(blockDuration) > 0 && formatNumber(rewardPerBlock) > 0 && setCurrentStep(1)
    }

    const getFirstStep = () => {
        return <div>
            <div>
                <p>Load the Pool you want to reward for this setup by its Ethereum address.</p>
                <input type="text" placeholder='Liquidity pool address' value={liquidityPoolTokenAddress} onChange={e => setLiquidityPoolTokenAddress(e.currentTarget.value)}/>
            </div>
            {
                loading ? <OurCircularProgress/> : <>
                    <div>
                        {(liquidityPoolToken && liquidityPoolToken.tokens.length > 0) &&
                            <h6><b>{liquidityPoolToken.name} | {liquidityPoolToken.tokens.map((token) => <>{!token.isEth ? token.symbol : involvingETH ? 'ETH' : token.symbol} </>)}</b> {liquidityPoolToken.tokens.map((token) => <LogoRenderer input={!token.isEth ? token.address : involvingETH ? VOID_ETHEREUM_ADDRESS : token.address} />)}</h6>
                        }
                    </div>
                    {
                        liquidityPoolToken && <>
                            {
                                false && ethSelectData &&
                                    <div>
                                        <input type="checkbox" checked={involvingETH} onChange={(e) => setInvolvingEth(e.target.checked)} id="involvingETH" />
                                        <label htmlFor="involvingETH">
                                            Use {ethSelectData.symbol} as ETH
                                        </label>
                                    </div>
                            }
                            {
                                selectedFarmingType === 'locked' && <>
                                    <select value={mainTokenIndex} onChange={e => void(setMainTokenIndex(e.target.value), setMainToken(liquidityPoolToken.tokens[e.target.value]))}>
                                        {
                                            liquidityPoolToken.tokens.map((tk, index) => {
                                                return <option key={tk.address} value={index}>{!tk.isEth ? tk.symbol : involvingETH ? 'ETH' : tk.symbol}</option>
                                            })
                                        }
                                    </select>
                                    <div>
                                        <div>
                                            <h6>Max stakeable</h6>
                                            <p>The maximum amount of main tokens staked simultaneously.</p>
                                            <div>
                                                <TokenInputRegular noBalance selected={mainToken} tokens={[mainToken]} value={maxStakeable} onElement={(a, b, v) => setMaxStakeable(v)}/>
                                                {/*<Input min={0} showCoin={true} address={(mainToken.isEth && involvingETH) ? VOID_ETHEREUM_ADDRESS : mainToken.address} value={maxStakeable} name={(mainToken.isEth && involvingETH) ? 'ETH' : mainToken.symbol} onChange={e => setMaxStakeable(e.target.value)} />*/}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            }
                            <div>
                                <div>
                                    <h6>Reward per block</h6>
                                    <div>
                                        <TokenInputRegular noBalance selected={rewardToken} tokens={[rewardToken]} onElement={(t, b, v) => setRewardPerBlock(v)} value={rewardPerBlock} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p>Select the duration of the setup. The selected timeband will determinate the end block once activated</p>
                                <select value={blockDuration} onChange={(e) => setBlockDuration(e.target.value)}>
                                    <option value={0}>Choose setup duration</option>
                                    {Object.keys(context.blockIntervals).map(key => <option key={key} value={context.blockIntervals[key]}>{key}</option>)}
                                </select>
                            </div>
                            <div>
                                <p><b>Total reward ({`${blockDuration}`} blocks): {formatMoney(fromDecimals(rewardPerBlock.ethereansosMul(blockDuration), rewardToken.decimals, true), 8)} {rewardToken.symbol}</b></p>
                            </div>
                        </>
                    }
                    <div>
                        <a onClick={onCancel}>Back</a>
                        <a onClick={next}>Next</a>
                    </div>
                </>
            }
        </div>
    }

    const getSecondStep = () => {
        return (
            <div>
                <div>
                    <h6><input type="checkbox" checked={hasStartBlock} onChange={(e) => {
                        setStartBlock(0)
                        setHasStartBlock(e.target.checked)
                    }}/> Start Block</h6>
                    {
                        hasStartBlock && <div>
                            <input type="text" min={0} value={startBlock} onChange={e => setStartBlock(e.target.value)} />
                        </div>
                    }
                    <p>[Optional <b>&#128171 Recommended</b>] Set a start block for this setup. Farmers will be able to activate it after that. This feature helps by giving the host the time needed to send reward tokens to the contract or vote via a DFO/DAO for more complex functionalities. more info in the <a target="_blank" href="https://docs.ethos.wiki/covenants/protocols/farm/manage-farming-setups/activate-disactivate-farming-setup">Grimoire</a></p>
                </div>
                <div>
                    <h6><input type="checkbox" checked={hasMinStakeable} onChange={e => onUpdateHasMinStakeable(e.target.checked)} id="minStakeable" /> Min stakeable</h6>
                    {hasMinStakeable && <div>
                        <TokenInputRegular noBalance selected={mainToken} tokens={selectedFarmingType === 'free' ? liquidityPoolToken.tokens : [mainToken]} value={minStakeable} onElement={(a, _, v) => void(selectedFarmingType === 'free' && setMainToken(a), setMinSteakeable(v))}/>
                    </div>}
                    <p>[Optional] You can set a floor for the minimum amount of main tokens required to stake a position.</p>
                </div>
                {
                    selectedFarmingType === 'locked' && <>
                        <div>
                            <h6><input type="checkbox" checked={hasPenaltyFee} onChange={(e) => onUpdateHasPenaltyFee(e.target.checked)} id="penaltyFee" /> Penalty fee </h6>
                            {
                                hasPenaltyFee && <>
                                    <div>
                                        <aside>%</aside>
                                        <input placeholder="Penalty Fee" type="number" min={0} max={100} value={penaltyFee} onChange={(e) => onUpdatePenaltyFee(e.target.value)} />
                                    </div>
                                    <p>Main Token: {rewardToken.symbol}</p>
                                </>
                            }
                            <p>[Optional] You can set a penalty fee as a percentage of the total rewards for a locked position that must be paid to close it before the end block.</p>
                        </div>
                    </>
                }
                <div>
                    <h6><input type="checkbox" checked={isRenewable} onChange={(e) => {
                        setRenewTimes(0)
                        setIsRenewable(e.target.checked)
                    }} id="repeat" /> Repeat</h6>
                    {
                        isRenewable && <div>
                            <input type="number" min={0} value={renewTimes} onChange={(e) => setRenewTimes(e.target.value)} />
                        </div>
                    }
                    <p>[Optional] You can customize a setup to automatically repeat itself after the end block.</p>
                </div>
                <div>
                    <a onClick={() => setCurrentStep(0)}>Back</a>
                    <a onClick={addSetup}>{editSetup ? 'Edit' : 'Add'}</a>
                </div>
            </div>
        )
    }

    return currentStep === 0 ? getFirstStep() : currentStep === 1 ? getSecondStep() : <div />

}