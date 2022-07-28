import React, { useEffect, useState } from 'react'

import { useLocation } from 'react-router'
import { useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'
import { loadItem } from '../../../../logic/itemsV2'
import CircularProgress from '../../../../components/Global/OurCircularProgress'
import { blockchainCall } from '@ethereansos/interfaces-core'

import ViewCover from '../../../../components/Items/ViewCover'
import ViewDescription from '../../../../components/Items/ViewDescription'
import Unwrap from '../../../../components/Items/Unwrap'
import ViewProperties from '../../../../components/Items/ViewProperties'
import ViewBasics from '../../../../components/Items/ViewBasics'
import SubTrade from '../SubSections/sub-trade.js'
import SubCollectionExplore from '../SubSections/sub-collection-explore.js'
import Wrap from '../../../../components/Items/Wrap'
import ViewManageItem from '../../../../components/Items/ViewManageItem'
import ViewFarmings from '../../../covenants/dapp/farming/index'
import DappSubMenu from '../../../../components/Global/DappSubMenu'

import style from '../../../../all.module.css'
import { useOpenSea } from '../../../../logic/uiUtilities'

const itemSubmenuVoices = [
  {
      id : 'collection',
      label : 'Collection'
  },
  {
      id : 'farming',
      label : 'Farming'
  }
]

const ItemView = () => {

  const { pathname } = useLocation()

  const context = useEthosContext()

  const seaport = useOpenSea()

  const web3Data = useWeb3()
  const { newContract, getGlobalContract } = web3Data

  const [item, setItem] = useState(null)

  const [submenuSelection, setSubmenuSelection] = useState(itemSubmenuVoices[0].id)


  useEffect(() => {
    setTimeout(async () => {
      var itemId = pathname.substring(pathname.lastIndexOf('/') + 1)
      setItem(null)
      var item;
      if(itemId.toLowerCase().indexOf('0x') === -1) {
        item = newContract(context.ItemMainInterfaceABI, await blockchainCall(getGlobalContract("itemProjectionFactory").methods.mainInterface))
      }

      async function bypassOpenSeaEvilness() {
        try {
            const loadedItem = await loadItem({context, seaport, ...web3Data}, itemId, item)
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
      {item === undefined && <h1>No item found. 👀 Wrong network? 👀 </h1>}
      {item && <>
        <div className={style.CollectionLeft}>
          <ViewCover item={item}/>
          <ViewBasics item={item}/>
          <ViewManageItem item={item}/>
          <ViewDescription item={item}/>
          <ViewProperties item={item}/>
        </div>
        <div className={style.CollectionRight}>
          <SubTrade item={item}/>
          {item?.wrapper && <div className={style.WrapUnwrapBox}>
            <Wrap item={item}/>
            <Unwrap item={item} wrapper={item.wrapper}/>
          </div>}
          <DappSubMenu isSelected={it => it.id === submenuSelection} voices={itemSubmenuVoices.map(it => ({...it, onClick : () => submenuSelection !== it.id && setSubmenuSelection(it.id)}))}/>
          {submenuSelection === itemSubmenuVoices[0].id && <SubCollectionExplore item={item}/>}
          {submenuSelection === itemSubmenuVoices[1].id && <ViewFarmings rewardTokenAddress={item.address}/>}
        </div>
      </>}
    </div>
  )
}

ItemView.menuVoice = {
  path : '/items/dapp/:id',
  exact: false
}

export default ItemView