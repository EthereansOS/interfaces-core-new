import React, { useCallback, useEffect, useState } from 'react'

import { useLocation } from 'react-router'

import { blockchainCall, useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'

import { loadDeckItem, loadDeckItems, cartAction, secondaryCartAction } from '../../../../logic/itemsV2'

import CircularProgress from '../../../../components/Global/OurCircularProgress'
import DappSubMenu from '../../../../components/Global/DappSubMenu'
import Cart from '../../../../components/Global/Cart'
import ViewCover from '../../../../components/Items/ViewCover'
import ViewBasics from '../../../../components/Items/ViewBasics/deck'
import SubTrade from '../SubSections/sub-trade.js'
import ExploreNFT from '../../../../components/Items/ExploreNFT'
import Web3DependantList from '../../../../components/Global/Web3DependantList'

import style from '../../../../all.module.css'
import { useOpenSea } from '../../../../logic/uiUtilities'

const deckSubmenuVoices = [
    {
        id : 'wrap',
        label : 'Get Deck'
    },
    {
        id : 'unwrap',
        label : 'Get NFTs'
    }
]

const DeckView = () => {

    const { pathname } = useLocation()

    const context = useEthosContext()

    const web3Data = useWeb3()

    const seaport = useOpenSea()

    const { chainId, web3, account, newContract, getGlobalContract } = web3Data

    const [item, setItem] = useState(null)
    const [submenuSelection, setSubmenuSelection] = useState(deckSubmenuVoices[1].id)
    const [cart, setCart] = useState()
    const [discriminant, setDiscriminant] = useState(new Date().getTime())

    const onCartAction = (inputType, selectedAmount, reserveAll, decimals) => cartAction({context, seaport, ...web3Data}, submenuSelection, item, cart, inputType, selectedAmount, reserveAll, decimals)
    const onCartSecondaryAction = (itemValue, ETHValue, slippage, amm, swapData, inputType, selectedAmount, reserveAll, decimals) => secondaryCartAction({context, seaport, ...web3Data}, submenuSelection, item, cart, itemValue, ETHValue, slippage, amm, swapData, inputType, selectedAmount, reserveAll, decimals)

    useEffect(() => {
        setTimeout(async () => {
            var itemId = pathname.split('/')
            if(itemId[itemId.length - 1].toLowerCase().indexOf("0x") === -1 && isNaN(parseInt(itemId[itemId.length - 1]))) {
                setSubmenuSelection(itemId[itemId.length - 1])
                itemId = itemId[itemId.length - 2]
            } else {
                itemId = itemId[itemId.length - 1]
            }
            setItem(null)
            var item
            if(itemId.toLowerCase().indexOf('0x') === -1) {
                item = newContract(context.ItemMainInterfaceABI, await blockchainCall(getGlobalContract("itemProjectionFactory").methods.mainInterface))
            }
            async function bypassOpenSeaEvilness() {
                try {
                    const loadedItem = await loadDeckItem({context, ...web3Data, seaport}, itemId, item)
                    return setItem(loadedItem)
                } catch(e) {
                    const message = (e.message || e).toLowerCase()
                    if(message.indexOf('header not found') !== -1 || message.indexOf('429') !== -1 || message.indexOf('failed to fetch') !== -1) {
                        await new Promise(ok => setTimeout(ok, 3000))
                        return bypassOpenSeaEvilness()
                    }
                }
                setItem(undefined)
            }
            bypassOpenSeaEvilness()
        })
    }, [pathname])

    return (
        <div className={style.SingleContentPage}>
            {item === null && <CircularProgress/>}
            {item === undefined && <h1>No item found. ???? Wrong network? ???? </h1>}
            {item && <>
                <div className={style.CollectionLeft}>
                    <ViewCover item={item}/>
                    <ViewBasics item={item}/>
                </div>
                <div className={style.CollectionRight}>
                    <SubTrade item={item}/>
                </div>
                <DappSubMenu isSelected={it => it.id === submenuSelection} voices={deckSubmenuVoices.map(it => ({...it, onClick : () => submenuSelection !== it.id && void(setCart(), setSubmenuSelection(it.id))}))}/>
                <div className={style.DeckMarketPlace}>
                    <Web3DependantList
                        Renderer={ExploreNFT}
                        provider={() => loadDeckItems({...web3Data, seaport, context}, item, submenuSelection)}
                        renderedProperties={{
                            mode : submenuSelection,
                            onClick : element => setCart(cart => !cart ? [element] : cart.indexOf(element) !== -1 ? cart : [...cart, element])
                        }}
                        discriminant={account + '_' + submenuSelection + '_' + item.address + '_' + discriminant}
                    />
                </div>
                {cart && cart.length > 0 && <Cart item={item} mode={submenuSelection} cart={cart} onDelete={i => setCart(c => c.splice(i, 1) && [...c])} onAction={onCartAction} onSecondaryAction={onCartSecondaryAction} onSuccess={() => void(setCart(), setDiscriminant(new Date().getTime()))}/>}
            </>}
        </div>
    )
}

DeckView.menuVoice = {
  path : '/items/dapp/decks/:id',
  exact: false
}

export default DeckView