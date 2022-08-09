import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'

import { abi, blockchainCall, formatMoney, fromDecimals, numberToString, useWeb3, toDecimals, shortenWord, useEthosContext } from '@ethereansos/interfaces-core'

import { getEthereum } from '../../../logic/erc20'
import { calculateSwapOutput, calculateSwapInput } from '../../../logic/amm'

import ActionAWeb3Button from '../ActionAWeb3Button'
import TokenInputRegular from '../TokenInputRegular'
import OurCircularProgress from '../OurCircularProgress'
import ActionInfoSection from '../ActionInfoSection'

import style from '../../../all.module.css'
import { getRawField } from '../../../logic/generalReader'

export default props => {

    const { cart, onAction, onDelete, mode, onSecondaryAction, item, onSuccess } = props

    const context = useEthosContext()

    const web3Data = useWeb3()

    const { web3, account, getGlobalContract } = web3Data

    const NFT = useMemo(() => cart[0].contract, [cart])

    const deckPresto = useMemo(() => getGlobalContract("deckPresto"), [web3])

    const checkPrestoTimeout = useRef()

    const [inputType, setInputType] = useState(cart.map(() => true))
    const [selectedAmount, setSelectedAmount] = useState(cart.map(() => numberToString(1e18)))

    const [balance, setBalance] = useState()
    const [balanceETH, setBalanceETH] = useState()
    const [approved, setApproved] = useState(true)
    const [prestoApproved, setPrestoApproved] = useState()

    const [amm, setAMM] = useState(null)
    const [AMMs, setAMMs] = useState()
    const [settings, setSettings] = useState(false)

    const [swapData, setSwapData] = useState()
    const [ETHValue, setETHValue] = useState()

    const [slippage, setSlippage] = useState(0.03)

    const [itemValue, setItemValue] = useState('0')

    const [decimals, setDecimals] = useState('0')

    const [reserveAll, setReserveAll] = useState(false)

    useEffect(setApproved, [account])

    useEffect(() => setTimeout(async function calculateInput() {
        var length = cart.length
        var start = selectedAmount.reduce((acc, it) => acc.ethereansosAdd(it), "0")
        const totalSupply = await blockchainCall(item.mainInterface.methods.totalSupply, item.id)
        if(parseInt(totalSupply) < 1e18) {
            start = numberToString(1e18 - parseInt(totalSupply))
            length--
            if(length === 0) {
                return setInputType(start)
            }
        }
        setItemValue(start.ethereansosAdd(numberToString(1e18).ethereansosMul(length)))
    }), [item, cart, selectedAmount])

    const checkApprove = useCallback(async () => setApproved(mode === 'unwrap' || item.wrapType === 'ERC1155' || await blockchainCall(cart[0].contract.methods.isApprovedForAll, account, item.wrapper.options.address)), [item, account])

    useEffect(() => setTimeout(async function() {
        checkApprove()
        setBalance(await blockchainCall(item.mainInterface.methods.balanceOf, account, item.id))
        setBalanceETH(await web3.eth.getBalance(account))
    }), [checkApprove])

    useEffect(() => setTimeout(async function() {

        var decimals = mode === 'unwrap' ? "18" : "0"

        if(mode === 'wrap') {
            try {
                var rawData = await getRawField({ provider : NFT.currentProvider }, NFT.options.address, 'decimals')
                decimals = abi.decode(["uint256"], rawData)[0].toString()
            } catch(e) {
            }
        }

        setDecimals(decimals)

        const inputType = cart.map(() => true)
        const selectedAmount = cart.map(() => toDecimals(1, decimals))

        const totalSupply = parseInt(await blockchainCall(item.mainInterface.methods.totalSupply, item.id))

        for(const i in cart) {
            const it = cart[i]
            if(item.wrapType === 'ERC721') {
                inputType[i] = true
                continue
            }

            if(it.address === item.address) {
                inputType[i] = false
                continue
            }

            if(mode === 'unwrap' && totalSupply <= 1e18) {
                inputType[i] = true
                continue
            }

            const length = parseInt(await blockchainCall(it.contract.methods.balanceOf, mode === 'unwrap' ? item.wrapper.options.address : account, it.id))

            inputType[i] = []

            for(var z = 0; z < length; z++) {
                inputType[i].push(decimals ? toDecimals(numberToString(z + 1), decimals) : numberToString(z + 1))
            }
            selectedAmount[i] = inputType[i][0]
        }
        setInputType(() => inputType)
        if(mode === 'unwrap' && balance && cart.length === 1 && parseInt(balance) < parseInt(selectedAmount[0]) && parseFloat(fromDecimals(balance, 18, true)) > 0) {
            selectedAmount[0] = balance
        }
        setSelectedAmount(() => selectedAmount)
    }), [cart, balance])

    const checkPresto = useCallback(() => {
        setSwapData(null)
        setETHValue()

        checkPrestoTimeout.current && clearTimeout(checkPrestoTimeout.current)

        checkPrestoTimeout.current = setTimeout(async function() {
            if(mode === 'wrap') {
                var isApproved = await blockchainCall(NFT.methods.isApprovedForAll, account, deckPresto.options.address)
                setPrestoApproved(isApproved)
                if(!isApproved) {
                    return setSwapData()
                }
            }
            setPrestoApproved(true)
            const ETH = await getEthereum({ account, web3 })
            var sD = mode === 'wrap'
                ? await calculateSwapOutput({ ...web3Data, context}, { token : item, value : itemValue }, { token : ETH }, AMMs)
                : await calculateSwapInput({ ...web3Data, context}, { token : ETH }, { token : item, value : itemValue }, AMMs)
            setSwapData(sD)
            setETHValue(sD ? sD[mode === 'wrap' ? 'swapOutput' : 'swapInput'] : '0')
            sD && sD.amm && setAMM(sD.amm)
        }, 500)
    }, [deckPresto, account, mode, NFT, AMMs, itemValue])

    useEffect(() => {
        checkPresto()
    }, [checkPresto])

    const ammRecap = useMemo(() => {

        const input = mode === 'wrap' ? item.symbol : 'ETH'
        const output = mode === 'wrap' ? 'ETH' : item.symbol
        if(swapData) {
           return <div className={style.ActionInfoSectionText}>
                <p>Price Impact: {formatMoney(swapData.priceImpact || '0', 2)}%</p>
                {!swapData.middleSymbol && <p>{input} &#x2192; {output}</p>}
                {swapData.middleSymbol && <p>{input} &#x2192; {swapData.middleSymbol} &#x2192; {output}</p>}
            </div>
        }
        return <div className={style.ActionInfoSectionText}>
            <p>{ swapData === null ? <OurCircularProgress/> : '\u00a0'}</p>
            <p>{'\u00a0'}</p>
        </div>
    }, [swapData, mode, item])

    return (
        <div className={style.Cart}>
            <div className={style.CartNFTs}>
                {cart.map((it, i) => <div key={it.address} className={style.CartNFTOne}>
                    <TokenInputRegular onImageClick={() => onDelete(i)} tokens={[it]} selected={it} tokenOnly={inputType[i] !== false} onElement={(_, b, val) => inputType[i] !== false &&             setSelectedAmount(oldValue => {
                        const newVal = [...oldValue]
                        newVal[i] = val
                        return newVal
                    })}/>
                    {inputType[i] instanceof Array && <select value={selectedAmount[i]} onChange={e => {
                        const val = e.currentTarget.value
                        setSelectedAmount(oldValue => {
                            const newVal = [...oldValue]
                            newVal[i] = val
                            return newVal
                        })
                    }}>
                        {inputType[i].map(it => <option key={it} value={it}>{formatMoney(fromDecimals(it, decimals, true), 6)}</option>)}
                    </select>}
                </div>)}
            </div>
            <div className={style.CartBTs}>
                <div className={style.CartWrapBox}>
                    <div className={style.CartBuyBoxPrice}>
                        <h4>{formatMoney(fromDecimals(selectedAmount.reduce((acc, n) => acc.ethereansosAdd(n), "0"), decimals, true), 6)} {shortenWord({ context, charsAmount : 9}, item.symbol)}</h4>
                        {mode === 'unwrap' && <p>Balance: {formatMoney(fromDecimals(balance, 18, true), 6)} {shortenWord({ context, charsAmount : 9}, item.symbol)}</p>}
                        {mode === 'wrap' && <p><input checked={reserveAll} onChange={e => setReserveAll(e.currentTarget.checked)} type="checkbox"></input>🔒 for 10 days</p>}
                    </div>
                    {approved && <ActionAWeb3Button onSuccess={onSuccess} onClick={() => onAction(inputType, selectedAmount, reserveAll, decimals)}>{mode === 'wrap' ? 'Wrap' : 'Unwrap'}</ActionAWeb3Button>}
                    {!approved && <ActionAWeb3Button onSuccess={checkApprove} onClick={() => blockchainCall(cart[0].contract.methods.setApprovalForAll, item.wrapper.options.address, true)}>Approve</ActionAWeb3Button>}
                </div>
                <div className={style.CartBuyBox}>
                    <div className={style.CartBuyBoxPrice}>
                        {mode === 'wrap' && prestoApproved === undefined && <OurCircularProgress/>}
                        {(mode === 'unwrap' || prestoApproved) && ETHValue ? <h4>{formatMoney(fromDecimals(ETHValue, 18, true), 6)} ETH</h4> : <OurCircularProgress/>}
                        <p>Balance: {formatMoney(fromDecimals(balanceETH, 18, true), 6)} ETH</p>
                    </div>
                    <div className={style.CartBuyBoxSettings}>
                        <ActionInfoSection settings={settings} onSettingsToggle={setSettings} amm={amm} onAMM={setAMM} onAMMs={setAMMs}/>
                    </div>
                    {settings && <div className={style.SettingB}>
                        <div>
                            <label className={style.SettingBLabPerch}>
                                <p>Slippage</p>
                                <input type="range" min="0" max="99" step="0.05" value={slippage} onChange={e => setSlippage(parseFloat(e.currentTarget.value))}/>
                                <span>{slippage}%</span>
                            </label>
                        </div>
                    </div>}
                    {mode === 'wrap' && prestoApproved === false && <ActionAWeb3Button onSuccess={checkPresto} onClick={() => blockchainCall(NFT.methods.setApprovalForAll, deckPresto.options.address, true)}>Approve Sell</ActionAWeb3Button>}
                    {(mode === 'unwrap' || prestoApproved) && <ActionAWeb3Button disabled={mode === 'unwrap' && (!ETHValue || ETHValue === '0' || parseInt(ETHValue) > parseInt(balanceETH))} onSuccess={onSuccess} onClick={() => onSecondaryAction(itemValue, ETHValue, slippage, amm, swapData, inputType, selectedAmount, reserveAll, decimals)}>{mode === 'wrap' ? 'Sell' : 'Buy'}</ActionAWeb3Button>}
                </div>
            </div>
        </div>
    )
}