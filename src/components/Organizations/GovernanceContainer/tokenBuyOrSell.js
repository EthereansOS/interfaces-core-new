import React, { useCallback, useEffect, useState } from 'react'
import ActionAWeb3Button from "../../Global/ActionAWeb3Button"
import TokenInputRegular from "../../Global/TokenInputRegular"
import RegularModal from '../../Global/RegularModal'
import OurCircularProgress from '../../Global/OurCircularProgress'
import { proposeBuy, proposeSell } from "../../../logic/organization"
import { getAMMs } from '../../../logic/amm'

import ProposalMetadata from '../ProposalMetadata'
import style from '../../../all.module.css'

import { useWeb3, useEthosContext } from '@ethereansos/interfaces-core'
import RegularButtonDuo from '../../Global/RegularButtonDuo'
import LogoRenderer from '../../Global/LogoRenderer'

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

const uniswapV3PoolValues = [{
    value : '100',
    hexValue : '000064',
    label : '0.01%'
}, {
    value : '500',
    hexValue : '0001f4',
    label : '0.05%'
}, {
    value : '3000',
    hexValue : '000bb8',
    label : '0.3%'
}, {
    value : '10000',
    hexValue : '002710',
    label : '1%'
}]

const AMMSelector = ({stateProvider, index}) => {

    const [state, setState] = stateProvider

    const [selectAMM, setSelectAMM] = useState()

    const onUniswapV3PoolValueChange = e => {
        var value = e.currentTarget.value
        var selectedUniswapV3PoolValue = uniswapV3PoolValues.filter(it => it.value === value)[0]
        setState(oldValue => {
            var ammList = [...oldValue.ammList]
            ammList[index] = {
                ...ammList[index],
                uniswapV3PoolValue : selectedUniswapV3PoolValue
            }
            return {
                ...oldValue,
                ammList
            }
        })
    }

    return (<>
        {selectAMM && <RegularModal close={() => setSelectAMM(false)}>
            <div className={style.AMMSelector}>
                {state.amms.map(amm => <label key={amm.address}>
                    <a onClick={() => void(setState(oldValue => {
                        var ammList = [...oldValue.ammList]
                        ammList[index] = {
                            ...amm,
                            uniswapV3PoolValue : ammList[index].uniswapV3PoolValue
                        }
                        return {
                            ...oldValue,
                            ammList
                        }
                    }), setSelectAMM(false))}>
                        <LogoRenderer input={amm}/>
                        <span>{amm.name}</span>
                    </a>
                </label>)}
            </div>
        </RegularModal>}
        {(!state || !state.amms) && <OurCircularProgress/>}
        {state && state.amms && state.ammList && <a className={style.ActionInfoSectionAMM} onClick={() => setSelectAMM(!selectAMM)}>
            {state && state.ammList && state.ammList[index] && <LogoRenderer input={state.ammList[index]} title={state.ammList[index].name}/>}
            <span>▼</span>
        </a>}
        {state && state.ammList && state.ammList[index] && state.ammList[index].name === 'UniswapV3' && <>
            <div className={style.UniV3SelectPerch}>
                <p>Pool:</p>
                <select value={state.ammList[index].uniswapV3PoolValue.value} onChange={onUniswapV3PoolValueChange}>
                    {uniswapV3PoolValues.map(it => <option key={it.value} value={it.value}>{it.label}</option>)}
                </select>
            </div>
        </>}
    </>)
}

const TokenBuyOrSell = ({buyOrSell, element, setOnClick, stateProvider}) => {

    const context = useEthosContext()

    const web3Data = useWeb3()
    const { chainId, newContract, ipfsHttpClient } = web3Data

    const [state, setState] = stateProvider

    useEffect(() => {
        setState(oldValue => ({
            ...oldValue,
            amms : null,
            ammList : null
        }))
        getAMMs({context, ...web3Data}).then(amms => setState(oldValue => ({
            ...oldValue,
            amms,
            ammList : new Array(5).fill({
                ...amms.filter(it => it.name === 'UniswapV3')[0],
                uniswapV3PoolValue : uniswapV3PoolValues[0]
            })
        })))
    }, [chainId])

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
                await proposeBuy({ context, ...web3Data}, element, additionalMetadata, state.ammList, [
                    state.token0,
                    state.token1,
                    state.token2,
                    state.token3
                ])
            } else {
                await proposeSell({ context, ...web3Data}, element, additionalMetadata, state.ammList, [
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
                <AMMSelector stateProvider={stateProvider} index="0"/>
                {!buyOrSell && <PercentageSelector value={state.percentage0} name="percentage0" onChange={onPercentageChange}/>}
            </div>
            <div className={style.TokenSelectorListProposal}>
                <TokenInputRegular noETH tokenOnly selected={state.token1} onElement={token => setToken(1,token)}/>
                <AMMSelector stateProvider={stateProvider} index="1"/>
                {!buyOrSell && <PercentageSelector value={state.percentage1} name="percentage1" onChange={onPercentageChange}/>}
            </div>
            <div className={style.TokenSelectorListProposal}>
                <TokenInputRegular noETH tokenOnly selected={state.token2} onElement={token => setToken(2, token)}/>
                <AMMSelector stateProvider={stateProvider} index="2"/>
                {!buyOrSell && <PercentageSelector value={state.percentage2} name="percentage2" onChange={onPercentageChange}/>}
            </div>
            <div className={style.TokenSelectorListProposal}>
                <TokenInputRegular noETH tokenOnly selected={state.token3} onElement={token => setToken(3, token)}/>
                <AMMSelector stateProvider={stateProvider} index="3"/>
                {!buyOrSell && <PercentageSelector value={state.percentage3} name="percentage3" onChange={onPercentageChange}/>}
            </div>
            {!buyOrSell && <div className={style.TokenSelectorListProposal}>
                <TokenInputRegular noETH tokenOnly selected={state.token4} onElement={token => setToken(4, token)}/>
                <AMMSelector stateProvider={stateProvider} index="4"/>
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