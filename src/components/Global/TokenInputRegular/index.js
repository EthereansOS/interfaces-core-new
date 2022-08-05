import React, { useState, useEffect, useCallback, useMemo } from 'react'

import style from '../../../all.module.css'
import CircularProgress from '../OurCircularProgress'
import { abi, blockchainCall, useWeb3, fromDecimals, toDecimals, shortenWord, useEthosContext, formatMoney, numberToString } from '@ethereansos/interfaces-core'
import ModalStandard from '../ModalStandard'
import ObjectsLists from '../ObjectsLists'
import LogoRenderer from '../LogoRenderer'
import { getRawField } from '../../../logic/generalReader'

function numberInputOnWheelPreventChange (e) {
    const target = e.currentTarget
    target.blur()
    e.stopPropagation()
    setTimeout(target.focus)
  }

const TokenInputRegular = ({onElement, onlySelections, tokens, tokenOnly, noETH, selected, outputValue, disabled, noBalance, onImageClick}) => {

    const context = useEthosContext()

    const { block, account, web3 } = useWeb3()

    const element = tokens && tokens.length === 1 ? tokens[0] : selected || null

    const [balance, setBalance] = useState(null)

    const [modalIsOpen, setModalIsOpen] = useState(false)

    const [value, setValue] = useState(outputValue)

    useEffect(() => {
        outputValue && setValue(outputValue)
    }, [outputValue])

    useEffect(() => {
        !element && setBalance(null)
        if(noBalance || tokenOnly) {
            return setBalance(null)
        }
        element && element.contract && !element.mainInterface && blockchainCall(element.contract.methods.balanceOf, account).then(setBalance)
        element && element.contract && element.mainInterface && !element.l2Address && blockchainCall(element.contract.methods.balanceOf, account, element.id).then(setBalance)
        element && element.contract && element.mainInterface && element.l2Address && getRawField({ provider : web3.currentProvider}, element.l2Address, 'balanceOf(address)', account).then(it => setBalance(abi.decode(['uint256'], it)[0].toString()))
    }, [account, element, block, noBalance])

    useEffect(() => {
        onElement && onElement(element, balance || '0', (!element ? '' : !value || value === '0' ? '' : toDecimals(value, element.decimals)) || '')
    }, [element, balance, value])

    var onClick = el => {
        onElement && onElement(el, '0', '0')
        setValue('0')
        setModalIsOpen(false)
    }

    const selections = onlySelections || ['ERC-20', 'Items']
    const properties = selections.reduce((acc, it) => ({...acc, [it] : {noETH : noETH === true, renderedProperties:{onClick, noBalance}}}), {})

    const onValueChange = useCallback(e => {
        var v = e.currentTarget.value
        v = v.indexOf('.') === 0 && v !== '.' ? ('0' + v) : v
        if(v !== '0.' && !v.endsWith('0')) {
            v = numberToString(parseFloat(v))
        }
        setValue(v)
    }, [])

    const valueInput = useMemo(() => {
        if(!element || isNaN(parseFloat(value)) || (parseFloat(value) === 0 && value === '0')) {
            return ''
        }
        return value
    }, [value, element])

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
                    <input onWheel={numberInputOnWheelPreventChange} disabled={disabled} type="number" placeholder="0.0" min="0.000000000000000001" step="0.001" value={valueInput} onChange={onValueChange}/>
                </div>}
            </div>
            {!noBalance && !tokenOnly && element && balance === null && <CircularProgress/>}
            {(element && balance !== null && !noBalance && !tokenOnly) ? <a onClick={() => !disabled && setValue(fromDecimals(balance, element.decimals, true))} className={style.TradeMarketTokenBalance}>
                Balance: {formatMoney(fromDecimals(balance, element.decimals, true))} {shortenWord({ context, charsAmount : 15}, element.symbol)}
            </a> : <a className={style.TradeMarketTokenBalance}>{'\u00a0'}</a>}
        </div>
    )
}

export default TokenInputRegular