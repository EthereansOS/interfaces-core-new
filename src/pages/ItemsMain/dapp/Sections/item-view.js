import React, { useEffect, useState } from 'react'

import { useLocation } from 'react-router'
import { useContextualWeb3 } from '../../../../logic/frontend/contextualWeb3'
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
  const { newContract, getGlobalContract } = useContextualWeb3()
  const context = useEthosContext()
  const { web3, account } = useWeb3()
  const [item, setItem] = useState(null)


  useEffect(async () => {
    var itemId = location.pathname.substring(location.pathname.lastIndexOf('/') + 1)
    setItem(null)
    var item;
    if(itemId.toLowerCase().indexOf('0x') === -1) {
      var itemProjectionFactory = getGlobalContract("itemProjectionFactory")
      item = newContract(context.ItemABI, await blockchainCall(itemProjectionFactory.methods.mainInterface))
    }
    loadItem({context, web3, account, newContract}, itemId, item).then(setItem).catch(() => setItem(undefined))
  }, [web3])

  /*
    <ModalStandard>
      <ObjectsLists/>
    </ModalStandard>
  */
  return (
    <div className={style.SingleContentPage}>
      {item === null && <CircularProgress/>}
      {item === undefined && <h1>No item found with provided Id or address. Maybe wrong network?</h1>}
      {item && <>
        <div className={style.CollectionLeft}>
          <ViewCover></ViewCover>
          <ViewBasics></ViewBasics>
          <ViewDescription></ViewDescription>
          <ViewProperties></ViewProperties>
        </div>
        <div className={style.CollectionRight}>
          <SubTrade></SubTrade>
          <DappSubMenu></DappSubMenu>
          <SubCollectionExplore></SubCollectionExplore>
        </div>
      </>}
    </div>
  )
}

export default ItemView