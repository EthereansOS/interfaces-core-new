import React, { useEffect, useState } from 'react'

import { useLocation } from 'react-router'
import { useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'
import { loadItem } from '../../../../logic/itemsV2'
import CircularProgress from '../../../../components/Global/OurCircularProgress'
import { blockchainCall } from '@ethereansos/interfaces-core'

import DappSubMenu from '../../../../components/Global/DappSubMenu'
import ViewCover from '../../../../components/Items/ViewCover'
import ViewDescription from '../../../../components/Items/ViewDescription'
import Unwrap from '../../../../components/Items/Unwrap'
import ViewProperties from '../../../../components/Items/ViewProperties'
import ViewBasics from '../../../../components/Items/ViewBasics'
import SubTrade from '../SubSections/sub-trade.js'
import SubCollectionExplore from '../SubSections/sub-collection-explore.js'
import Wrap from '../../../../components/Items/Wrap'

import style from '../../../../all.module.css'

const ItemView = () => {

  const { pathname } = useLocation()

  const context = useEthosContext()

  const { chainId, web3, account, newContract, getGlobalContract } = useWeb3()

  const [item, setItem] = useState(null)

  useEffect(() => {
    setTimeout(async () => {
      var itemId = pathname.substring(pathname.lastIndexOf('/') + 1)
      setItem(null)
      var item;
      if(itemId.toLowerCase().indexOf('0x') === -1) {
        item = newContract(context.ItemMainInterfaceABI, await blockchainCall(getGlobalContract("itemProjectionFactory").methods.mainInterface))
      }
      loadItem({chainId, context, web3, account, newContract, getGlobalContract}, itemId, item).then(setItem).catch(() => setItem(undefined))
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
          <ViewDescription item={item}/>
          <ViewProperties item={item}/>
        </div>
        <div className={style.CollectionRight}>
          <SubTrade item={item}/>
          <div className={style.WrapUnwrapBox}>
            {item?.wrapper && <Wrap item={item}/>}
            {item?.wrapper && <Unwrap item={item} wrapper={item.wrapper}/>}
          </div>
          {item.collectionData.mintOperator === account && <DappSubMenu item={item} voices={item.collectionData.mintOperator === account ? [{label : 'Manage', to : `/items/dapp/create/item/${item.address}`}] : undefined}/>}
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