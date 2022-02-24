import React, { useState, useEffect } from 'react'

import style from '../../../all.module.css'
import CircularProgress from '../OurCircularProgress'
import { blockchainCall, useWeb3, fromDecimals, toDecimals } from '@ethereansos/interfaces-core'
import ModalStandard from '../ModalStandard'
import ObjectsLists from '../ObjectsLists'
import LogoRenderer from '../LogoRenderer'

const TokenInputRegular = ({onElement, onlySelections, tokens, tokenOnly, noETH, selected, outputValue, disabled, noBalance}) => {

    const { block, account } = useWeb3()

    const element = tokens && tokens.length === 1 ? tokens[0] : selected || null

    const [balance, setBalance] = useState(null)

    const [modalIsOpen, setModalIsOpen] = useState(false)

    const [value, setValue] = useState(outputValue)

    const [max, setMax] = useState(false)

    useEffect(() => {
        outputValue && setValue(outputValue)
    }, [outputValue])

    useEffect(() => {
        !element && setBalance(null)
        element && !element.mainInterface && blockchainCall(element.contract.methods.balanceOf, account).then(setBalance)
        element && element.mainInterface && blockchainCall(element.contract.methods.balanceOf, account, element.id).then(setBalance)
    }, [account, element, block])

    useEffect(() => {
        if(max && value === balance) {
            return
        }
        setMax(false)
    }, [value])

    useEffect(() => {
        onElement && onElement(element, balance || '0', (!element ? '' : max ? balance : value === '0' ? '' : toDecimals(value, element.decimals)) || '')
    }, [balance, value, max])

    var onClick = el => {
        onElement && onElement(el, balance || '0', (!el ? '0' : max ? balance : toDecimals(value, el.decimals)) || '0')
        setModalIsOpen(false)
    }

    const selections = onlySelections || ['ERC-20', 'Items V1', 'Items V2']
    const properties = selections.reduce((acc, it) => ({...acc, [it] : {noETH : noETH === true, renderedProperties:{onClick, noBalance}}}), {})

    return modalIsOpen ? (
        <ModalStandard close={() => setModalIsOpen(false)}>
            <ObjectsLists
                list={tokens}
                onlySelections={selections}
                selectionProperties={properties}/>
        </ModalStandard>
    ) : (
        <div className={style.TradeMarketTokenAll}>
            <div className={style.TradeMarketToken}>
                <a onClick={() => (!tokens || tokens.length > 1) && setModalIsOpen(true)} className={style.TradeMarketTokenSelector}>
                    <LogoRenderer input={element}/>
                    <span>{element?.symbol || ''}{(!tokens || tokens.length > 1) ? <span> ▼</span> : ''}</span>
                </a>
                {!tokenOnly && <div className={style.TradeMarketTokenAmount}>
                    <input disabled={disabled} type="number" placeholder="0.0" min="0.000000000000000001" value={element && max ? fromDecimals(balance, element.decimals, true) : value === '0' ? "" : value} onChange={e => void(setMax(false), setValue(e.currentTarget.value))}/>
                </div>}
            </div>
            {!noBalance && !tokenOnly && element && balance === null && <CircularProgress/>}
            {element && balance !== null && !noBalance && !tokenOnly && <a onClick={() => !disabled && setMax(true)} className={style.TradeMarketTokenBalance}>
                Balance: {fromDecimals(balance, element.decimals)} {element.symbol}
            </a>}
        </div>
    )
}

export default TokenInputRegular