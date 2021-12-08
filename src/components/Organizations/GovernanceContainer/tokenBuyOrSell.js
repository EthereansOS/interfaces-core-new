import React, { useEffect, useState } from 'react'
import ActionAWeb3Button from "../../Global/ActionAWeb3Button"
import TokenInputRegular from "../../Global/TokenInputRegular"
import RegularModal from '../../Global/RegularModal'

import { proposeBuy, proposeSell } from "../../../logic/organization"
import ProposalMetadata from '../ProposalMetadata'
import style from '../../../all.module.css'

import { useWeb3, useEthosContext } from '@ethereansos/interfaces-core'
import RegularButtonDuo from '../../Global/RegularButtonDuo'

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

const PercentageSelector = ({onChange, value, name}) => {
    return <select value={value} data-name={name} onChange={onChange}>
        {percentageEntries.map(it =><option key={it.value} value={it.value}>{it.name}</option>)}
    </select>
}

const TokenBuyOrSell = ({buyOrSell, element, setOnClick, stateProvider}) => {

    const context = useEthosContext()

    const { newContract, ipfsHttpClient } = useWeb3()

    const [state, setState] = stateProvider

    useEffect(() => {
        if(state.loaded) {
            return
        }

        setState(oldValue => ({
            ...oldValue,
            token0 : null,
            token1 : null,
            token2 : null,
            token3 : null,
            token4 : null,
            percentage0: percentageEntries[0].value,
            percentage1: percentageEntries[0].value,
            percentage2: percentageEntries[0].value,
            percentage3: percentageEntries[0].value,
            percentage4: percentageEntries[0].value,
            loaded : true
        }))
    }, [])

    function next() {
        setOnClick(() => async additionalMetadata => {
            if(buyOrSell) {
                await proposeBuy({ context, ipfsHttpClient}, element, additionalMetadata, [
                    state.token0,
                    state.token1,
                    state.token2,
                    state.token3
                ])
            } else {
                await proposeSell({ context, ipfsHttpClient, newContract }, element, additionalMetadata, [
                    state.token0,
                    state.token1,
                    state.token2,
                    state.token3,
                    state.token4
                ], [
                    state.percentage0,
                    state.percentage1,
                    state.percentage2,
                    state.percentage3,
                    state.percentage4
                ])
            }
        })
    }

    function onPercentageChange(e) {
        var name = e.currentTarget.dataset.name
        var value = e.currentTarget.value
        setState(oldValue => ({...oldValue, [name]: value}))
    }

    function setToken(number, value) {
        setState(oldValue => ({...oldValue, ["token" + number]: value}))
    }

    return (
        <>
            <h4>Step 1-2: Select Tokens</h4>
            {!buyOrSell &&
                <p className={style.pModalDesc}>Propose to change the five tokens that are sold each week, and the percentage (1% to 5%) of each that are sold</p>
            }
            {buyOrSell &&
                <p className={style.pModalDesc}>Propose to change the four tokens that are bought each quarter</p>
            }
            <div className={style.TokenSelectorListProposal}>
                <TokenInputRegular noETH tokenOnly selected={state.token0} onElement={token => setToken(0, token)}/>
                {!buyOrSell && <PercentageSelector value={state.percentage0} name="percentage0" onChange={onPercentageChange}/>}
            </div>
            <div className={style.TokenSelectorListProposal}>
                <TokenInputRegular noETH tokenOnly selected={state.token1} onElement={token => setToken(1,token)}/>
                {!buyOrSell && <PercentageSelector value={state.percentage1} name="percentage1" onChange={onPercentageChange}/>}
            </div>
            <div className={style.TokenSelectorListProposal}>
                <TokenInputRegular noETH tokenOnly selected={state.token2} onElement={token => setToken(2, token)}/>
                {!buyOrSell && <PercentageSelector value={state.percentage2} name="percentage2" onChange={onPercentageChange}/>}
            </div>
            <div className={style.TokenSelectorListProposal}>
                <TokenInputRegular noETH tokenOnly selected={state.token3} onElement={token => setToken(3, token)}/>
                {!buyOrSell && <PercentageSelector value={state.percentage3} name="percentage3" onChange={onPercentageChange}/>}
            </div>
            {!buyOrSell && <div className={style.TokenSelectorListProposal}>
                <TokenInputRegular noETH tokenOnly selected={state.token4} onElement={token => setToken(4, token)}/>
                <PercentageSelector value={state.percentage4} name="percentage4" onChange={onPercentageChange}/>
            </div>}
            <RegularButtonDuo onClick={next}>Next</RegularButtonDuo>
        </>
    )
}

export default ({buyOrSell, close, element}) => {
    return (
        <RegularModal close={close}>
            <ProposalMetadata {...{element, onSuccess: close, buyOrSell, Component: TokenBuyOrSell}}/>
        </RegularModal>
    )
}