import React, { useEffect, useState } from 'react'

import OTCDetail from './otc-detail.js'

import { useEthosContext, useWeb3, blockchainCall, abi, shortenWord } from '@ethereansos/interfaces-core'

import { loadItem } from '../../../logic/itemsV2.js'

import style from '../../../all.module.css'
import OurCircularProgress from '../OurCircularProgress/index.js'

import WrapERC20 from '../../Items/Wrap/ERC20'
import RegularModal from '../RegularModal/index.js'
import { useOpenSea } from '../../../logic/uiUtilities.js'

export default ({item}) => {

    const context = useEthosContext()

    const seaport = useOpenSea()

    const web3Data = useWeb3()
    const { getGlobalContract } = web3Data

    const [itemInput, setItemInput] = useState(null)
    const [buyModal, setBuyModal] = useState(false)

    const [sellModal, setSellModal] = useState(false)

    const [wrap, setWrap] = useState(false)

    async function refreshItemInput(item) {
        setItemInput(item)
        if(!item || item.mainInterface) {
            return
        }
        const w20 = getGlobalContract('eRC20Wrapper')
        var itemId = await blockchainCall(w20.methods.itemIdOf, item.address)
        if(itemId !== '0') {
            itemId = abi.decode(["address"], abi.encode(["uint256"], [itemId]))[0].toString()
            return setItemInput(await loadItem({ context, seaport, ...web3Data}, itemId))
        }
        try {
            const itemId = abi.decode(['uint256'], abi.encode(['address'], [item.address]))[0].toString()
            const loadedItem = await loadItem({ context, seaport, ...web3Data}, itemId)
            if(loadedItem && loadedItem.id === itemId) {
                return setItemInput(loadedItem)
            }
        } catch(e) {}
        return setItemInput(null)
    }

    useEffect(() => {
        refreshItemInput(item)
    }, [item])

    return (
        <>
            {wrap && <RegularModal close={() => setWrap(false)}>
                <WrapERC20 token={item} onSuccess={() => refreshItemInput(item)}/>
            </RegularModal>}
            <div className={style.TradeOTCBox}>
                <h4>{shortenWord({ context, charsAmount : 15}, (itemInput || item)?.symbol)} Orders</h4>

                <p>Orders are currently unavailable</p> {/*
                {!itemInput && <a onClick={() => setWrap(true)}>Be the first to wrap this token</a>}
                {itemInput && !itemInput.mainInterface && <OurCircularProgress/>}
                {itemInput?.mainInterface && <>
                    <div className={style.TradeOTCBoxOrdersBuy}>
                        <h6>Buy Orders{"\u00a0"}<a onClick={() => setBuyModal(true)}><b>+</b></a></h6>
                        <div className={style.TradeOTCBoxOrders}>
                            <OTCDetail item={itemInput} buyOrSell={true} modal={buyModal} close={() => setBuyModal(false)}/>
                        </div>
                    </div>
                    <div className={style.TradeOTCBoxOrdersSell}>
                        <h6>Sell Orders{"\u00a0"}<a onClick={() => setSellModal(true)}><b>+</b></a></h6>
                        <div className={style.TradeOTCBoxOrders}>
                            <OTCDetail item={itemInput} buyOrSell={false} modal={sellModal} close={() => setSellModal(false)}/>
                        </div>
                    </div>
                </>} }*/}
            </div>
        </>
    )
}