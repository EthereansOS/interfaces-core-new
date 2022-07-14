import React, { useState, useEffect, useCallback } from 'react'

import style from '../../../all.module.css'
import CircularProgress from '../OurCircularProgress'
import { blockchainCall, useWeb3, fromDecimals, toDecimals, shortenWord, useEthosContext } from '@ethereansos/interfaces-core'
import ModalStandard from '../ModalStandard'
import ObjectsLists from '../ObjectsLists'
import LogoRenderer from '../LogoRenderer'

function numberInputOnWheelPreventChange (e) {
    const target = e.currentTarget
    target.blur()
    e.stopPropagation()
    setTimeout(target.focus)
  }

const TokenInputRegular = ({onElement, onlySelections, tokens, tokenOnly, noETH, selected, outputValue, disabled, noBalance, onImageClick}) => {

    const context = useEthosContext()

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
        if(noBalance || tokenOnly) {
            return setBalance(null)
        }
        element && element.contract && !element.mainInterface && blockchainCall(element.contract.methods.balanceOf, account).then(setBalance)
        element && element.contract && element.mainInterface && blockchainCall(element.contract.methods.balanceOf, account, element.id).then(setBalance)
    }, [account, element, block, noBalance])

    /*useEffect(() => {
        if(max && value === balance) {
            return
        }
        setMax(false)
    }, [max, value])*/

    useEffect(() => {
        try {
            if(max && balance === toDecimals(value, element.decimals)) {
                return
            }
        } catch(e) {
        }
        onElement && onElement(element, balance || '0', (!element ? '' : max ? balance : value === '0' ? '' : toDecimals(value, element.decimals)) || '')
    }, [element, balance, value, max])

    var onClick = el => {
        onElement && onElement(el, '0', '0')
        setValue('0')
        setMax(false)
        setModalIsOpen(false)
    }

    const selections = onlySelections || ['ERC-20', 'Items']
    const properties = selections.reduce((acc, it) => ({...acc, [it] : {noETH : noETH === true, renderedProperties:{onClick, noBalance}}}), {})

    const onValueChange = useCallback(e => {
        setMax(false)
        var v = e.currentTarget.value
        v = v.indexOf('.') === 0 && v !== '.' ? ('0' + v) : v
        setValue(v)
    }, [])

    return modalIsOpen ? (
        <ModalStandard close={() => setModalIsOpen(false)}>
            <ObjectsLists
                list={tokens}
                onlySelections={selections}
                selectionProperties={properties}
            />
        </ModalStandard>
    ) : (
        <div className={style.TradeMarketTokenAll}>
            <div className={style.TradeMarketToken}>
                <a onClick={() => onImageClick ? onImageClick() : (!tokens || tokens.length > 1) && setModalIsOpen(true)} className={style.TradeMarketTokenSelector}>
                    <LogoRenderer input={element}/>
                    <span>{shortenWord({ context, charsAmount : 15}, element?.symbol || '')}{(!tokens || tokens.length > 1) ? <span> ▼</span> : ''}</span>
                </a>
                {!tokenOnly && <div className={style.TradeMarketTokenAmount}>
                    <input onWheel={numberInputOnWheelPreventChange} disabled={disabled} type="number" placeholder="0.0" min="0.000000000000000001" value={element && max ? fromDecimals(balance, element.decimals, true) : value === '0' ? "" : value} onChange={onValueChange}/>
                </div>}
            </div>
            {!noBalance && !tokenOnly && element && balance === null && <CircularProgress/>}
            {element && balance !== null && !noBalance && !tokenOnly && <a onClick={() => !disabled && setMax(true)} className={style.TradeMarketTokenBalance}>
                Balance: {fromDecimals(balance, element.decimals, 8)} {shortenWord({ context, charsAmount : 15}, element.symbol)}
            </a>}
        </div>
    )
}

export default TokenInputRegular