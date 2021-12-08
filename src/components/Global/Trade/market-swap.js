import React, { useEffect, useState } from 'react'

import TokenInputRegular from '../TokenInputRegular/index.js'
import ActionAWeb3Buttons from '../ActionAWeb3Buttons/index.js'
import ActionInfoSection from '../ActionInfoSection/index.js'

import { calculateSwapOutput, performSwap } from '../../../logic/amm'
import { getEthereum } from '../../../logic/erc20'
import { loadiETH } from '../../../logic/itemsV2.js'

import { fromDecimals, useEthosContext, useWeb3, formatMoney, blockchainCall, VOID_ETHEREUM_ADDRESS } from '@ethereansos/interfaces-core'

import style from '../../../all.module.css'
import OurCircularProgress from '../OurCircularProgress/index.js'

export default ({item, onTokens}) => {

    const context = useEthosContext()

    const { chainId, account, web3, newContract, getGlobalContract } = useWeb3()

    const [amm, setAMM] = useState(null)
    const [settings, setSettings] = useState(false)

    const [input, setInput] = useState(null)
    const [output, setOutput] = useState({token : item})

    const [swapData, setSwapData] = useState(null)
    const [outputValue, setOutputValue] = useState('0')

    const [receiver, setReceiver] = useState('')
    const [slippage, setSlippage] = useState(0.03)

    useEffect(() => {
        getEthereum({account, web3}).then(token => setInput({token}))
        if(!item) {
            loadiETH({context, chainId, account, newContract, getGlobalContract}).then(token => setOutput({token}))
        }
    }, [])

    useEffect(() => {
        setSwapData(null)
        calculateSwapOutput({ context, chainId }, input, output, amm).then(sD => void(setSwapData(sD), setOutputValue(sD?.swapOutput)))
        onTokens && onTokens(input, output)
    }, [input, output, amm])

    useEffect(() => {
        setReceiver('')
    }, [settings])

    function switchSide() {
        var oldInput = {...input}
        var oldOutput = {...output}
        setInput(oldOutput)
        setOutput(oldInput)
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

        return performSwap({account, chainId, context }, input, output, amm, swapData, slippage, receiver)
    }

    var ammRecap = <div className={style.ActionInfoSectionText}>
        <p>{(input?.token && output?.token && input?.value !== '0' && !swapData) ? <OurCircularProgress/> : '\u00a0'}</p>
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
            <TokenInputRegular tokens={input?.token === item && []} selected={input?.token} onElement={(token, balance, value) => setInput({token, value, balance})}/>
            <a className={style.TradeMarketBoxSwitch} onClick={switchSide}>&#xFFEC;</a>
            <TokenInputRegular disabled outputValue={outputValue ? fromDecimals((outputValue || '0'), output?.token?.decimals, true) : undefined} tokens={output?.token === item && []} selected={output?.token} onElement={(token, balance, value) => setOutput({token, value, balance})}/>
            <ActionAWeb3Buttons other={amm?.address} buttonText="Swap" balance={input?.balance} value={input?.value} token={input?.token} onClick={swap}/>
            <ActionInfoSection ammRecap={ammRecap} settings={settings} onSettingsToggle={setSettings} amm={amm} onAMM={setAMM}/>
            {settings && <div className={style.SettingB}>
                <div>
                    <label className={style.SettingBLabPerch}>
                        <p>Slippage</p>
                        <input type="number" min="0" max="100" value={slippage} onChange={e => setSlippage(parseFloat(e.currentTarget.value))}/>
                        <span>%</span>
                    </label>
                </div>
                <div>
                    <label className={style.SettingBLabRegular}>
                        <p>Receiver:</p>
                        <input type="text" value={receiver} onChange={e => setReceiver(e.currentTarget.value)}/>
                    </label>
                </div>
            </div>}
        </>
    )
}