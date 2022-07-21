import React, { useState, useEffect, Fragment } from 'react'

import { abi, blockchainCall, useWeb3, useEthosContext, web3Utils, getNetworkElement, isEthereumAddress, formatNumber, VOID_ETHEREUM_ADDRESS, fromDecimals } from '@ethereansos/interfaces-core'

import OurCircularProgress from '../../../../components/Global/OurCircularProgress'
import LogoRenderer from '../../../../components/Global/LogoRenderer'
import PoolCheck from '../../../../components/Global/PoolCheck'
import { loadTokenFromAddress } from '../../../../logic/erc20'
import TokenInputRegular from '../../../../components/Global/TokenInputRegular'
import { getRawField } from '../../../../logic/generalReader'
import style from '../../../../all.module.css'

export default props => {

    const { entry, onCancel, onFinish, operation } = props

    const context = useEthosContext()

    const web3Data = useWeb3()

    const { web3, chainId, newContract } = web3Data

    const [step, setStep] = useState(0)
    // first step
    const [actionType, setActionType] = useState("")
    // second step
    const [inputToken, setInputToken] = useState(null)
    const [inputTokenMethod, setInputTokenMethod] = useState("reserve")
    // third step
    const [transferType, setTransferType] = useState("amount")
    const [percentage, setPercentage] = useState(0)
    const [amount, setAmount] = useState(0)
    const [currentReceiver, setCurrentReceiver] = useState("")
    const [pathTokens, setPathTokens] = useState([])
    const [receivers, setReceivers] = useState([])
    // general
    const [loading, setLoading] = useState(false)

    const [enterInETH, setEnterInETH] = useState(false)
    const [exitInETH, setExitInETH] = useState(false)
    const [amm, setAmm] = useState(false)

    // check if an entry has been passed in the props
    useEffect(() => {
        if (!operation || !operation.inputToken || !operation.inputTokenAddress) {
            return
        }

        const ethAddress = web3Utils.toChecksumAddress(getNetworkElement({ chainId, context }, "wethTokenAddress"))
        var inputTokenAddress = web3Utils.toChecksumAddress(operation.inputToken ? operation.inputToken.address ? operation.inputToken.address : operation.inputToken : null)
        inputTokenAddress = inputTokenAddress === ethAddress ? VOID_ETHEREUM_ADDRESS : inputTokenAddress

        setActionType(operation.actionType)
        onSelectInputToken(inputTokenAddress)
        setInputTokenMethod(operation.inputTokenMethod)
        setAmount(operation.amount)
        setPercentage(operation.percentage)
        setTransferType(operation.transferType)
        setReceivers(operation.receivers)
        setPathTokens(operation.pathTokens)
        setEnterInETH(operation.enterInETH || inputTokenAddress === VOID_ETHEREUM_ADDRESS)
        setExitInETH(operation.exitInETH || false)
        setAmm(operation.amm)
    }, [])

    useEffect(() => setTimeout(async function() {
        if(!inputToken || !operation || !operation.liquidityPoolAddresses || operation.liquidityPoolAddresses.length === 0) {
            return
        }
        for(var addr of operation.liquidityPoolAddresses) {
            await onAddPathToken(addr)
        }
    }), [operation, inputToken])

    // second step methods
    const onSelectInputToken = async address => {
        address = (address && address.address) || address
        if(inputToken && inputToken.address === address) {
            return
        }
        setAmm(null)
        setPathTokens([])
        setExitInETH(false)
        if (!address) return setInputToken(null)
        setLoading(true)
        setInputToken(await loadTokenFromAddress({ context, ...web3Data}, address))
        setEnterInETH(address === VOID_ETHEREUM_ADDRESS)
        address === VOID_ETHEREUM_ADDRESS && setInputTokenMethod("reserve")
        address === VOID_ETHEREUM_ADDRESS && setTransferType("amount")
        setLoading(false)
    }

    // third step methods
    const isValidPercentage = () => {
        var hasIncoherent = false
        for (var receiver of receivers) {
            var percentage = formatNumber(receiver.percentage)
            if (percentage <= 0 || percentage> 100) {
                hasIncoherent = true
            }
        }
        const totalPercentage = receivers.map(receiver => formatNumber(receiver.percentage)).reduce((acc, num) => acc + num)
        return totalPercentage == 100 && !hasIncoherent
    }

    const onPercentageChange = (index, percentage) => {
        var cumulate = percentage = parseInt(percentage)
        const updatedReceivers = receivers.map((receiver, i) => {
            if (i === index) {
                return { ...receiver, percentage }
            }
            if (i === receivers.length - 1) {
                return { ...receiver, percentage: 100 - cumulate }
            }
            cumulate += receiver.percentage
            return receiver
        })
        setReceivers(updatedReceivers)
    }

    const onAddPathToken = async (address) => {
        if (!address) return
        setLoading(true)
        try {
            const ethAddress = web3Utils.toChecksumAddress(getNetworkElement({ chainId, context }, "wethTokenAddress"))
            var ammAggregator = await newContract(context.AMMAggregatorABI, getNetworkElement({ chainId, context }, "ammAggregatorAddress"))
            var ammContract = newContract(context.AMMABI, context.uniswapV3SwapRouterAddress)
            var info
            try {
                info = await blockchainCall(ammAggregator.methods.info, address)
                ammContract = newContract(context.AMMABI, info['amm'])
                ethAddress = web3Utils.toChecksumAddress((await blockchainCall(ammContract.methods.data))[0])
            } catch(e) {}

            var realInputToken = web3Utils.toChecksumAddress(enterInETH ? ethAddress : inputToken.address)
            if (amm && amm.ammContract.options.address !== ammContract.options.address) {
                return
            }
            if (pathTokens.filter(it => it.address === address).length> 0) {
                return
            }
            const lastOutputToken = web3Utils.toChecksumAddress(pathTokens.length === 0 ? realInputToken : pathTokens[pathTokens.length - 1].outputTokenAddress)
            const lpInfo = info ? await blockchainCall(ammContract.methods.byLiquidityPool, address) : [undefined, undefined, [
                abi.decode(["address"], await getRawField({provider : web3.currentProvider}, address, 'token0'))[0],
                abi.decode(["address"], await getRawField({provider : web3.currentProvider}, address, 'token1'))[0]
            ]]
            const lpTokensAddresses = lpInfo[2]
            const symbols = []
            let outputTokenAddress = null
            let hasLastOutputToken = false
            for (var i in lpTokensAddresses) {
                const currentTokenAddress = web3Utils.toChecksumAddress(lpTokensAddresses[i])
                outputTokenAddress = outputTokenAddress ? web3Utils.toChecksumAddress(outputTokenAddress) : currentTokenAddress !== lastOutputToken ? currentTokenAddress : null
                if (currentTokenAddress !== VOID_ETHEREUM_ADDRESS) {
                    const currentToken = await newContract(context.ERC20ABI, currentTokenAddress)
                    const currentTokenSymbol = await blockchainCall(currentToken.methods.symbol)
                    symbols.push(currentTokenSymbol)
                }
                ethAddress === currentTokenAddress && (symbols[symbols.length - 1] = 'ETH')
                if (lastOutputToken === currentTokenAddress) {
                    hasLastOutputToken = true
                }
            }
            if (!hasLastOutputToken) {
                return
            }
            !amm && setAmm({ ammAggregator, ammContract, ethAddress })
            const pathTokenContract = await newContract(context.ERC20ABI, address)
            var symbol = "UNIV3"
            var decimals = "18"
            try {
                symbol = await blockchainCall(pathTokenContract.methods.symbol)
                decimals = await blockchainCall(pathTokenContract.methods.decimals)
            } catch(e) {}
            setPathTokens(pathTokens.concat({ symbol, address, decimals, output: null, outputTokenAddress, lpTokensAddresses, symbols }))
            setExitInETH(web3Utils.toChecksumAddress(outputTokenAddress) === web3Utils.toChecksumAddress(ethAddress))
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const getEntry = () => {
        return {
            actionType,
            inputToken,
            inputTokenMethod,
            amount,
            percentage,
            transferType,
            receivers,
            pathTokens,
            index: operation ? operation.index : -1,
            enterInETH,
            exitInETH,
            amm
        }
    }

    // step retrieval methods
    const getStep = () => {
        switch (step) {
            case 0:
                return getFirstStep()
            case 1:
                return getSecondStep()
            case 2:
                return getThirdStep()
            case 3:
                return getFourthStep()
            default:
                return <div/>
        }
    }

    const getFirstStep = () => {
        var disabled = !actionType
        return <div className={style.CreatePage}>
            <div className={style.FancyExplanationCreate}>
                <h6>Manage Operations</h6>
                <p className={style.BreefRecapB}>When executed, a routine can trigger one or more operations. Each operation can involve the transfer of ETH, Items or other tokens from a single address to one or more others; or it can involve the swap of ETH, an Item or another token on an AMM for any other token, as well as the transfer of the acquired token to one or more addresses.</p>
                <div className={style.proggressCreate}>
                    <div className={style.proggressCreatePerch} style={{width: "60%"}}>Step 3 of 5</div>
                </div>
            </div>
            <div className={style.CreationPageLabelF}>
                <h6>Operation Type</h6>
                <select className={style.CreationSelectW}  value={actionType} onChange={e => setActionType(e.target.value)}>
                    <option value="">Operation type</option>
                    <option value="transfer">Transfer</option>
                    <option value="swap">Swap</option>
                </select>
                <p>A “Transfer” operation is the semi-automatic transfer of ETH, Items or other tokens from a single address to one or more others. A “Swap” operation is the semi-automatic swap of ETH, an Item or another token on an AMM for any other token, and the transfer of the acquired token to one or more addresses.</p>
            </div>
            <div className={style.ActionBTNCreateX}>
                <a className={style.Web3BackBTN} onClick={() => {
                    setActionType("")
                    props.cancelEditOperation()
                }}>Cancel</a>
                <a className={style.RegularButton} onClick={() => !disabled && setStep(1)} disabled={disabled}>Next</a>
            </div>
        </div>
    }

    const getSecondStep = () => {
        var disabled = !inputToken || !inputTokenMethod
        return <div className={style.CreatePage}>
            <div className={style.FancyExplanationCreate}>
                <h6>Manage Operations</h6>
                <p className={style.BreefRecapB}>When executed, a routine can trigger one or more operations. Each operation can involve the transfer of ETH, Items or other tokens from a single address to one or more others; or it can involve the swap of ETH, an Item or another token on an AMM for any other token, as well as the transfer of the acquired token to one or more addresses.</p>
                <div className={style.proggressCreate}>
                    <div className={style.proggressCreatePerch} style={{width: "60%"}}>Step 3 of 5</div>
                </div>
            </div>
            <TokenInputRegular selected={inputToken} onElement={onSelectInputToken} tokenOnly/>
            {
                loading ? <OurCircularProgress/>: <>
                    {inputToken && !enterInETH && <div className={style.CreationPageLabelF}>
                        <h6>Origin of funds</h6>
                        <select className={style.CreationSelectW} value={inputTokenMethod} onChange={e => setInputTokenMethod(e.currentTarget.value)}>
                            <option value="">Select</option>
                            <option value="mint">By mint</option>
                            <option value="reserve">By Reserve</option>
                        </select>
                        <p>If “by reserve” is selected, the tokens will be transferred from a wallet. If “by mint” is selected, they will be minted and then sent. The logic of this action must be carefully coded into the extension! To learn more, read the <a target="_blank" href="https://docs.ethos.wiki/covenants/">Documentation</a></p>
                    </div>}
                </>
            }
            <div className={style.ActionBTNCreateX}>
                <a className={style.Web3BackBTN} onClick={() => setStep(step - 1)}>Back</a>
                <a className={style.RegularButton} onClick={() => !disabled && setStep(2)} disabled={disabled}>Next</a>
            </div>
        </div>
    }

    const getTransferThirdStep = () => {
        return <>
        <div className={style.FancyExplanationCreate}>
            <h6>Manage Operations</h6>
            <p className={style.BreefRecapB}>When executed, a routine can trigger one or more operations. Each operation can involve the transfer of ETH, Items or other tokens from a single address to one or more others; or it can involve the swap of ETH, an Item or another token on an AMM for any other token, as well as the transfer of the acquired token to one or more addresses.</p>
            <div className={style.proggressCreate}>
                <div className={style.proggressCreatePerch} style={{width: "60%"}}>Step 3 of 5</div>
            </div>
        </div>
        <div className={style.CreationPageLabelF}>
            <h6>Transfer</h6>
            {!enterInETH && <select className={style.CreationSelectW} value={transferType} onChange={e => setTransferType(e.currentTarget.value)}>
                <option value="">Select type</option>
                <option value="percentage">Percentage</option>
                <option value="amount">Amount</option>
            </select>}
            {transferType &&
                transferType == 'percentage' ?
                    <div>
                        <input type="range" min={0} max={100} value={percentage} onChange={e => setPercentage(e.currentTarget.value)}/>
                        <p>{percentage}% Of {inputToken.symbol}'s existing supply</p>
                    </div>
                    :
                    <div>
                        <div>
                            <TokenInputRegular noBalance tokens={[inputToken]} selected={inputToken} onElement={(_, b, am) => setAmount(am)} outputValue={fromDecimals(amount, inputToken.decimals, true)}/>
                        </div>
                    </div>
            }
        </div>
            {transferType && <>
                <div className={style.CreationPageLabelF}>
                    <h6>Receivers</h6>
                    <input type="text" value={currentReceiver} onChange={(e) => setCurrentReceiver(e.target.value)}  placeholder="Address" aria-label="Receiver" aria-describedby="button-add"/>
                    <a className={style.RoundedButton}  onClick={() => {
                        if (!isEthereumAddress(currentReceiver)) return
                        const exists = receivers.filter((r) => r.address === currentReceiver).length> 0
                        if (exists) return
                        setReceivers(receivers.concat({ address: currentReceiver, percentage: receivers.length === 0 ? 100 : 0 }))
                        setCurrentReceiver("")
                    }} type="button" id="button-add">+</a>
                    <p>Add one or more addresses as receivers from this operation.</p>
                </div>
                <div>
                    {receivers.map((receiver, index) => <div className={style.CreationPageLabelF} key={receiver.address}>
                        <span>{receiver.address}</span>
                        <a className={style.RoundedButton} onClick={() => setReceivers(receivers.filter((_, i) => i !== index))}>X</a>
                        {index !== receivers.length - 1 &&
                        <div>
                            <input type="range" min={0} max={100} onChange={(e) => onPercentageChange(index, e.target.value)}  value={receiver.percentage}/>
                            <aside>{receiver.percentage}%</aside>
                        </div>}

                        {index === receivers.length - 1 && receivers.length !== 1 && <div><span>{receiver.percentage}%</span></div>}

                    </div>)}
                </div>
            </>}
        </>
    }

    function onTransferChange(e) {
        setPercentage('')
        setAmount('')
        setTransferType(e.target.value)
    }

    function removePathTokens(index) {
        var removeAMM = pathTokens.length === 1
        var newPathTokens = pathTokens.filter((_, i) => i !== index)
        setPathTokens(newPathTokens)
        removeAMM && setAmm(null)
        setExitInETH(false)
    }

    const getSwapThirdStep = () => {
        return <>
            <div className={style.FancyExplanationCreate}>
                    <h6>Manage Operations</h6>
                    <p className={style.BreefRecapB}>A routine contract can trigger a set of operation on every execution. Operations can be about trasfering Items, tokens or ETH to one or more addresses or swap  Items, tokens or ETH and send the resul to one or more addresses.</p>
                    <div className={style.proggressCreate}>
                        <div className={style.proggressCreatePerch} style={{width: "60%"}}>Step 3 of 5</div>
                    </div>
            </div>
            <div className={style.CreationPageLabelF}>
                <h6>Swap</h6>
                {!enterInETH && <select className={style.CreationSelectW} value={transferType} onChange={onTransferChange}>
                    <option value="">Select type</option>
                    <option value="percentage">Percentage</option>
                    <option value="amount">Amount</option>
                </select>}
                {enterInETH && <select className={style.CreationSelectW} value={transferType} onChange={onTransferChange}>
                    <option value="amount">Amount</option>
                </select>}
                {
                    transferType ?
                        transferType == 'percentage' ?
                        <div>
                            <input type="range" min={0} max={100} value={percentage} onChange={(e) => setPercentage(e.target.value)}/>
                            <p>{percentage}% Of {inputToken.symbol}'s existing supply</p>
                        </div>
                            :
                            <div>
                                <div>
                                    <TokenInputRegular noBalance tokens={[inputToken]} selected={inputToken} onElement={(_, b, am) => setAmount(am)} outputValue={fromDecimals(amount, inputToken.decimals, true)}/>
                                </div>
                            </div>
                        : <div/>
                }
            </div>
            {transferType && <div className={style.CreationPageLabelF}>
            {transferType && loading && <OurCircularProgress/>}
            {transferType && !loading && pathTokens.map((pathToken, index) => {
                var realInputToken = web3Utils.toChecksumAddress(enterInETH ? amm.ethAddress : inputToken.address)
                var lastOutputToken = web3Utils.toChecksumAddress(pathTokens.length === 1 ? realInputToken : pathTokens[pathTokens.length - 2].outputTokenAddress)
                return <Fragment key={pathToken.address}>
                    {pathToken && <div>
                        <span>{pathToken.symbol} | {pathToken.symbols.map((symbol) => <span> {symbol} </span>)}</span> {index === pathTokens.length - 1 ? <a className={style.RoundedButton}  onClick={() => removePathTokens(index)}>x</a> : <div/>}
                    </div>}
                    <div>
                        <select className={style.CreationSelectW} value={pathToken.outputTokenAddress} disabled={index !== pathTokens.length - 1} onChange={e => setPathTokens(pathTokens.map((pt, i) => i === index ? { ...pt, outputTokenAddress: e.target.value } : pt))}>
                            {pathToken.lpTokensAddresses.filter(it => index !== pathTokens.length - 1 ? true : web3Utils.toChecksumAddress(it) !== lastOutputToken).map(lpTokenAddress => <option value={lpTokenAddress}>{pathToken.symbols[pathToken.lpTokensAddresses.indexOf(lpTokenAddress)]}</option>)}
                        </select>
                    </div>
                </Fragment>
            })}
                <h6>Path</h6>
                <PoolCheck placeholder={"Pool Address"} deleteAfterInsert={true} onClick={onAddPathToken} text={"+"}/>
                <p>Insert the address of the Liquidity Pool where the swap operation will occur</p>
            </div>}

            {transferType && <>
            <div className={style.CreationPageLabelF}>
                <h6>Receivers</h6>
                    <input type="text" value={currentReceiver} onChange={(e) => setCurrentReceiver(e.target.value)}  placeholder="Address" aria-label="Receiver" aria-describedby="button-add"/>
                    <a className={style.RoundedButton} onClick={() => {
                        const exists = receivers.filter((r) => r.address === currentReceiver).length> 0
                        if (exists) return
                        setReceivers(receivers.concat({ address: currentReceiver, percentage: receivers.length === 0 ? 100 : 0 }))
                        setCurrentReceiver("")
                    }} type="button" id="button-add">+</a>
                     <p>Add one or more addresses as receivers from this operation.</p>
            </div>
                <div>
                    {
                    receivers.map((receiver, index) => {
                        return (
                            <div className={style.CreationPageLabelF} key={receiver.address}>
                                <span>{receiver.address}</span>
                                <a  className={style.RoundedButton} onClick={() => setReceivers(receivers.filter((_, i) => i !== index))}>X</a>
                                {index !== receivers.length - 1 &&
                                <div>
                                    <input type="range" min={0} max={100} onChange={(e) => onPercentageChange(index, e.target.value)}  value={receiver.percentage}/>
                                    <aside>{receiver.percentage}%</aside>
                                </div>}
                                {index === receivers.length - 1 && receivers.length !== 1 && <span>{receiver.percentage}%</span>}
                            </div>
                        )
                    })
                }
                </div>
            </>}
        </>
    }

    const getThirdStep = () => {
        var disabled = (!amount && !percentage) || !transferType || receivers.length === 0 || !isValidPercentage() || (actionType === 'swap' && pathTokens.length === 0)
        return <div className={style.CreatePage}>
            {actionType === 'transfer' ? getTransferThirdStep() : getSwapThirdStep()}
            <div className={style.ActionBTNCreateX}>
                <a className={style.Web3BackBTN} onClick={() => setStep(step - 1)}>Back</a>
                <a className={style.RegularButton}
                    onClick={() => !disabled && props.saveEditOperation(getEntry())}
                    disabled={disabled}
               >Add</a>
            </div>
        </div>
    }

    const getFourthStep = () => {
        return <div/>
    }

    return getStep()
}