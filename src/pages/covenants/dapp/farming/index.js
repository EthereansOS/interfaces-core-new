import React, { useCallback, useEffect, useState, useMemo } from 'react'

import Web3DependantList from '../../../../components/Global/Web3DependantList'

import { isEthereumAddress, useEthosContext, useWeb3, web3Utils } from '@ethereansos/interfaces-core'

import { allFarmings } from '../../../../logic/farming'
import style from '../../../../all.module.css'
import Banners from '../../../../components/Global/banners/index.js'

import SetupComponent from '../../../../components/Covenants/farming/SetupComponent'
import FarmingComponent from '../../../../components/Covenants/farming/FarmingComponent'

const FarmingCard = props => {

    const { element, mode, opened, setOpened, rewardTokenAddress, refresh } = props

    if(mode === "positions" && element.positions) {
        return element.positions.map((it, i) => <SetupComponent key={i + "_" + element.key} {...{
            ...props,
            position : it,
            setupInput : it.setup
        }} />)
    }

    return <FarmingComponent refresh={refresh} element={element} opened={opened} setOpened={setOpened} rewardTokenAddress={rewardTokenAddress}/>
}

const sortOrders = [
    undefined,
    (first, second) => {
        var a = parseInt(first.setups.reduce((acc, val) => acc.ethereansosAdd(val.setupInfo.originalRewardPerBlock), "0"))
        var b = parseInt(second.setups.reduce((acc, val) => acc.ethereansosAdd(val.setupInfo.originalRewardPerBlock), "0"))
        if(a > b) {
            return -1
        }
        if(a < b) {
            return 1
        }
        return 0
    },
    (first, second) => {
        var a = parseInt(first.setups.reduce((acc, val) => acc.ethereansosAdd(val.setupInfo.originalRewardPerBlock), "0"))
        var b = parseInt(second.setups.reduce((acc, val) => acc.ethereansosAdd(val.setupInfo.originalRewardPerBlock), "0"))
        if(a > b) {
            return 1
        }
        if(a < b) {
            return -1
        }
        return 0
    },
    (first, second) => {
        var a = first.setups.length
        var b = second.setups.length
        if(a > b) {
            return -1
        }
        if(a < b) {
            return 1
        }
        return 0
    },
    (first, second) => {
        var a = first.setups.length
        var b = second.setups.length
        if(a > b) {
            return 1
        }
        if(a < b) {
            return -1
        }
        return 0
    }
]

const Farming = ({selectedSubvoice, rewardTokenAddress}) => {

    const mode = useMemo(() => selectedSubvoice ? selectedSubvoice.toLowerCase() : "explore", [selectedSubvoice])

    const [opened, setOpened] = useState()

    useEffect(setOpened, [mode])

    const context = useEthosContext()

    const web3Data = useWeb3()

    const { chainId, account } = web3Data

    const [activeOnly, setActiveOnly] = useState(true)
    const [address, setAddress] = useState()

    const [discriminant, setDiscriminant] = useState(mode + '_' + chainId + '_' + account)


    const [sortOrderIndex, setSortOrderIndex] = useState("0")

    const filter = useCallback(element => {
        if(mode === 'positions' && (!element.positions || element.positions.length === 0)) {
            return false
        }
        if(address && isEthereumAddress(address) && web3Utils.toChecksumAddress(address) !== web3Utils.toChecksumAddress(element.rewardTokenAddress)) {
            return false
        }
        if(activeOnly && element.setups.filter(it => it.active || it.canActivateSetup).length === 0) {
            return false
        }
        if(opened && opened !== element) {
            return false
        }
        return true
    }, [address, activeOnly, mode, opened])

    useEffect(() => {
        const array = discriminant.split('_')
        const oldMode = array[0]
        const oldChainId = parseInt(array[1])
        setOpened()
        if(oldMode === mode && oldChainId === chainId && mode === 'explore') {
            return
        }
        setDiscriminant(mode + '_' + chainId + '_' + account)
    }, [mode, account, chainId])

    useEffect(() => setActiveOnly(true), [mode])

    function refresh() {
        setDiscriminant(mode + '_' + chainId + '_' + account + '_' + new Date().getTime())
        setTimeout(() => setDiscriminant(mode + '_' + chainId + '_' + account))
    }

    return (<>
        <Banners bannerA="banner1" bannerB="banner5" sizeA="30%" sizeB="46%" titleA="Earn With Your Liquidity" titleB="Create Customizable Farming Contracts" linkA="https://docs.ethos.wiki/ethereansos-docs/covenants/covenants-documentation/farming/how-the-farming-works" linkB="https://docs.ethos.wiki/ethereansos-docs/covenants/covenants-documentation/farming" textA="EthOS farms reward you for providing liquidity to decentralized exchanges like Uniswap." textB="Covenants farms can offer any token as a reward for providing any token as liquidity to any pool on any decentralized exchange. No coding skills required."/>
        <div className={style.CovenantsMainBox}>
            <div className={style.FilterMenu}>
                {mode !== 'positions' && <div>
                {!rewardTokenAddress && <input type="text" className={style.FilterMenuSearch} placeholder="Sort by token address.." value={address} onChange={e => setAddress(e.currentTarget.value)}></input>}
                <select value={sortOrderIndex} onChange={e => setSortOrderIndex(e.currentTarget.value)} className={style.FilterSelect}>
                    <option value="0">Sort by..</option>
                    <option value="1">Higher Rewards per day</option>
                    <option value="2">Lower Rewards per day</option>
                    <option value="3">More Setups</option>
                    <option value="4">Less Setups</option>
                </select>
                <label className={style.FilterOnly}>
                <input type="checkbox" checked={activeOnly} onChange={e => setActiveOnly(e.currentTarget.checked)}/>
                    <p>Only Active</p>
                </label>
                </div>}
            </div>
            <Web3DependantList
                provider={() => allFarmings({context, ...web3Data, mode, rewardTokenAddress})}
                renderedProperties={{refresh, mode, activeOnly : mode !== 'positions' && activeOnly, opened, setOpened, rewardTokenAddress}}
                Renderer={FarmingCard}
                discriminant={discriminant}
                filter={filter}
                sortOrder={sortOrders[sortOrderIndex]}
            />
        </div>
    </>)
}

Farming.menuVoice = {
    label : 'Farming',
    path : '/covenants/dapp/farming',
    index : 1,
    contextualRequire : () => require.context('./', false, /.js$/),
    subMenuvoices : ['Explore', 'Positions', 'Hosted']
}

export default Farming