import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react'

import TokenInputRegular from '../TokenInputRegular'
import ActionAWeb3Buttons from '../ActionAWeb3Buttons'
import ActionInfoSection from '../ActionInfoSection'
import OurCircularProgress from '../OurCircularProgress'

import { calculateSwapOutput, calculateSwapInput, performSwap } from '../../../logic/amm'
import { getEthereum } from '../../../logic/erc20'
import { loadiETH } from '../../../logic/itemsV2.js'

import { fromDecimals, useEthosContext, useWeb3, formatMoney } from '@ethereansos/interfaces-core'

import style from '../../../all.module.css'

export default ({item, onTokens}) => {

    const context = useEthosContext()

    const web3Data = useWeb3()

    const { chainId, account, web3, newContract, getGlobalContract } = web3Data

    const [amm, setAMM] = useState(null)
    const [settings, setSettings] = useState(false)

    const [input, setInput] = useState(null)
    const [output, setOutput] = useState({token : item})

    const [swapData, setSwapData] = useState(null)

    const [receiver, setReceiver] = useState('')
    const [slippage, setSlippage] = useState(0.03)

    const [AMMs, setAMMs] = useState()

    const switching = useRef(false)

    const other = useMemo(() => {
        if(!amm || !swapData) {
            return
        }
        if(amm.name === 'UniswapV2') {
            return context.uniswapV2RouterAddress
        }
        if(amm.name === 'SushiSwap') {
            return context.sushiSwapRouterAddress
        }
        if(amm.name === 'Balancer' || amm.name === 'Mooniswap') {
            try {
                return swapData.liquidityPoolAddresses[0]
            } catch(e) {
                return
            }
        }
        return amm.address
    }, [amm, swapData])

    const changer = useRef()

    const calculate = useRef()

    const calculateSwap = useMemo(() => ({
        'swapInput' : [
            calculateSwapInput,
            setInput
        ],
        'swapOutput' : [
            calculateSwapOutput,
            setOutput
        ],
    }), [])

    useEffect(() => {
        getEthereum({account, web3}).then(token => setInput({token}))
        if(!item) {
            loadiETH({context, chainId, account, newContract, getGlobalContract}).then(token => setOutput({token}))
        }
    }, [])

    useEffect(() => {
        if((!input?.value || input?.value === '0') && (!output?.value || output?.value === '0')) {
            setSwapData()
            setAMM()
        }
    }, [input, output])

    calculate.current = async function calculate(amm, inputIn, outputIn, type) {
        inputIn = inputIn || input
        outputIn = outputIn || output
        onTokens && onTokens(inputIn, outputIn)
        setSwapData(null)
        type = type || 'swapOutput'
        const element = calculateSwap[type || 'swapOutput']
        const sD = await element[0]({...web3Data, context}, inputIn, outputIn, amm || AMMs)
        setSwapData(sD)
        element[1](oldValue => !sD || (oldValue && sD[type] === oldValue.value) ? oldValue : ({...oldValue, value : sD[type]}))
        sD && sD.amm && setAMM(sD.amm)
    }

    useEffect(() => {
        calculate.current(amm)
        if(amm && (amm.name === 'Balancer' || amm.name === 'Mooniswap')) {
            return setReceiver()
        }
    }, [amm])

    function onOutput(token, balance, value) {
        if(switching.current) {
            return
        }
        changer.current && clearTimeout(changer.current)
        if(output && output.token === token && output.value === value && output.balance === balance) {
            return
        }
        const oldToken = output?.token
        const newOutput = {token, balance, value}
        setOutput(newOutput)
        if(output && output.token === token && output.value === value) {
            return
        }
        if(!value || value === '0') {
            return setInput({...input, value : undefined})
        }
        changer.current = setTimeout(() => calculate.current(/*oldToken?.address === newOutput?.token?.address && amm*/undefined, input, newOutput, 'swapInput'), 500)
    }

    function onInput(token, balance, value) {
        if(switching.current) {
            return
        }
        changer.current && clearTimeout(changer.current)
        if(input && input.token === token && input.value === value && input.balance === balance) {
            return
        }
        const oldToken = input?.token
        const newInput = {token, balance, value}
        setInput(newInput)
        if(input && input.token === token && input.value === value) {
            return
        }
        if(!value || value === '0') {
            return setOutput({...output, value : undefined})
        }
        changer.current = setTimeout(() => calculate.current(/*oldToken?.address === newInput?.token?.address && amm*/undefined, newInput, output), 500)
    }

    useEffect(() => {
        setReceiver('')
    }, [settings])

    function switchSide() {
        switching.current = true
        var oldInput = {...input, value : '0'}
        var oldOutput = {...output}
        setInput(oldOutput)
        setOutput(oldInput)
        setTimeout(async () => {
            await calculate.current(/*oldToken?.address === newInput?.token?.address && amm*/undefined, oldOutput, oldInput)
            switching.current = false
        })
    }

    function swap() {

        if(!swapData) {
            throw "Wait for calculation of the best route"
        }

        if(!input?.token) {
            throw "Input"
        }
        var inputValue = input?.value
        if(parseInt(inputValue) <= 0) {
            throw "Input value must be a number greater than 0"
        }
        if(!output?.token) {
            throw "Output"
        }
        var outputValue = output?.value
        if(parseInt(outputValue) <= 0) {
            throw "Output value must be a number greater than 0"
        }

        return performSwap({ context, ...web3Data }, input, output, amm, swapData, slippage, receiver)
    }

    var ammRecap = <div className={style.ActionInfoSectionText}>
        <p>{(input?.token && output?.token && input?.value !== '0' && swapData === null) ? <OurCircularProgress/> : '\u00a0'}</p>
        <p>{'\u00a0'}</p>
    </div>

    if(input?.token && output?.token && swapData) {
        ammRecap = <div className={style.ActionInfoSectionText}>
            <p>Price Impact: {formatMoney(swapData.priceImpact || '0', 2)}%</p>
            {!swapData.middleSymbol && <p>{input.token.symbol} &#x2192; {output.token.symbol}</p>}
            {swapData.middleSymbol && <p>{input.token.symbol} &#x2192; {swapData.middleSymbol} &#x2192; {output.token.symbol}</p>}
        </div>
    }

    return (
        <>
            <TokenInputRegular outputValue={input ? fromDecimals(input?.value, input?.token?.decimals, true) : undefined} tokens={input?.token === item && []} selected={input?.token} onElement={onInput}/>
            <a className={style.TradeMarketBoxSwitch} onClick={switchSide}>🔁</a>
            <TokenInputRegular outputValue={output ? fromDecimals(output?.value, output?.token?.decimals, true) : undefined} tokens={output?.token === item && []} selected={output?.token} onElement={onOutput}/>
            <div className={style.TradeInfoThings}>
                <ActionInfoSection ammRecap={ammRecap} settings={settings} onSettingsToggle={setSettings} amm={amm} onAMM={setAMM} onAMMs={setAMMs}/>
                {settings && <div className={style.SettingB}>
                    <div>
                        <label className={style.SettingBLabPerch}>
                            <p>Slippage</p>
                            <input type="range" min="0" max="99" step="0.05" value={slippage} onChange={e => setSlippage(parseFloat(e.currentTarget.value))}/>
                            <span>{slippage}%</span>
                        </label>
                    </div>
                    {amm && amm.name !== 'Balancer' && amm.name !== 'Mooniswap' && <div>
                        <label className={style.SettingBLabRegular}>
                            <p>Receiver:</p>
                            <input type="text" value={receiver} onChange={e => setReceiver(e.currentTarget.value)}/>
                        </label>
                    </div>}
                </div>}
                <ActionAWeb3Buttons other={other} buttonText="Swap" balance={input?.balance} value={input?.value} token={input?.token} onClick={swap}/>
            </div>
        </>
    )
}