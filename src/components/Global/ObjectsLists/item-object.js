import React, { useCallback, useMemo } from 'react'

import { useWeb3, useEthosContext, web3Utils } from 'interfaces-core'
import { loadItemsByFactories } from '../../../logic/itemsV2'
import { loadTokenFromAddress, loadTokens } from '../../../logic/erc20'

import ItemObjectElement from './element/item-object-element'
import Web3DependantList from '../Web3DependantList'
import { useOpenSea } from '../../../logic/uiUtilities'

export default ({
  onResult,
  provider,
  discriminant,
  allMine,
  forCollection,
  excluding,
  element = ItemObjectElement,
  wrappedOnly,
  renderedProperties,
  hardCabledList,
  searchText,
}) => {
  const context = useEthosContext()

  const web3Data = useWeb3()

  const { web3, account, getGlobalContract, newContract, chainId } = web3Data

  const seaport = useOpenSea()

  const sortOrder = function (a, b) {
    if (parseInt(a.totalSupply) > parseInt(b.totalSupply)) {
      return -1
    }
    if (parseInt(a.totalSupply) < parseInt(b.totalSupply)) {
      return 1
    }
    return 0
  }

  const tokenAddress = useMemo(() => {
    try {
      return web3Utils.toChecksumAddress(searchText)
    } catch (e) {}
  }, [searchText])

  const filter = useCallback(
    (it) =>
      !tokenAddress && searchText
        ? it.name?.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 ||
          it.symbol?.toLowerCase().indexOf(searchText.toLowerCase()) !== -1
        : it,
    [tokenAddress, searchText]
  )

  return (
    <Web3DependantList
      Renderer={element}
      renderedProperties={{ ...renderedProperties, wrappedOnly, allMine }}
      provider={() =>
        (tokenAddress
          ? loadTokenFromAddress(
              { context, ...web3Data, forceItem: true },
              tokenAddress
            )
          : provider
          ? provider()
          : hardCabledList
          ? loadTokens({
              context,
              chainId,
              web3,
              account,
              newContract,
              alsoETH: false,
              listName: hardCabledList,
            })
          : loadItemsByFactories(
              {
                seaport,
                context,
                ...web3Data,
                collectionData: forCollection,
                excluding,
                wrappedOnly,
                allMine,
              },
              getGlobalContract('itemProjectionFactory')
            )
        ).then(async (r) => {
          var itemsList = []

          if (r) {
            for (let i = 0; i < r.length; i++) {
              let it = r[i]
              var address = it.itemId
              try {
                address =
                  address.toLowerCase().indexOf('0x') === 0
                    ? address
                    : web3Utils.numberToHex(address)
                var itemProperties = await loadTokenFromAddress(
                  { context, ...web3Data, seaport },
                  address
                )
                if (itemProperties) {
                  it.name = itemProperties.name
                  it.symbol = itemProperties.symbol
                }
              } catch (e) {}

              itemsList.push(it)
            }
          }

          onResult && onResult(itemsList)
          return r
        })
      }
      searchText={tokenAddress ? '' : searchText}
      sortOrder={sortOrder}
      emptyMessage={
        tokenAddress ? `No Item found for address ${tokenAddress}` : ''
      }
      discriminant={
        discriminant || tokenAddress
          ? tokenAddress
          : allMine
          ? account
          : hardCabledList
      }
      filter={filter}
    />
  )
}
