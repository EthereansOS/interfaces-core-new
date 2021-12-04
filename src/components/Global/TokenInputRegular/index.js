import React, { useState, useEffect } from 'react'

import style from '../../../all.module.css'
import { CircularProgress } from '@ethereansos/interfaces-ui'
import { blockchainCall, useWeb3, fromDecimals, toDecimals } from '@ethereansos/interfaces-core'
import ModalStandard from '../ModalStandard'
import ObjectsLists from '../ObjectsLists'
import LogoRenderer from '../LogoRenderer'

const TokenInputRegular = ({onElement, tokens, tokenOnly, noETH}) => {

    const { chainId, account } = useWeb3()

    const [element, setElement] = useState(null)

    const [balance, setBalance] = useState(null)

    const [modalIsOpen, setModalIsOpen] = useState(false)

    const [value, setValue] = useState('0')

    const [max, setMax] = useState(false)

    useEffect(() => setElement(null), [chainId])

    useEffect(() => onElement && onElement(element, balance || '0', (!element ? '0' : max ? balance : toDecimals(value, element.decimals)) || '0'), [balance, value, max])

    useEffect(() => {
        setBalance(null)
        element && !element.mainInterface && blockchainCall(element.contract.methods.balanceOf, account).then(setBalance)
        element && element.mainInterface && blockchainCall(element.contract.methods.balanceOf, account, element.id).then(setBalance)
    }, [account, element])

    useEffect(() => {
        setMax(false)
    }, [value])

    var onClick = el => {
        setElement(el)
        setModalIsOpen(false)
    }

    return modalIsOpen ? (
        <ModalStandard close={() => setModalIsOpen(false)}>
            <ObjectsLists
                list={tokens}
                onlySelections={['ERC-20', 'Items']}
                selectionProperties={{
                    'ERC-20' : {noETH, renderedProperties:{onClick}},
                    'Items' : {renderedProperties:{onClick}}
                }}/>
        </ModalStandard>
    ) : (
        <div className={style.TradeMarketTokenAll}>
            <div className={style.TradeMarketToken}>
                <a onClick={() => setModalIsOpen(true)} className={style.TradeMarketTokenSelector}>
                    <LogoRenderer input={element}/>
                    <span>{element?.symbol || ''} ▼</span>
                </a>
                {!tokenOnly && <div className={style.TradeMarketTokenAmount}>
                    <input type="number" placeholder="0.0" value={element && max ? fromDecimals(balance, element.decimals, true) : value} onChange={e => setValue(e.currentTarget.value)}/>
                </div>}
            </div>
            {!tokenOnly && element && balance === null && <CircularProgress/>}
            {!tokenOnly && element && balance !== null && <a onClick={() => setMax(true)} className={style.TradeMarketTokenBalance}>
                Balance: {fromDecimals(balance, element.decimals)} {element.symbol}
            </a>}
        </div>
    )
}

export default TokenInputRegular