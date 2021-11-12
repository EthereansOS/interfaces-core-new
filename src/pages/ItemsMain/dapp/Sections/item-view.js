import React, { useEffect, useState } from 'react'

import { useLocation } from 'react-router'
import { useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'
import { loadItem } from '../../../../logic/backend/itemsV2'
import { CircularProgress } from '@ethereansos/interfaces-ui'
import { blockchainCall } from '@ethereansos/interfaces-core'

import style from './items-main-sections.module.css'
import DappSubMenu from '../../../../components/Global/DappSubMenu/index.js'
import ViewCover from '../../../../components/Items/ViewCover/index.js'
import ViewDescription from '../../../../components/Items/ViewDescription/index.js'
import ViewProperties from '../../../../components/Items/ViewProperties/index.js'
import ViewBasics from '../../../../components/Items/ViewBasics/index.js'
import SubTrade from '../SubSections/sub-trade.js'
import SubCollectionExplore from '../SubSections/sub-collection-explore.js'

const ItemView = () => {
  const location = useLocation()
  const context = useEthosContext()
  const { web3, account, newContract, getGlobalContract } = useWeb3()
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
  }, [])

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

export default ItemView