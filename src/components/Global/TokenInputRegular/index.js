import React, { useState, useEffect } from 'react'

import style from './token-input-regular.module.css'
import { CircularProgress } from '@ethereansos/interfaces-ui'
import { fromDecimals } from '@ethereansos/interfaces-core'
import ModalStandard from '../ModalStandard'
import ObjectsLists from '../ObjectsLists'

const defaultImage = `${process.env.PUBLIC_URL}/img/test.jpg`

const TokenInputRegular = (props) => {

    const [element, setElement] = useState(null)

    const [balance, setBalance] = useState(null)

    const [modalIsOpen, setModalIsOpen] = useState(false)

    useEffect(() => {
        setBalance(null)
        var currentElement = element
        currentElement && setTimeout(() => {

        })
    }, [element])

    if(modalIsOpen) {
        return (
            <ModalStandard>
                <ObjectsLists onlySelections={'ERC-20'} selectionProperties={{'ERC-20' : {alsoETH : true}}}/>
            </ModalStandard>
        )
    }

    return (
        <div className={style.TradeMarketTokenAll}>
            <div className={style.TradeMarketToken}>
                <a onClick={() => setModalIsOpen(true)} className={style.TradeMarketTokenSelector}>
                    <figure>
                        <img src={element?.image || defaultImage}/>
                    </figure>
                    <span>{element?.symbol || ''} ▼</span>
                </a>
                <div className={style.TradeMarketTokenAmount}>
                    <input type="number" placeholder="0.0"></input>
                </div>
            </div>
            {element && balance === null && <CircularProgress/>}
            {element && balance !== null && <a className={style.TradeMarketTokenBalance}>
                Balance: {fromDecimals(balance, element.decimals)}
            </a>}
        </div>
    )
}

export default TokenInputRegular