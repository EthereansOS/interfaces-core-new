import React, {useState, useEffect} from 'react'

import { useLocation } from 'react-router'
import { useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'
import CircularProgress from '../../../../components/Global/OurCircularProgress'
import { loadCollection } from '../../../../logic/itemsV2'

import DappSubMenu from '../../../../components/Global/DappSubMenu/'
import ViewCover from '../../../../components/Items/ViewCover/'
import ViewDescription from '../../../../components/Items/ViewDescription/'
import ViewInfoBox from '../../../../components/Items/ViewInfoBox/'
import SubItemsExplore from '../SubSections/sub-items-explore.js'

import style from '../../../../all.module.css'

const CollectionView = () => {
  const location = useLocation()
  const context = useEthosContext()
  const { chainId, web3, account, newContract, getGlobalContract } = useWeb3()
  const [collection, setCollection] = useState(null)

  useEffect(() => {
    setTimeout(async () => {
      var collectionId = location.pathname.substring(location.pathname.lastIndexOf('/') + 1)
      setCollection(null)
      loadCollection({chainId, context, web3, account, newContract, getGlobalContract}, collectionId, getGlobalContract("itemProjectionFactory")).then(setCollection).catch(() => setCollection(undefined))
    })
  }, [chainId, account])

  return (
      <div className={style.SingleContentPage}>
        {collection === null && <CircularProgress/>}
        {collection === undefined && <h1>No collection found with provided Id. Maybe wrong network?</h1>}
        {collection && <>
          <div className={style.CollectionLeft}>
            <ViewCover item={collection}/>
            <ViewDescription item={collection}/>
          </div>
          <div className={style.CollectionRight}>
            <ViewInfoBox collection={collection}/>
            <DappSubMenu item={collection} voices={collection.mintOperator === account ? [{label : 'Manage', to : `/items/dapp/create/item/${collection.id}`}] : undefined}/>
            <SubItemsExplore collection={collection}/>
          </div>
        </>}
      </div>
  )
}

CollectionView.menuVoice = {
  path : '/items/dapp/collections/:id',
  exact: false
}

export default CollectionView
