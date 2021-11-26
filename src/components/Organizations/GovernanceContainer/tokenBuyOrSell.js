import React, { useState } from 'react'
import { CircularProgress } from "@ethereansos/interfaces-ui"
import ActionAWeb3Button from "../../Global/ActionAWeb3Button"
import TokenInputRegular from "../../Global/TokenInputRegular"
import RegularModal from '../../Global/RegularModal'

import { proposeBuy, proposeSell } from "../../../logic/organization"
import ActionAWeb3Buttons from '../../Global/ActionAWeb3Buttons'
import style from './governance-container.module.css'

export default ({buyOrSell, close, proposal}) => {

    const [token0, setToken0] = useState(null)
    const [token1, setToken1] = useState(null)
    const [token2, setToken2] = useState(null)
    const [token3, setToken3] = useState(null)
    const [token4, setToken4] = useState(null)

    const [percentage0, setPercentage0] = useState(null)
    const [percentage1, setPercentage1] = useState(null)
    const [percentage2, setPercentage2] = useState(null)
    const [percentage3, setPercentage3] = useState(null)
    const [percentage4, setPercentage4] = useState(null)

    const [loading, setLoading] = useState(false)

    async function propose() {
        setLoading(true)
        var errorMessage
        try {
            if(buyOrSell) {
                await proposeBuy({}, proposal, [
                    token0,
                    token1,
                    token2,
                    token3
                ])
            } else {
                await proposeSell({}, proposal, [
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
            close && close()
        } catch(e) {
            errorMessage = e.message || e
        }
        setLoading(false)
        errorMessage && setTimeout(() => alert(errorMessage))
    }

    return (
        <RegularModal close={close} type="medium">
            <div className={style.TokenSelectorListProposal}>
                <TokenInputRegular tokenOnly onElement={token => setToken0(token)}/>
                {!buyOrSell && <input type="number" min="0.001" max="10" value={percentage0} onChange={e => setPercentage0(parseFloat(e.currentTarget.value))}/>}
            </div>
            <div className={style.TokenSelectorListProposal}>
                <TokenInputRegular tokenOnly onElement={token => setToken1(token)}/>
                {!buyOrSell && <input type="number" min="0.001" max="10" value={percentage1} onChange={e => setPercentage1(parseFloat(e.currentTarget.value))}/>}
            </div>
            <div className={style.TokenSelectorListProposal}>
                <TokenInputRegular tokenOnly onElement={token => setToken2(token)}/>
                {!buyOrSell && <input type="number" min="0.001" max="10" value={percentage2} onChange={e => setPercentage2(parseFloat(e.currentTarget.value))}/>}
            </div>
            <div className={style.TokenSelectorListProposal}>
                <TokenInputRegular tokenOnly onElement={token => setToken3(token)}/>
                {!buyOrSell && <input type="number" min="0.001" max="10" value={percentage3} onChange={e => setPercentage3(parseFloat(e.currentTarget.value))}/>}
            </div>
            {!buyOrSell && <div className={style.TokenSelectorListProposal}>
                <TokenInputRegular tokenOnly onElement={token => setToken4(token)}/>
                <input type="number" min="0.001" max="10" value={percentage4} onChange={e => setPercentage4(parseFloat(e.currentTarget.value))}/>
            </div>}
            <ActionAWeb3Button onClick={propose}>Propose</ActionAWeb3Button>
        </RegularModal>
    )
}