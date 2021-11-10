import React, {useState, useEffect} from 'react'

import { useLocation } from 'react-router'
import { useContextualWeb3 } from '../../../../logic/frontend/contextualWeb3'
import { useEthosContext, useWeb3, blockchainCall } from '@ethereansos/interfaces-core'
import { CircularProgress } from '@ethereansos/interfaces-ui'
import { loadCollection } from '../../../../logic/backend/itemsV2'

import DappSubMenu from '../../../../components/Global/DappSubMenu/index.js'
import ViewCover from '../../../../components/Items/ViewCover/index.js'
import ViewDescription from '../../../../components/Items/ViewDescription/index.js'
import ViewInfoBox from '../../../../components/Items/ViewInfoBox/index.js'
import SubItemsExplore from '../SubSections/sub-items-explore.js'

import style from './items-main-sections.module.css'

const CollectionView = () => {
  const location = useLocation()
  const { newContract, getGlobalContract } = useContextualWeb3()
  const context = useEthosContext()
  const { web3, account } = useWeb3()
  const [collection, setCollection] = useState(null)

  useEffect(() => {
    setTimeout(async () => {
      var collectionId = location.pathname.substring(location.pathname.lastIndexOf('/') + 1)
      setCollection(null)
      loadCollection({context, web3, account, newContract}, collectionId, getGlobalContract("itemProjectionFactory")).then(setCollection).catch(() => setCollection(undefined))
    })
  }, [])

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
            <DappSubMenu item={collection}/>
            <SubItemsExplore collection={collection}/>
          </div>
        </>}
      </div>
  )
}

export default CollectionView
