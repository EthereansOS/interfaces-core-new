import React, { useState, useEffect } from 'react'

import { useLocation } from 'react-router'
import { useEthosContext, useWeb3 } from 'interfaces-core'
import CircularProgress from '../../../../components/Global/OurCircularProgress'
import { loadCollection } from '../../../../logic/itemsV2'

import DappSubMenu from '../../../../components/Global/DappSubMenu/'
import ViewCover from '../../../../components/Items/ViewCover/'
import ViewDescription from '../../../../components/Items/ViewDescription/'
import ViewInfoBox from '../../../../components/Items/ViewInfoBox/'
import SubItemsExplore from '../SubSections/sub-items-explore.js'
import ViewManageCollection from '../../../../components/Items/ViewManageCollection'

import style from '../../../../all.module.css'
import { useOpenSea } from '../../../../logic/uiUtilities'
import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'

const CollectionView = () => {
  const location = useLocation()
  const context = useEthosContext()
  const web3Data = useWeb3()
  const { chainId, account, getGlobalContract } = web3Data
  const [collection, setCollection] = useState(null)

  const seaport = useOpenSea()

  useEffect(() => {
    setTimeout(async () => {
      var collectionId = location.pathname.substring(
        location.pathname.lastIndexOf('/') + 1
      )
      setCollection(null)
      loadCollection(
        { seaport, context, ...web3Data, deep: true },
        collectionId,
        getGlobalContract('itemProjectionFactory')
      )
        .then(setCollection)
        .catch(() => setCollection(undefined))
    })
  }, [chainId, account])

  return (
    <div className={style.SingleContentPage}>
      <ScrollToTopOnMount />
      {collection === null && <CircularProgress />}
      {collection === undefined && (
        <h1>No collection found with provided Id. Maybe wrong network?</h1>
      )}
      {collection && (
        <>
          <div className={style.ItemsExploreMainTitleArea}>
            <h2>Item Details</h2>
            <p>Token Information</p>
          </div>
          <div className={style.CollectionLeft}>
            <ViewCover item={collection} />
            <ViewManageCollection item={collection} />
          </div>
          <div className={style.CollectionRight}>
            <ViewInfoBox collection={collection} />
            <div className={style.ViewDescriptionWrapper}>
              <ViewDescription item={collection} />
            </div>
          </div>
          <div className={style.ItemsExploreMainTitleArea}>
            <h2>More in this Collection</h2>
            <p>Discover other tokens in this collection</p>
          </div>
          <SubItemsExplore collection={collection} />
        </>
      )}
    </div>
  )
}

CollectionView.menuVoice = {
  path: '/items/collections/:id',
  exact: false,
}

export default CollectionView
