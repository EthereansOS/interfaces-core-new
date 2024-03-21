import React, { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { useEthosContext, useWeb3, web3Utils, abi } from 'interfaces-core'
import CircularProgress from '../../../../components/Global/OurCircularProgress'
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
import { loadTokenFromAddress } from '../../../../logic/erc20'
import { getRawField } from '../../../../logic/generalReader'

const itemSubmenuVoices = [
  {
    id: 'collection',
    label: 'Collection',
  },
  {
    id: 'farming',
    label: 'Farming',
  },
]
const ItemView = () => {
  const { pathname } = useLocation()

  const context = useEthosContext()

  const seaport = useOpenSea()

  const web3Data = useWeb3()

  const [item, setItem] = useState(null)
  const [submenuSelection, setSubmenuSelection] = useState(
    itemSubmenuVoices[0].id
  )

  const refresh = useCallback(() => {
    setItem(null)
    var itemId = pathname.split('/')
    if (
      itemId[itemId.length - 1].toLowerCase().indexOf('0x') === -1 &&
      isNaN(parseInt(itemId[itemId.length - 1]))
    ) {
      setSubmenuSelection(itemId[itemId.length - 1])
      itemId = itemId[itemId.length - 2]
    } else {
      itemId = itemId[itemId.length - 1]
    }
    try {
      itemId =
        itemId.toLowerCase().indexOf('0x') === 0
          ? itemId
          : web3Utils.numberToHex(itemId)
      loadTokenFromAddress({ context, ...web3Data, seaport }, itemId).then(
        setItem
      )
    } catch (e) {}
  }, [pathname])

  useEffect(refresh, [pathname])

  /*useEffect(() => item && setTimeout(async () => {
        var name = await getRawField({ provider : web3Data.web3.currentProvider }, item.l2Address || item.address, 'name')
        name = abi.decode(['string'], name)[0].toString()
        var symbol = await getRawField({ provider : web3Data.web3.currentProvider }, item.l2Address || item.address, 'symbol')
        symbol = abi.decode(['string'], symbol)[0].toString()
        console.log({
            address : item.l2Address || item.address, name, symbol, uri : item.uri
        })
    }), [item])*/

  return (
    <div className={style.SingleContentPage}>
      {item === null && <CircularProgress />}
      {item === undefined && <h1>No item found. 👀 Wrong network? 👀 </h1>}
      {item && (
        <>
          <div className={style.CollectionLeft}>
            <ViewCover item={item} />
            {!item.l2Address && (
              <>
                <DappSubMenu
                  isSelected={(it) => it.id === submenuSelection}
                  voices={itemSubmenuVoices.map((it) => ({
                    ...it,
                    onClick: () =>
                      submenuSelection !== it.id && setSubmenuSelection(it.id),
                  }))}
                />
                {submenuSelection === itemSubmenuVoices[0].id && (
                  <SubCollectionExplore item={item} />
                )}
                {submenuSelection === itemSubmenuVoices[1].id && (
                  <ViewFarmings rewardTokenAddress={item.address} />
                )}
              </>
            )}
          </div>
          <div className={style.CollectionRight}>
            <ViewBasics item={item} />
            <ViewDescription item={item} />
            <ViewManageItem item={item} onRefresh={refresh} />
            <ViewProperties item={item} />
            <SubTrade
              item={{ ...item, address: item.l2Address || item.address }}
            />
            {!item.l2Address && (
              <>
                {item?.wrapper && (
                  <>
                    <div className={style.CollectionRightSubtitles}>
                      <h4>Wrap</h4>
                      <p>Lorem ipsum sim dolorem</p>
                    </div>
                    <div
                      className={
                        style.WrapUnwrapBox + ' ' + style.WrapDetailBox
                      }>
                      <Wrap item={item} />
                      <Unwrap item={item} wrapper={item.wrapper} />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

ItemView.menuVoice = {
  path: '/items/:id',
  exact: false,
}

export default ItemView
