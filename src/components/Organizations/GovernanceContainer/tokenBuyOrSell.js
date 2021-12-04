import React, { useState } from 'react'
import { CircularProgress } from "@ethereansos/interfaces-ui"
import ActionAWeb3Button from "../../Global/ActionAWeb3Button"
import TokenInputRegular from "../../Global/TokenInputRegular"
import RegularModal from '../../Global/RegularModal'

import { proposeBuy, proposeSell } from "../../../logic/organization"
import style from '../../../all.module.css'

const percentageEntries = [
    {
        name: "1%",
        value: "1"
    }, {
        name: "2%",
        value: "2"
    }, {
        name: "3%",
        value: "3"
    }, {
        name: "4%",
        value: "4"
    }, {
        name: "5%",
        value: "5"
    }
]

const PercentageSelector = ({onChange, value}) => {
    return <select value={value} onChange={onChange}>
        {percentageEntries.map(it =><option key={it.value} value={it.value}>{it.name}</option>)}
    </select>
}

export default ({buyOrSell, close, element}) => {

    const [token0, setToken0] = useState(null)
    const [token1, setToken1] = useState(null)
    const [token2, setToken2] = useState(null)
    const [token3, setToken3] = useState(null)
    const [token4, setToken4] = useState(null)

    const [percentage0, setPercentage0] = useState(parseFloat(percentageEntries[0].value))
    const [percentage1, setPercentage1] = useState(parseFloat(percentageEntries[0].value))
    const [percentage2, setPercentage2] = useState(parseFloat(percentageEntries[0].value))
    const [percentage3, setPercentage3] = useState(parseFloat(percentageEntries[0].value))
    const [percentage4, setPercentage4] = useState(parseFloat(percentageEntries[0].value))

    async function propose() {
        if(buyOrSell) {
            await proposeBuy({}, element, [
                token0,
                token1,
                token2,
                token3
            ])
        } else {
            await proposeSell({}, element, [
                token0,
                token1,
                token2,
                token3,
                token4
            ], [
                percentage0,
                percentage1,
                percentage2,
                percentage3,
                percentage4
            ])
        }
    }

    return (
        <RegularModal close={close} type="medium">
            {!buyOrSell && 
                <p>Propose a change in the 5 tokens to sell weekly and the holding supply perchentage from 1% to 5% each</p>
            }
            {buyOrSell && 
                <p>Propose a change in the 4 tokens to buy every quorter</p>
            }
            <div className={style.TokenSelectorListProposal}>
                <TokenInputRegular noETH tokenOnly onElement={token => setToken0(token)}/>
                {!buyOrSell && <PercentageSelector value={percentage0} onChange={e => setPercentage0(parseFloat(e.currentTarget.value))}/>}
            </div>
            <div className={style.TokenSelectorListProposal}>
                <TokenInputRegular noETH tokenOnly onElement={token => setToken1(token)}/>
                {!buyOrSell && <PercentageSelector value={percentage1} onChange={e => setPercentage1(parseFloat(e.currentTarget.value))}/>}
            </div>
            <div className={style.TokenSelectorListProposal}>
                <TokenInputRegular noETH tokenOnly onElement={token => setToken2(token)}/>
                {!buyOrSell && <PercentageSelector value={percentage2} onChange={e => setPercentage2(parseFloat(e.currentTarget.value))}/>}
            </div>
            <div className={style.TokenSelectorListProposal}>
                <TokenInputRegular noETH tokenOnly onElement={token => setToken3(token)}/>
                {!buyOrSell && <PercentageSelector value={percentage3} onChange={e => setPercentage3(parseFloat(e.currentTarget.value))}/>}
            </div>
            {!buyOrSell && <div className={style.TokenSelectorListProposal}>
                <TokenInputRegular noETH tokenOnly onElement={token => setToken4(token)}/>
                <PercentageSelector value={percentage4} onChange={e => setPercentage4(parseFloat(e.currentTarget.value))}/>
            </div>}
            <ActionAWeb3Button onClick={propose} onSuccess={close}>Propose</ActionAWeb3Button>
        </RegularModal>
    )
}