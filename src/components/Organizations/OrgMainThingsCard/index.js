import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react'

import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import Upshots from '../../Organizations/Upshots/index.js'
import LogoRenderer from '../../Global/LogoRenderer'
import CircularProgress from '../../Global/OurCircularProgress'
import ActionAWeb3Button from '../../Global/ActionAWeb3Button'
import { Link } from 'react-router-dom'
import kaitenABIs from './kaitenABIs'

import {
  VOID_ETHEREUM_ADDRESS,
  VOID_BYTES32,
  fromDecimals,
  useWeb3,
  abi,
  useEthosContext,
  getNetworkElement,
  blockchainCall,
  numberToString,
  getEthereumPrice,
  formatNumber,
  formatMoney,
  formatMoneyUniV3,
  newContract,
  getTokenPriceInDollarsOnUniswapV3,
  web3Utils,
  shortenWord,
  toDecimals,
  sendAsync
} from 'interfaces-core'

import style from '../../../all.module.css'
import { getDelegationsOfOrganization } from '../../../logic/delegation.js'
import { getRawField } from '../../../logic/generalReader.js'
import { decodePrestoOperations } from '../../../logic/covenants.js'
import { getAMMs, getAmmPoolLink } from '../../../logic/amm.js'
import OurCircularProgress from '../../Global/OurCircularProgress'
import sendBlockchainTransaction from 'interfaces-core/lib/web3/sendBlockchainTransaction.js'

const RootWallet = ({ element }) => {
  const context = useEthosContext()

  const { web3, chainId } = useWeb3()

  const [value, setValue] = useState(null)

  useEffect(() => {
    setTimeout(async () => {
      var val = await sendAsync(web3, 'eth_getBalance', 
        element.components.treasuryManager.address, 'latest'
      )
      val = parseFloat(fromDecimals(val, 18, true))
      var ethereumPrice = formatNumber(await getEthereumPrice({ context }))
      val = ethereumPrice * val
      val = '$ ' + formatMoney(val, 2)
      setValue(val)
    })
  }, [element])

  return (
    <div className={style.OrgMainThingsCardSL}>
       <div className={style.OrgThingsTitle}>
        <h6>Treasury Manager</h6>
      </div>
      <div className={style.OrgThingsInfoContent}>
        <b>Balance</b>
        {value === null && <CircularProgress />}
        {value !== null && (
          <p>
            <a
              target="_blank"
              href={`${getNetworkElement(
                { context, chainId },
                'etherscanURL'
              )}/tokenholdings?a=${element.components.treasuryManager.address
                }`}>
              {value}
            </a>
          </p>
        )}
      </div>
    </div>
  )
}

const TreasurySplitter = ({ element }) => {
  const context = useEthosContext()
  const { web3, chainId, block, account } = useWeb3()

  const [value, setValue] = useState(null)
  const [nextBlock, setNextBlock] = useState(null)
  const [enableSplitButton, setEnableSplitButton] = useState(false)

  const [receivers, setReceivers] = useState(null)

  const [splitInterval, setSplitInterval] = useState()

  const refreshNextSplit = useCallback(async () => {
    var treasurySplitterManager = element.components.treasurySplitterManager
    var next = await getRawField(
      { provider: web3.currentProvider },
      treasurySplitterManager.address,
      'nextSplitEvent'
    )
    next = abi.decode(['uint256'], next)[0].toString()
    next = parseInt(next)
    next = next * 1000
    setEnableSplitButton(new Date().getTime() > next)
    next = (next && new Date(next)) || new Date()
    next = next.toISOString()
    setNextBlock(next)
  }, [element])

  useEffect(() => {
    setTimeout(async () => {
      var treasurySplitterManager = element.components.treasurySplitterManager
      var val = await sendAsync(web3, 'eth_getBalance', treasurySplitterManager.address, 'latest')
      val = parseFloat(fromDecimals(val, 18, true))
      var ethereumPrice = formatNumber(await getEthereumPrice({ context }))
      val = ethereumPrice * val
      setValue('$ ' + formatMoney(val, 2))
      await refreshNextSplit()

      var receiversAndPercentages = await blockchainCall(
        treasurySplitterManager.contract.methods.receiversAndPercentages
      )

      var rec = receiversAndPercentages.keys.map((it, i) => ({
        key: it,
        address: receiversAndPercentages.addresses[i],
        percentage:
          i < receiversAndPercentages.percentages.length
            ? receiversAndPercentages.percentages[i]
            : '0',
      }))

      rec.length > 0 &&
        (rec[rec.length - 1].percentage = web3Utils
          .toBN(1e18)
          .sub(
            rec.reduce(
              (acc, it) => acc.add(web3Utils.toBN(it.percentage)),
              web3Utils.toBN('0')
            )
          )
          .toString())

      rec.forEach((it) => {
        it.value = formatMoney(
          parseFloat(fromDecimals(it.percentage, 16, true)) * val,
          2
        )
        it.percentage = fromDecimals(it.percentage, 16) + '%'
      })

      rec.forEach((it) => {
        if (it.key.indexOf('0x') === -1) {
          return
        }
        it.key = Object.entries(context.grimoire).filter(
          (grimoire) => grimoire[1] === it.key
        )[0][0]
        it.key = it.key.split('COMPONENT_KEY_').join('').split('_').join(' ')
      })
      setReceivers(rec)

      var interval = await getRawField(
        { provider: web3.currentProvider },
        treasurySplitterManager.address,
        'splitInterval'
      )
      interval = abi.decode(['uint256'], interval)[0].toString()
      interval = parseInt(interval)

      var label = Object.entries(context.timeIntervals).filter(
        (it) => it[1] === interval
      )[0]
      setSplitInterval(label ? label[0] : `${interval} seconds`)
    })
  }, [element])

  async function executeSplit() {
    return blockchainCall(
      element.components.treasurySplitterManager.contract.methods.splitTreasury,
      account
    )
  }

  return (
    <div className={style.OrgMainThingsCard + " " + style.OrgMainThingsCardFlex}>
      <div>
      <div className={style.OrgThingsTitle}>
        <h6>Treasury Splitter</h6>
      </div>
      <div className={style.OrgThingsInfoContent}>
        <b>Current Period</b>
        {value === null && <CircularProgress />}
        {value !== null && (
          <p>
            <a
              target="_blank"
              href={`${getNetworkElement(
                { context, chainId },
                'etherscanURL'
              )}/tokenholdings?a=${element.components.treasurySplitterManager.address
                }`}>
              {value}
            </a>
          </p>
        )}
      </div>
      <div className={style.OrgThingsInfoContent}>
        <b>Rebalance</b>
        {!splitInterval && <OurCircularProgress />}
        {splitInterval && <p>Every {splitInterval}</p>}
      </div>
      <div className={style.OrgThingsInfoContent}>
        <b>Next</b>
        {nextBlock === null && <CircularProgress />}
        {nextBlock && <p>{nextBlock}</p>}
        {enableSplitButton && <p ><ActionAWeb3Button onSuccess={refreshNextSplit} onClick={() => blockchainCall(element.components.treasurySplitterManager.contract.methods.splitTreasury, account)}>Split</ActionAWeb3Button></p>}
      </div>
      </div>
     
      {!receivers && <OurCircularProgress />}
      {receivers && receivers.length !== 0 && (
         <div>
        <>
          <div className={style.OrgThingsTitle}>
            <h6>Distribution</h6>
          </div>
          {receivers.map((it) => (
            <div key={it.key} className={style.OrgThingsInfoContent}>
              <a
                href={`${getNetworkElement(
                  { context, chainId },
                  'etherscanURL'
                )}/tokenholdings?a=${it.address}`}
                target="_blank">
                <b>{it.key}</b>
              </a>
              <p>
                {it.percentage} ({it.value} ETH)
              </p>
            </div>
          ))}
        </>
        </div>
      )}
    </div>
  )
}

const Investments = ({ element }) => {
  const context = useEthosContext()

  const web3Data = useWeb3()
  const { web3, newContract, chainId, account } = web3Data

  const [open, setOpen] = useState(false)

  const [singleSwapFromETHValue, setSingleSwapFromETHValue] = useState(null)

  const [value, setValue] = useState(null)

  const [buy, setBuy] = useState(false)

  const [tokensFromETH, setTokensFromETH] = useState(null)
  const [tokensFromETHToBurn, setTokensFromETHToBurn] = useState(null)
  const [tokensFromETHAMMs, setTokensFromETHAMMs] = useState()
  const [tokensFromETHAMMPoolLinks, setTokensFromETHAMMPoolLinks] = useState()
  const [tokensToETH, setTokensToETH] = useState(null)
  const [tokensToETHAMMs, setTokensToETHAMMs] = useState()
  const [tokensToETHAMMPoolLinks, setTokensToETHAMMPoolLinks] = useState()
  const [totalValue, setTotalValue] = useState(null)

  const [swapToETHInterval, setSwapToETHInterval] = useState(null)

  const calculateNextBuy = useCallback(async () => {
    var ethereumPrice = formatNumber(await getEthereumPrice({ context }))
    var val = await sendAsync(web3, 'eth_getBalance', 
      element.components.treasurySplitterManager.address, 'latest'
    )
    val = parseFloat(fromDecimals(val, 18, true))
    val = val * 0.25

    val = toDecimals(val, 18)

    var internalVal = await sendAsync(web3, 'eth_getBalance', 
      element.components.investmentsManager.address, 'latest'
    )

    val = web3Utils.toBN(val).add(web3Utils.toBN(internalVal)).toString()

    setBuy(internalVal != '0')

    val = parseFloat(fromDecimals(val, 18, true))

    setSingleSwapFromETHValue(formatMoney(val / 5, 8))

    val = ethereumPrice * val

    setValue('$ ' + formatMoney(val, 2))
  }, [element])

  const performBuyFromETH = useCallback(async () => {
    var amounts = tokensFromETH.map((_) => '1')

    amounts = await getRawField(
      web3,
      element.components.investmentsManager.address,
      'swapFromETH(uint256[],address)',
      amounts,
      account
    )

    amounts = abi.decode(['uint256[]', 'uint256'], amounts)

    amounts = amounts[0].map((it) => it.toString())
    amounts = amounts.map((it) =>
      web3Utils.toBN(parseInt(parseInt(it) * 0.9)).toString()
    )

    var data = web3Utils.sha3('swapFromETH(uint256[],address)').substring(0, 10)
    data += abi
      .encode(['uint256[]', 'address'], [amounts, account])
      .substring(2)
    await sendBlockchainTransaction(
      web3.currentProvider,
      account,
      element.components.investmentsManager.address,
      data
    )
  }, [tokensFromETH, element])

  async function getTokens() {
    setTokensFromETHAMMs()
    setTokensToETHAMMs()
    const amms = await getAMMs({ context, ...web3Data })
    var fromETH = await getRawField(
      { provider: web3.currentProvider },
      element.components.investmentsManager.address,
      'tokensFromETH'
    )
    var tokensFromETHToBurn = []
    try {
      fromETH = decodePrestoOperations(fromETH)
      setTokensFromETHAMMPoolLinks(
        fromETH.map((it) => it.liquidityPoolAddresses[0])
      )
      var tokenAMMS = fromETH.map(
        (it) =>
          amms.filter(
            (amm) =>
              web3Utils.toChecksumAddress(amm.address) ===
              web3Utils.toChecksumAddress(it.ammPlugin)
          )[0]
      )
      setTokensFromETHAMMs(tokenAMMS)
      tokensFromETHToBurn = fromETH.map((it) => it.receivers.length === 0)
      fromETH = fromETH.map((it) => it.swapPath[it.swapPath.length - 1])
    } catch (e) {
      fromETH = abi
        .decode(['address[]'], fromETH)[0]
        .map(web3Utils.toChecksumAddress)
      var tokenFromETHToBurn = await getRawField(
        { provider: web3.currentProvider },
        element.components.investmentsManager.address,
        'tokenFromETHToBurn'
      )
      tokenFromETHToBurn = web3Utils.toChecksumAddress(
        abi.decode(['address'], tokenFromETHToBurn)[0]
      )
      fromETH.push(tokenFromETHToBurn)
      tokensFromETHToBurn = fromETH.map((it) => it === tokenFromETHToBurn)
    }
    setTokensFromETHToBurn(tokensFromETHToBurn)
    setTokensFromETH(fromETH)
    var data = await getRawField(
      { provider: web3.currentProvider },
      element.components.investmentsManager.address,
      'tokensToETH'
    )
    try {
      data = decodePrestoOperations(data)
      setTokensToETHAMMPoolLinks(data.map((it) => it.liquidityPoolAddresses[0]))
      var tokenAMMS = data.map(
        (it) =>
          amms.filter(
            (amm) =>
              web3Utils.toChecksumAddress(amm.address) ===
              web3Utils.toChecksumAddress(it.ammPlugin)
          )[0]
      )
      setTokensToETHAMMs(tokenAMMS)
      data = {
        addresses: data.map((it) => it.inputTokenAddress),
        percentages: data.map((it) => it.inputTokenAmount),
      }
    } catch (e) {
      data = abi.decode(['address[]', 'uint256[]'], data)
      data = {
        addresses: data[0],
        percentages: data[1].map((it) => it.toString()),
      }
    }
    setTokensToETH(data.addresses)

    var balances = await Promise.all(
      data.addresses.map((it) =>
        blockchainCall(
          newContract(context.IERC20ABI, it).methods.balanceOf,
          element.components.investmentsManager.address
        )
      )
    )
    var decimals = await Promise.all(
      data.addresses.map((it) =>
        blockchainCall(newContract(context.IERC20ABI, it).methods.decimals)
      )
    )
    var dollars = await Promise.all(
      data.addresses.map((it, i) =>
        getTokenPriceInDollarsOnUniswapV3(
          { context, newContract, chainId },
          it,
          decimals[i]
        )
      )
    )
    balances = balances.map((it, i) =>
      parseFloat(fromDecimals(it, decimals[i], true))
    )
    balances = balances.map((it, i) => it * dollars[i])
    var amount = balances.reduce((acc, it) => acc + it, 0)
    amount = formatMoney(numberToString(amount), 2)
    setTotalValue(amount)

    var interval = await getRawField(
      { provider: web3.currentProvider },
      element.components.investmentsManager.address,
      'swapToETHInterval'
    )
    interval = abi.decode(['uint256'], interval)[0].toString()
    interval = parseInt(interval)

    var label = Object.entries(context.timeIntervals).filter(
      (it) => it[1] === interval
    )[0]
    setSwapToETHInterval(label ? label[0] : `${interval} seconds`)
  }

  useEffect(() => {
    setTimeout(async () => {
      calculateNextBuy()
      getTokens()
    })
  }, [open])

  return (
    <>
    <div className={style.OrgPartView}>
      <div className={style.OrgPartTitle}>
        <h6>Investments Fund</h6>
        <ExtLinkButton
          text="Etherscan"
          href={`${getNetworkElement(
            { context, chainId },
            'etherscanURL'
          )}/tokenholdings?a=${element.components.investmentsManager.address}`}
        />
      </div>
      <div className={style.OrgPartInfo}>
        <p>
          <b>Estimated Next buy</b>
          <br />
          {!value && <CircularProgress />}
          {value && <span>{value}</span>}
          {buy && (
            <p>
              <ActionAWeb3Button
                onClick={performBuyFromETH}
                onSuccess={calculateNextBuy}>
                Buy
              </ActionAWeb3Button>
            </p>
          )}
        </p>
      </div>
      <div className={style.OrgPartInfo}>
        <p>
          <b>Fund Size</b>
          <br />
          {!totalValue && <CircularProgress />}
          {totalValue && '$ ' + totalValue}
        </p>
      </div>
      <div className={style.OrgPartInfoB}>
        <RegularButtonDuo onClick={() => setOpen(!open)}>
          {open ? 'Close' : 'Open'}
        </RegularButtonDuo>
      </div>
      
    </div>
    
    </>
  )
}

const Delegations = ({ element }) => {
  const context = useEthosContext()

  const useWeb3Data = useWeb3()

  const { chainId, web3, account } = useWeb3Data

  const [open, setOpen] = useState()

  const [list, setList] = useState()

  const [value, setValue] = useState()
  const [val, setVal] = useState()
  const [canSplit, setCanSplit] = useState()

  const calculateNextSplitValue = useCallback(async () => {
    var ethereumPrice = formatNumber(await getEthereumPrice({ context }))
    var val = await sendAsync(web3, 'eth_getBalance', 
      element.components.treasurySplitterManager.address, 'latest'
    )
    val = parseFloat(fromDecimals(val, 18, true))
    val = val * 0.4

    val = toDecimals(val, 18)

    var internalVal = await sendAsync(web3, 'eth_getBalance', 
      element.components.delegationsManager.address, 'latest'
    )

    val = web3Utils.toBN(val).add(web3Utils.toBN(internalVal)).toString()

    setCanSplit(internalVal != '0')

    val = parseFloat(fromDecimals(val, 18, true))

    val = ethereumPrice * val

    setValue('$ ' + formatMoney(val, 2))
    setVal(val)
  }, [element])

  useEffect(() => {
    setTimeout(async function () {
      await calculateNextSplitValue()
    })
    setTimeout(async function () {
      setList(
        await getDelegationsOfOrganization({ ...useWeb3Data, context }, element)
      )
    })
  }, [])

  const split = useCallback(async () => {
    await blockchainCall(
      element.components.delegationsManager.contract.methods.split,
      account
    )
  }, [element])

  var total = numberToString(1e18)

  return (
    <>
    <div className={style.OrgPartView}>
      <div className={style.OrgPartTitle}>
        <h6>Delegations grants</h6>
        <ExtLinkButton
          text="Etherscan"
          href={`${getNetworkElement(
            { context, chainId },
            'etherscanURL'
          )}/tokenholdings?a=${element.components.delegationsManager.address}`}
        />
      </div>
      <div className={style.OrgPartInfo}>
        <p>
          <b>Estimated Next grant</b>
          <br></br>
          {!value ? <CircularProgress /> : value}
        </p>
        {canSplit && (
          <p>
            <ActionAWeb3Button
              onSuccess={calculateNextSplitValue}
              onClick={split}>
              Split
            </ActionAWeb3Button>
          </p>
        )}
      </div>
      <div className={style.OrgPartInfo}>
        <p>
          <b>Active Delegations</b>
          <br></br>
          {!list ? <CircularProgress /> : list.length}
        </p>
      </div>
      <div className={style.OrgPartInfoB}>
        <RegularButtonDuo onClick={() => setOpen(!open)}>
          {open ? 'Close' : 'Open'}
        </RegularButtonDuo>
      </div>
      
    </div>
    {open && (<div>
        <div className={style.DelegationsSection}>
          <h6>Grant chart</h6>
          {!list && <CircularProgress />}
          {list && list.length === 0 && <h4>No Delegations right now!</h4>}
          {list &&
            list.length > 0 &&
            list.map((it) => (
              <Link
                key={it.key}
                to={`/organizations/delegations/${it.delegationAddress}`}>
                <div className={style.DelegationsSectionOne}>
                  <LogoRenderer input={it} />
                  <Upshots
                    title={it.name}
                    total={total}
                    value={it.percentage}
                  />
                  {false && val !== undefined && val !== null && val !== 0 && (
                    <span>
                      {'$ ' +
                        formatMoney(
                          val *
                          parseFloat(fromDecimals(it.percentage, 18, true)),
                          2
                        )}
                    </span>
                  )}
                </div>
              </Link>
            ))}
        </div>
      
    </div>)}
    </>
  )
}

const Inflation = ({ element }) => {
  const context = useEthosContext()

  const { chainId, web3 } = useWeb3()

  const [dailyMint, setDailyMint] = useState(null)
  const [annualInflationRate, setAnnualInflationRate] = useState(null)

  const [rawList, setRawList] = useState()
  const [swappedList, setSwappedList] = useState()

  const [tokenMinterData, setTokenMinterData] = useState()

  useEffect(() => {
    setTimeout(async () => {
      var _tokenMinterData = await getRawField(
        web3,
        element.components.fixedInflationManager.address,
        'tokenInfo'
      )
      if (_tokenMinterData !== '0x') {
        _tokenMinterData = abi
          .decode(['address', 'address'], _tokenMinterData)[1]
          .toString()
        if (_tokenMinterData !== VOID_ETHEREUM_ADDRESS) {
          var owner = await getRawField(web3, _tokenMinterData, 'owner')
          owner = abi.decode(['address'], owner)[0].toString()
          var tokenOwnership = await getRawField(
            web3,
            _tokenMinterData,
            'tokenOwnership'
          )
          tokenOwnership = abi.decode(['address'], tokenOwnership)[0].toString()
          var deadline = await getRawField(web3, _tokenMinterData, 'deadline')
          deadline = abi.decode(['uint256'], deadline)[0].toString()
          deadline = new Date(parseInt(deadline) * 1000)
          deadline = deadline.toISOString()
          _tokenMinterData = {
            address: _tokenMinterData,
            owner,
            tokenOwnership,
            deadline,
          }
          setTokenMinterData(_tokenMinterData)
          console.log('tokenMinterData', _tokenMinterData)
        }
      }

      var percentage = await blockchainCall(
        element.components.fixedInflationManager.contract.methods
          .lastTokenPercentage
      )
      setAnnualInflationRate(fromDecimals(percentage, 16) + ' %')

      var dM = await blockchainCall(
        element.components.fixedInflationManager.contract.methods
          .lastDailyInflation
      )

      if (dM === '0') {
        var perc = parseFloat(fromDecimals(percentage, 18, true))
        var dailyInflation = await blockchainCall(
          element.votingToken.contract.methods.totalSupply
        )
        dailyInflation = parseFloat(
          fromDecimals(dailyInflation, element.votingToken.decimals, true)
        )
        dailyInflation = dailyInflation * perc
        dailyInflation = formatMoney(dailyInflation)
        setDailyMint(dailyInflation)
      } else {
        setDailyMint(fromDecimals(dM, element.votingToken.decimals))
      }

      var bootstrapFund = await blockchainCall(
        element.components.fixedInflationManager.contract.methods.bootstrapFund
      )

      var rawTokenComponents = await blockchainCall(
        element.components.fixedInflationManager.contract.methods
          .rawTokenComponents
      )

      var swappedTokenComponents = await blockchainCall(
        element.components.fixedInflationManager.contract.methods
          .swappedTokenComponents
      )

      var raw = []
      var swapped = []

      if (
        bootstrapFund.bootstrapFundWalletPercentage !== '0' &&
        (bootstrapFund.bootstrapFundWalletAddress !== VOID_ETHEREUM_ADDRESS ||
          bootstrapFund.defaultBootstrapFundComponentKey !== VOID_BYTES32)
      ) {
        ; (bootstrapFund.bootstrapFundIsRaw ? raw : swapped).push({
          key:
            bootstrapFund.bootstrapFundWalletAddress !== VOID_ETHEREUM_ADDRESS
              ? 'Bootstrap Fund'
              : bootstrapFund.defaultBootstrapFundComponentKey,
          address: bootstrapFund.bootstrapFundWalletAddress,
          percentage: bootstrapFund.bootstrapFundWalletPercentage,
        })
      }

      rawTokenComponents.componentKeys.forEach((it, i) =>
        raw.push({
          key: it,
          address: rawTokenComponents.components[i],
          percentage: rawTokenComponents.percentages[i],
        })
      )

      swappedTokenComponents.componentKeys.forEach((it, i) =>
        swapped.push({
          key: it,
          address: swappedTokenComponents.components[i],
          percentage:
            i < swappedTokenComponents.percentages.length
              ? swappedTokenComponents.percentages[i]
              : '0',
        })
      )

      swapped[swapped.length - 1].percentage = web3Utils
        .toBN(1e18)
        .sub(
          swapped.reduce(
            (acc, it) => acc.add(web3Utils.toBN(it.percentage)),
            web3Utils.toBN('0')
          )
        )
        .toString()

      raw.forEach(
        (it) => (it.percentage = fromDecimals(it.percentage, 16) + '%')
      )
      swapped.forEach(
        (it) => (it.percentage = fromDecimals(it.percentage, 16) + '%')
      )

      raw.forEach((it) => {
        if (it.key.indexOf('0x') === -1) {
          return
        }
        it.key = Object.entries(context.grimoire).filter(
          (grimoire) => grimoire[1] === it.key
        )[0][0]
        it.key = it.key.split('COMPONENT_KEY_').join('').split('_').join(' ')
      })

      swapped.forEach((it) => {
        if (it.key.indexOf('0x') === -1) {
          return
        }
        it.key = Object.entries(context.grimoire).filter(
          (grimoire) => grimoire[1] === it.key
        )[0][0]
        it.key = it.key.split('COMPONENT_KEY_').join('').split('_').join(' ')
      })

      setRawList(raw)
      setSwappedList(swapped)
    })
  }, [])

  return (
    <div className={style.OrgPartView}>
      <div className={style.OrgPartTitle}>
        <h6>
          {element.votingToken.name} ({element.votingToken.symbol}) Inflation
        </h6>
        <ExtLinkButton
          text="Etherscan"
          href={`${getNetworkElement(
            { context, chainId },
            'etherscanURL'
          )}/tokenholdings?a=${element.components.fixedInflationManager.address
            }`}
        />
      </div>
      {tokenMinterData && (
        <div className={style.OrgThingsTitle}>
          <h6>Token ownership status</h6>
          <div className={style.OrgPartInfo}>
            <p>
              <b>Ownership can be given back to</b>
              <br />
              <a
                target="_blank"
                href={`${getNetworkElement(
                  { context, chainId },
                  'etherscanURL'
                )}/address/${tokenMinterData.owner}`}>
                {shortenWord(
                  {
                    context,
                    charsAmount: 12,
                    shortenWordSuffix:
                      '...' + tokenMinterData.owner.substring(30),
                  },
                  tokenMinterData.owner
                )}
              </a>
            </p>
          </div>
          <div className={style.OrgPartInfo}>
            <p>
              <b>After</b>
              <br />
              {tokenMinterData.deadline}
            </p>
          </div>
          {tokenMinterData.address !== tokenMinterData.tokenOwnership && (
            <div className={style.OrgPartInfo}>
              <p>
                <b>WARNING</b>
                <br />
                To let FixedInflation work, token mint ownership must be
                assigned to the address
                <br />
                {tokenMinterData.address}
              </p>
            </div>
          )}
        </div>
      )}
      <div className={style.OrgPartInfo}>
        <p>
          <b>Annual Inflation Rate</b>
          <br />
          {!annualInflationRate && <CircularProgress />}
          {annualInflationRate}
        </p>
      </div>
      <div className={style.OrgPartInfo}>
        <p>
          <b>Routines</b>
          <br></br>1
        </p>
      </div>
      <div className={style.OrgPartInfo}>
        <p>
          <b>Daily Mint</b>
          <br />
          {dailyMint === null && <CircularProgress />}
          {dailyMint && (
            <span>
              {dailyMint} {element.votingToken.symbol}
            </span>
          )}
        </p>
      </div>
      {!rawList && <CircularProgress />}
      {rawList && rawList.length > 0 && (
        <>
          <div className={style.OrgThingsTitle}>
            <h6>Components that will receive minted Tokens</h6>
          </div>
          {rawList.map((it) => (
            <div key={it.key} className={style.OrgPartInfo}>
              <p>
                <a
                  href={`${getNetworkElement(
                    { context, chainId },
                    'etherscanURL'
                  )}/tokenholdings?a=${it.address}`}
                  target="_blank">
                  <b>{it.key}</b>
                </a>
                <br />
                {it.percentage}
              </p>
            </div>
          ))}
        </>
      )}
      {!swappedList && <CircularProgress />}
      {swappedList && swappedList.length > 0 && (
        <>
          <div className={style.OrgThingsTitle}>
            <h6>Components that will receive ETH</h6>
          </div>
          {swappedList.map((it) => (
            <div key={it.key} className={style.OrgPartInfo}>
              <p>
                <a
                  href={`${getNetworkElement(
                    { context, chainId },
                    'etherscanURL'
                  )}/tokenholdings?a=${it.address}`}
                  target="_blank">
                  <b>{it.key}</b>
                </a>
                <br />
                {it.percentage}
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

const KaitenTBI = ({ element }) => {

  const web3Data = useWeb3()

  const { web3, account, blockNumber } = web3Data

  const revenueShareContract = useMemo(() => new web3.eth.Contract(kaitenABIs.TreasuryBootstrapRevenueShareABI, "0x60510CAf94f3001651E3E83f5e0EBDD303758aAE"), [web3])

  const [vestingEnds, setVestingEnds] = useState(null)

  const [positionOf, setPositionOf] = useState(null)

  const [claimableReward, setClaimableReward] = useState('0')
  const [rewardPerEvent, setRewardPerEvent] = useState('0')
  const [nextRebalanceEvent, setNextRebalanceEvent] = useState('0')
  const [tvl, setTVL] = useState('0')

  const [liquidityPool, setLiquidityPool] = useState(['0', '0'])

  const vestingFinished = useMemo(() => vestingEnds && new Date().getTime() >= vestingEnds, [vestingEnds])

  const [slippage, setSlippage] = useState(0.03)

  useEffect(() => {
    setTimeout(async () => {
      var vestingEndsDate = await revenueShareContract.methods.vestingEnds().call()
      vestingEndsDate = parseInt(vestingEndsDate) * 1000
      setVestingEnds(vestingEndsDate)
    })
  }, [])

  const updateSituation = useCallback(async (reset) => {
    reset && setPositionOf(null)
    var position = await revenueShareContract.methods.positionOf(account).call()
    setPositionOf(position)
    console.log(position)

    if (position.positionLiquidity !== '0' && vestingFinished) {
      try {
        var claimedReward = await revenueShareContract.methods.claimRewardOf(account).call()
        claimedReward = claimedReward[0]
        setClaimableReward(claimedReward)
      } catch (e) { }
      try {
        var lp = await revenueShareContract.methods.redeemRevenueSharePositionForever(0, 0).call('latest', { from: account })
        setLiquidityPool(lp)
      } catch (e) { }
    }
  }, [account, vestingEnds, vestingFinished])

  useEffect(() => {
    updateSituation()
  }, [updateSituation, blockNumber])

  const redeemVestingResult = useCallback(async () => {
    if (!vestingFinished) {
      if (!confirm("Are you REALLY sure you want to redeem just 60% of your initial ETH? This action will burn your KAI tokens, forever lock your LP share, and FORFEIT all Revenue Share in ETH FOREVER.")) {
        return;
      }
    }
    return await blockchainCall(revenueShareContract.methods.redeemVestingResult);
  }, [vestingFinished, vestingEnds])

  const redeemLPForever = useCallback(async () => {
    if (!liquidityPool || !claimableReward || !positionOf) {
      return
    }
    var message = "Are you REALLY sure you want to redeem "
    if (positionOf.vestedAmount !== '0') {
      message += "your vested KAI tokens"
      if (claimableReward !== '0') {
        message += ', '
      } else {
        message += ' and '
      }
    }
    message += "your LP portion"
    if (claimableReward !== '0') {
      message += ' and all your claimable Revenue Share in ETH'
    }
    message += '? You will FORFEIT all future revenue share by proceeding and cannot enter again.'
    if (!confirm(message)) {
      return
    }
    var amount0 = parseFloat(fromDecimals(liquidityPool[0], 18, true))
    var slp = 100 - slippage
    amount0 = amount0 * slp
    amount0 = toDecimals(amount0, 18)
    var amount1 = parseFloat(fromDecimals(liquidityPool[1], 18, true))
    amount1 = amount1 * slp
    amount1 = toDecimals(amount1, 18)
    return await blockchainCall(revenueShareContract.methods.redeemRevenueSharePositionForever, amount0, amount1)
  }, [liquidityPool, claimableReward, positionOf, slippage])

  return (<div className={style.OrgMainThingsCard}>
    <div className={style.OrgThingsTitle}>
      <h6>The {element.votingToken.name} Treasury Bootstrap Initiative</h6>
    </div>
    <div className={style.OrgThingsTitle}>
      <h6>Vesting Period:</h6>
      <div className={style.OrgPartInfo}>
        <p>
          {!vestingEnds && <CircularProgress />}
          {vestingEnds && !vestingFinished && <h4>&#9200; ACTIVE</h4>}
          {vestingEnds && vestingFinished && <h4>&#128994; CONCLUDED</h4>}
          {vestingEnds && <>
            End Date: <span>{new Date(vestingEnds).toLocaleString()}</span>
          </>}
        </p>
      </div>
    </div>
    {!(vestingEnds && positionOf) && <OurCircularProgress />}
    {vestingEnds && positionOf && positionOf.positionLiquidity !== '0' && positionOf.ethAmount === '0' && <div className={style.OrgThingsTitle}>
      <h6>You've already redeemed your vested KAI tokens</h6>
    </div>}
    {vestingEnds && positionOf && positionOf.ethAmount !== '0' && <div className={style.OrgThingsTitle}>
      <h6>By redeeming now, you will obtain:</h6>
      <div className={style.OrgPartInfo} style={{ "width": "100%" }}>
        {!vestingFinished && <>
          <div>{fromDecimals(positionOf.ethAmount, 18, true)} ETH <b>ONLY</b> (60% of the ETH you've put in)</div>
          <div><b>And nothing more!</b> All your tokens will be <b>burned </b><span>&#128293;</span>, the LP amount assigned to you will be locked forever and the Revenue Share in ETH will be divided between the other participants and Kaiten's DAO treasury </div>
        </>}
        {vestingFinished && <>
          <div>{fromDecimals(positionOf.vestedAmount, 18, true)} KAI (20% of your initial balance)</div>
          <br />
          {claimableReward && claimableReward !== '0' && <div>{fromDecimals(claimableReward, 18, true)} ETH (your actual redeemable Revenue Share)</div>}
        </>}
        <ActionAWeb3Button onSuccess={updateSituation} onClick={redeemVestingResult}>Redeem {vestingFinished ? `my vested KAI Tokens${claimableReward && claimableReward !== '0' ? " and my claimable Revenue Share in ETH" : ""}` : "just 60% of my initial ETH, losing the rest"}</ActionAWeb3Button>
      </div>
    </div>}
    {vestingEnds && vestingFinished && positionOf && <div className={style.OrgThingsTitle}>
      <h6>Your position:</h6>
      {(claimableReward === null || liquidityPool === null) && <OurCircularProgress />}
      {claimableReward !== null && <div className={style.OrgPartInfo} style={{ "width": "100%" }}>
        {<span>Your Revenue Share: {fromDecimals(claimableReward, 18, true)} ETH</span>}
        {claimableReward !== '0' && <ActionAWeb3Button onSuccess={updateSituation} onClick={() => blockchainCall(revenueShareContract.methods.claimRewardOf, account)}>Claim current Revenue Share</ActionAWeb3Button>}
      </div>}
      {liquidityPool && <div className={style.OrgPartInfo} style={{ "width": "100%" }}>
        <span>Your Liquidity Pool position:</span>
        <br />
        {<span>{fromDecimals(liquidityPool[0], 18, true)} KAI</span>}
        <br />
        {<span>{fromDecimals(liquidityPool[1], 18, true)} ETH</span>}
        <div>
          <label>
            Price slippage: {slippage}%
            <input type="range" min="0.003" max="100" step="0.001" value={slippage} onChange={e => setSlippage(parseFloat(e.currentTarget.value))} />
          </label>
        </div>
        {(liquidityPool[0] !== '0' || liquidityPool[1] !== '0') && <ActionAWeb3Button onSuccess={updateSituation} onClick={redeemLPForever}>Claim {(positionOf.vestedAmount !== '0' ? "vested tokens" : "") + (((!claimableReward || claimableReward === '0') ? '' : (positionOf.vestedAmount !== '0' ? ', ' : "") + "current revenue share")) + (positionOf.vestedAmount !== '0' || (claimableReward && claimableReward !== '0') ? " and " : "")}LP share. THIS WILL FORFEIT ALL FUTURE REVENUE SHARE.</ActionAWeb3Button>}
      </div>}
    </div>}
  </div>)
}

export default ({ element }) => {
  return (
    <>
      <RootWallet element={element} />
      {web3Utils.toChecksumAddress(element.address) === "0x48B4e1493F132C49063Cea273D2a756f8D9a1759" && <KaitenTBI element={element}/>}
      {element.components.fixedInflationManager && (
        <Inflation element={element} />
      )}
      {element.components.treasurySplitterManager && (
        <TreasurySplitter element={element} />
      )}
      {element.components.investmentsManager && (
        <Investments element={element} />
      )}
      {element.components.delegationsManager && (
        <Delegations element={element} />
      )}
    </>
  )
}
