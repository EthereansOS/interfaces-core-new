import React, { useEffect, useState } from 'react'

import { useLocation } from 'react-router'
import { useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'
import { loadItem } from '../../../../logic/itemsV2'
import CircularProgress from '../../../../components/Global/OurCircularProgress'
import { blockchainCall } from '@ethereansos/interfaces-core'

import DappSubMenu from '../../../../components/Global/DappSubMenu'
import ViewCover from '../../../../components/Items/ViewCover'
import ViewDescription from '../../../../components/Items/ViewDescription'
import ViewProperties from '../../../../components/Items/ViewProperties'
import ViewBasics from '../../../../components/Items/ViewBasics'
import SubTrade from '../SubSections/sub-trade.js'
import SubCollectionExplore from '../SubSections/sub-collection-explore.js'

import style from '../items-main-sections.module.css'

const ItemView = () => {
  const location = useLocation()
  const context = useEthosContext()
  const { chainId, web3, account, newContract, getGlobalContract } = useWeb3()
  const [item, setItem] = useState(null)

  useEffect(() => {
    setTimeout(async () => {
      var itemId = location.pathname.substring(location.pathname.lastIndexOf('/') + 1)
      setItem(null)
      var item;
      if(itemId.toLowerCase().indexOf('0x') === -1) {
        item = newContract(context.ItemMainInterfaceABI, await blockchainCall(getGlobalContract("itemProjectionFactory").methods.mainInterface))
      }
      loadItem({context, web3, account, newContract}, itemId, item).then(setItem).catch(() => setItem(undefined))
    })
  }, [chainId, account, location.pathname])

  return (
    <div className={style.SingleContentPage}>
      {item === null && <CircularProgress/>}
      {item === undefined && <h1>No item found with provided Id or address. Maybe wrong network?</h1>}
      {item && <>
        <div className={style.CollectionLeft}>
          <ViewCover item={item}/>
          <ViewBasics item={item}/>
          <ViewDescription item={item}/>
          <ViewProperties item={item}/>
        </div>
        <div className={style.CollectionRight}>
          <SubTrade item={item}/>
          <DappSubMenu item={item}/>
          <SubCollectionExplore item={item}/>
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