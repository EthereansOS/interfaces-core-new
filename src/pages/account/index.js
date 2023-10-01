import React, { useState, useEffect } from 'react'
import { useWeb3, web3States, truncatedWord, useEthosContext, abi, web3Utils, sendAsync, blockchainCall, formatLink, getNetworkElement } from 'interfaces-core'
import { ethers } from 'ethers'
import { namehash } from '@ethersproject/hash'
import LogoRenderer from '../../components/Global/LogoRenderer'
import RegularModal from '../../components/Global/RegularModal'
import ConnectWidget from '../../components/Global/Connect/widget'
import ExploreItems from '../../components/Items/ExploreItems'
import DelegationsList from '../governances/dapp/delegations/index'
import makeBlockie from 'ethereum-blockies-base64'

import { hostedItems } from '../../logic/itemsV2'

import style from '../../all.module.css'

const Account = () => {
  const context = useEthosContext()

  const { chainId, account, connectors, errorMessage, connectionStatus, setConnector, web3, newContract, getGlobalContract } = useWeb3()

  const [ensData, setEnsData] = useState()

  const [ownedItemList, setOwnedItemList] = useState()
  const [hostedItemList, setHostedItemList] = useState()
  const [hostedDelegationList, setHostedDelegationList] = useState()
  const [ownedDecksList, setOwnedDecksList] = useState()

  useEffect(() => {
    setTimeout(async () => {
      const address = account
      if(ensData && ensData.account === account && ensData.chainId === chainId) {
        return
      }
      var name
      try {
        const ethersProvider = new ethers.providers.Web3Provider(web3.currentProvider)
        name = await ethersProvider.lookupAddress(address)
      } catch(e) {
        var index = e.message.split('\n')[0].indexOf('value="')
        if(index !== -1) {
          name = e.message.substring(index + 7)
          name = name.substring(0, name.indexOf("\""))
        }
      }
      name && setEnsData(oldValue => ({...oldValue, name, account, chainId}))
    })
  }, [account, chainId, ensData])


  function triggerConnect() {
    var location = window.location.href.toString();
    connectionStatus === web3States.NOT_CONNECTED && (window.location.href = (location.lastIndexOf('/') === location.length - 1 ? location.substring(0, location.length - 1) : location) + '');
    connectionStatus === web3States.CONNECTED && void(setTimeout(() => void(window.localStorage.removeItem("connector"), setConnector(null))));
  }

  const [connect, setConnect] = useState(false)

  useEffect(() => {
    setOwnedItemList()
    setHostedItemList()
    setHostedDelegationList()
    setOwnedDecksList()
  }, [account, chainId])

  if(connectionStatus !== web3States.CONNECTED) {
      return <>
        {(connect || window.localStorage.connector) && <RegularModal close={() => void(window.localStorage.removeItem('connector'), setConnect(false))}>
            <ConnectWidget
                title="Welcome Etherean"
                {...{connectionStatus, connectors, setConnector, errorMessage}}
            />
        </RegularModal>}
        <a onClick={() => setConnect(true)}>Connect</a>
      </>
  }

  const blockie = !ensData?.name ? makeBlockie(account) : undefined

  return (
      <div className={style.AccountAll}>
        <figure className={style.AccountAvatar}>
            <LogoRenderer noDotLink noFigure input={ensData?.name ? `//metadata.ens.domains/mainnet/avatar/${ensData?.name}` : blockie} defaultImage={blockie}/>
        </figure>
        <div className={style.AccountInfo}>
          <div className={style.AccountInfoL}>
            <h4 className={style.AccountName}>Name: {ensData?.name ? `${ensData.name}` : '-'}</h4>
            <h4 className={style.AccountName}><span>Address: <a href={`${getNetworkElement({context, chainId}, 'etherscanURL')}address/${account}`} target="_blank">{account}</a></span></h4>
          </div>
          <div className={style.AccountInfoR}>
            <a className={style.AccounDisconnect} onClick={triggerConnect}>Disconnect</a>
          </div>
        </div>
        {(!hostedDelegationList || hostedDelegationList.length > 0) && <div className={style.AccountSection}>
            <h4>Delegations Hosted</h4>
            <DelegationsList mine onList={setHostedDelegationList}/>
        </div>}
        {(!hostedItemList || hostedItemList.length > 0) && <div className={style.AccountSection}>
            <h4>Items Hosted</h4>
            <ExploreItems
              provider={() => hostedItems({context, chainId, web3, account, newContract, getGlobalContract})}
              discriminant={account}
              onResult={setHostedItemList}
            />
        </div>}
        {(!ownedItemList || ownedItemList.length > 0) && <div className={style.AccountSection}>
            <h4>Items Owned</h4>
            <ExploreItems allMine onResult={setOwnedItemList}/>
        </div>}
        {(!ownedDecksList || ownedDecksList.length > 0) && <div className={style.AccountSection}>
            <h4>Decks Owned</h4>
            <ExploreItems allMine wrappedOnly={'Deck'} onResult={setOwnedDecksList}/>
        </div>}
      </div>
  )
}

Account.pluginIndex = 40;
Account.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/account',
        Component: Account,
        exact: true,
        requireConnection: true,
        templateProps: {
          menuName: 'appMenu',
          isDapp: true,
        }
      })
    }

export default Account