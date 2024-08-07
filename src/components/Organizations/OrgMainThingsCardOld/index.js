import React, { Fragment, useEffect, useState } from 'react'

import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import Upshots from '../Upshots/index.js'
import LogoRenderer from '../../Global/LogoRenderer'
import CircularProgress from '../../Global/OurCircularProgress'
import ActionAWeb3Button from '../../Global/ActionAWeb3Button'
import { Link } from 'react-router-dom'

import { fromDecimals, useWeb3, abi, useEthosContext, getNetworkElement, blockchainCall, numberToString, getEthereumPrice, formatNumber, formatMoney, formatMoneyUniV3, newContract, getTokenPriceInDollarsOnUniswapV3, web3Utils, sendAsync } from 'interfaces-core'

import style from '../../../all.module.css'
import { getDelegationsOfOrganization } from '../../../logic/delegation.js'
import { getRawField } from '../../../logic/generalReader.js'
import { decodePrestoOperations } from '../../../logic/covenants.js'
import { getAMMs, getAmmPoolLink } from '../../../logic/amm.js'
import Web3DependantList from '../../../components/Global/Web3DependantList'
import OrgThingsCardConnected from '../../../components/Organizations/OrgThingsCardConnected'

const RootWallet = ({ element }) => {

  const context = useEthosContext()

  const { web3, chainId } = useWeb3()

  const [value, setValue] = useState(null)

  useEffect(() => {
    setTimeout(async () => {
      var val = await sendAsync(web3, 'eth_getBalance', element.components.treasuryManager.address, 'latest')
      val = parseFloat(fromDecimals(val, 18, true))
      var ethereumPrice = formatNumber(await getEthereumPrice({ context }))
      val = ethereumPrice * val
      val = "$ " + formatMoney(val, 2)
      setValue(val)
    })
  }, [element])

  return (
    <div className={style.OrgMainThingsCardSL}>
      <div className={style.OrgThingsRegularTitle}>
        <h6>Root Wallet</h6>
      </div>
      <div className={style.OrgThingsInfoContent}>
        <b>Balance</b>
        {value === null && <CircularProgress />}
        {value !== null && <p><a target="_blank" href={`${getNetworkElement({ context, chainId }, 'etherscanURL')}/tokenholdings?a=${element.components.treasuryManager.address}`}>{value}</a></p>}
      </div>
    </div>)
}

const TreasurySplitter = ({ element }) => {


}


const BodyRootArea = ({ element }) => {

  const context = useEthosContext()

  const { web3, chainId } = useWeb3()

  const [valueData, setValueData] = useState(null)

  useEffect(() => {
    setTimeout(async () => {
      var val = await web3.eth.getBalance(element.components.treasuryManager.address)
      val = parseFloat(fromDecimals(val, 18, true))
      var ethereumPrice = formatNumber(await getEthereumPrice({ context }))
      val = ethereumPrice * val
      val = "$ " + formatMoney(val, 2)
      setValueData(val)
    })
  }, [element])



  const { block, account } = useWeb3()

  const [value, setValue] = useState(null)
  const [nextBlock, setNextBlock] = useState(null)

  useEffect(() => {
    setTimeout(async () => {
      var treasurySplitterManager = element.organizations[0].components.treasurySplitterManager
      var val = await sendAsync(web3, 'eth_getBalance', treasurySplitterManager.address, 'latest')
      val = parseFloat(fromDecimals(val, 18, true))
      var ethereumPrice = formatNumber(await getEthereumPrice({ context }))
      val = ethereumPrice * val
      val = "$ " + formatMoney(val, 2)
      setValue(val)
      setNextBlock(await blockchainCall(treasurySplitterManager.contract.methods.nextSplitBlock))
    })
  }, [element])

  async function executeSplit() {
    return blockchainCall(element.organizations[0].components.treasurySplitterManager.contract.methods.splitTreasury, account)
  }



  const { newContract } = useWeb3()

  const [oSDailyRate, setOSDailyRate] = useState(null)
  const [dividendsDailyRate, setDividendsDailyRate] = useState(null)

  const [osFarmingAddress, setOSFarmingAddress] = useState(null)
  const [dividendsFarmingAddress, setDividendsFarmingAddress] = useState(null)

  useEffect(() => {
    setTimeout(async () => {

      var osFarmingAddress = (await blockchainCall(element.organizations[0].components.oSFarming.contract.methods.data))[0]
      setOSFarmingAddress(osFarmingAddress)
      var osFarming = newContract(context.FarmMainRegularMinStakeABI, osFarmingAddress)
      var osFarmingDailyRate = await getDailyRateRaw(osFarming)
      setOSDailyRate(osFarmingDailyRate)

      var dividendsFarmingAddress = (await blockchainCall(element.organizations[0].components.dividendsFarming.contract.methods.data))[0]
      setDividendsFarmingAddress(dividendsFarmingAddress)
      var dividendsFarming = newContract(context.FarmMainRegularMinStakeABI, dividendsFarmingAddress)
      var dividendsFarmingDailyRate = await getDailyRateRaw(dividendsFarming)
      setDividendsDailyRate(dividendsFarmingDailyRate)

    })
  }, [])

  async function getDailyRateRaw(contract) {
    try {
      var setup = await blockchainCall(contract.methods.setups)
      setup = setup[setup.length - 1]
      return formatMoneyUniV3(fromDecimals(parseInt(setup.rewardPerBlock) * 6400, 18, true), 4)
    } catch (e) {
      return "0"
    }
  }




  return (
    <>
      <div className={style.OrganizationOveriewArea}>
        <div style={{ width: 'min-content' }}>
          <div className={style.OrgPartViewF} style={{ width: 'auto', textAlign: 'left', marginTop: '0px', }}>
            <Link to={`/covenants/farming/${dividendsFarmingAddress}`} className={style.OrgPartFarm} style={{ marginTop: '0px', marginBottom: '10px' }}>
              <a>
                <img src={`${process.env.PUBLIC_URL}/img/eth_logo.png`} />
              </a>
              <p>
                <b>Dividends</b>
                <br />
                <span>Minimum to Stake: 5,000 OS</span>
                <br />
                {!dividendsDailyRate && <CircularProgress />}
                {dividendsDailyRate && <span>Daily reward rate: {dividendsDailyRate} ETH</span>}
              </p>
            </Link>
            <Link to={`/covenants/farming/${osFarmingAddress}`} className={style.OrgPartFarm}>
              <a>
                <img src={`${process.env.PUBLIC_URL}/img/tokentest/os.png`} />
              </a>
              <p>
                <b>Farm OS</b>
                <br />
                {!oSDailyRate && <CircularProgress />}
                {oSDailyRate && <span>Daily reward rate: {oSDailyRate} OS</span>}
              </p>
            </Link>
          </div>
        </div>
        <div className={style.OrganizationOverviewGroup}>
          <div >
            <div className={style.OrgThingsTitle}>
              <h6>Earnings Splitter</h6>
            </div>
            <div className={style.OrgThingsInfoContent}>
              <b>Current Period: </b>
              {value === null && <CircularProgress />}
              {value !== null && <a style={{ fontSize: '14px' }} target="_blank" href={`${getNetworkElement({ context, chainId }, 'etherscanURL')}/tokenholdings?a=${element.organizations[0].components.treasurySplitterManager.address}`}> {value}</a>}
            </div>
            <div className={style.OrgThingsInfoContent}>
              <b>Rebalance: </b> <span style={{ fontSize: '14px' }}>3 Months</span>
            </div>
            <div className={style.OrgThingsInfoContent}>
              <b>Next: </b>
              {nextBlock === null && <CircularProgress />}
              {nextBlock !== null && parseInt(block) < parseInt(nextBlock) && <a href={getNetworkElement({ context, chainId }, "etherscanURL") + "block/" + nextBlock} target="_blank" style={{ fontSize: '14px' }}> #{nextBlock}</a>}
              {nextBlock !== null && parseInt(block) >= parseInt(nextBlock) && <ActionAWeb3Button onClick={executeSplit}>Split Treasury</ActionAWeb3Button>}
            </div>
            <div className={style.OrgThingsTitle}>
              <h6>Distribution </h6>
            </div>
            <div className={style.OrgThingsInfoContent}>
              <b>Dividends: </b> <span style={{ fontSize: '14px' }}>27%</span>
            </div>
            <div className={style.OrgThingsInfoContent}>
              <b>Investments Fund: </b> <span style={{ fontSize: '14px' }}>25%</span>
            </div>
            <div className={style.OrgThingsInfoContent}>
              <b>Delegations Grants</b> <span style={{ fontSize: '14px' }}>40%</span>
            </div>
            <div className={style.OrgThingsInfoContent}>
              <b>Root Wallet</b> <span style={{ fontSize: '14px' }}>8%</span>
            </div>
          </div>
          <div >
            <div className={style.OrgThingsRegularTitle}>
              <h6>Root Wallet</h6>
            </div>
            <div className={style.OrgThingsInfoContent}>
              <b>Balance</b>
              {valueData === null && <CircularProgress />}
              {valueData !== null && <a target="_blank" style={{ fontSize: '14px' }} href={`${getNetworkElement({ context, chainId }, 'etherscanURL')}/tokenholdings?a=${element.components.treasuryManager.address}`}>{valueData}</a>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const Farmings = ({ element }) => {

  const context = useEthosContext()
  const { newContract } = useWeb3()

  const [oSDailyRate, setOSDailyRate] = useState(null)
  const [dividendsDailyRate, setDividendsDailyRate] = useState(null)

  const [osFarmingAddress, setOSFarmingAddress] = useState(null)
  const [dividendsFarmingAddress, setDividendsFarmingAddress] = useState(null)

  useEffect(() => {
    setTimeout(async () => {

      var osFarmingAddress = (await blockchainCall(element.organizations[0].components.oSFarming.contract.methods.data))[0]
      setOSFarmingAddress(osFarmingAddress)
      var osFarming = newContract(context.FarmMainRegularMinStakeABI, osFarmingAddress)
      var osFarmingDailyRate = await getDailyRateRaw(osFarming)
      setOSDailyRate(osFarmingDailyRate)

      var dividendsFarmingAddress = (await blockchainCall(element.organizations[0].components.dividendsFarming.contract.methods.data))[0]
      setDividendsFarmingAddress(dividendsFarmingAddress)
      var dividendsFarming = newContract(context.FarmMainRegularMinStakeABI, dividendsFarmingAddress)
      var dividendsFarmingDailyRate = await getDailyRateRaw(dividendsFarming)
      setDividendsDailyRate(dividendsFarmingDailyRate)

    })
  }, [])

  async function getDailyRateRaw(contract) {
    try {
      var setup = await blockchainCall(contract.methods.setups)
      setup = setup[setup.length - 1]
      return formatMoneyUniV3(fromDecimals(parseInt(setup.rewardPerBlock) * 6400, 18, true), 4)
    } catch (e) {
      return "0"
    }
  }

  return (<div className={style.OrgPartViewF}>
    <Link to={`/covenants/farming/${dividendsFarmingAddress}`} className={style.OrgPartFarm}>
      <a>
        <img src={`${process.env.PUBLIC_URL}/img/eth_logo.png`} />
      </a>
      <p>
        <b>Dividends</b>
        <br />
        <span>Minimum to Stake: 5,000 OS</span>
        <br />
        {!dividendsDailyRate && <CircularProgress />}
        {dividendsDailyRate && <span>Daily reward rate: {dividendsDailyRate} ETH</span>}
      </p>
    </Link>
    <Link to={`/covenants/farming/${osFarmingAddress}`} className={style.OrgPartFarm}>
      <a>
        <img src={`${process.env.PUBLIC_URL}/img/tokentest/os.png`} />
      </a>
      <p>
        <b>Farm OS</b>
        <br />
        {!oSDailyRate && <CircularProgress />}
        {oSDailyRate && <span>Daily reward rate: {oSDailyRate} OS</span>}
      </p>
    </Link>
  </div>)
}

const Investments = ({ element }) => {

  const context = useEthosContext()

  const web3Data = useWeb3()
  const { web3, newContract, chainId } = web3Data

  const [open, setOpen] = useState(false)

  const [singleSwapFromETHValue, setSingleSwapFromETHValue] = useState(null)

  const [value, setValue] = useState(null)

  const [tokensFromETH, setTokensFromETH] = useState(null)
  const [tokensFromETHToBurn, setTokensFromETHToBurn] = useState(null)
  const [tokensFromETHAMMs, setTokensFromETHAMMs] = useState()
  const [tokensFromETHAMMPoolLinks, setTokensFromETHAMMPoolLinks] = useState()
  const [tokensToETH, setTokensToETH] = useState(null)
  const [tokensToETHAMMs, setTokensToETHAMMs] = useState()
  const [tokensToETHAMMPoolLinks, setTokensToETHAMMPoolLinks] = useState()
  const [totalValue, setTotalValue] = useState(null)

  const [swapFromETHBlock, setSwapFromETHBlock] = useState(null)
  const [swapToETHBlock, setSwapToETHBlock] = useState(null)

  async function calculateNextBuy() {
    var ethereumPrice = formatNumber(await getEthereumPrice({ context }))
    var val = await sendAsync(web3, 'eth_getBalance', element.organizations[0].components.treasurySplitterManager.address, 'latest')
    val = parseFloat(fromDecimals(val, 18, true))

    setSingleSwapFromETHValue(formatMoney(val / 5, 2))

    val = val * 0.25
    val = ethereumPrice * val

    setValue("$ " + formatMoney(val, 2))
  }

  async function getTokens() {
    setTokensFromETHAMMs()
    setTokensToETHAMMs()
    const amms = await getAMMs({ context, ...web3Data })
    var fromETH = await getRawField({ provider: web3.currentProvider }, element.organizations[0].components.investmentsManager.address, 'tokensFromETH')
    var tokensFromETHToBurn = []
    try {
      fromETH = decodePrestoOperations(fromETH)
      setTokensFromETHAMMPoolLinks(fromETH.map(it => it.liquidityPoolAddresses[0]))
      var tokenAMMS = fromETH.map(it => amms.filter(amm => web3Utils.toChecksumAddress(amm.address) === web3Utils.toChecksumAddress(it.ammPlugin))[0])
      setTokensFromETHAMMs(tokenAMMS)
      tokensFromETHToBurn = fromETH.map(it => it.receivers.length === 0)
      fromETH = fromETH.map(it => it.swapPath[it.swapPath.length - 1])
    } catch (e) {
      fromETH = abi.decode(["address[]"], fromETH)[0].map(web3Utils.toChecksumAddress)
      var tokenFromETHToBurn = await getRawField({ provider: web3.currentProvider }, element.organizations[0].components.investmentsManager.address, 'tokenFromETHToBurn')
      tokenFromETHToBurn = web3Utils.toChecksumAddress(abi.decode(["address"], tokenFromETHToBurn)[0])
      fromETH.push(tokenFromETHToBurn)
      tokensFromETHToBurn = fromETH.map(it => it === tokenFromETHToBurn)
    }
    setTokensFromETHToBurn(tokensFromETHToBurn)
    fromETH = fromETH.map(web3Utils.toChecksumAddress).map(it => it === web3Utils.toChecksumAddress("0x6100dd79fcaa88420750dcee3f735d168abcb771") ? '/img/tokentest/os.png' : it)
    setTokensFromETH(fromETH)
    var data = await getRawField({ provider: web3.currentProvider }, element.organizations[0].components.investmentsManager.address, 'tokensToETH')
    try {
      data = decodePrestoOperations(data)
      setTokensToETHAMMPoolLinks(data.map(it => it.liquidityPoolAddresses[0]))
      var tokenAMMS = data.map(it => amms.filter(amm => web3Utils.toChecksumAddress(amm.address) === web3Utils.toChecksumAddress(it.ammPlugin))[0])
      setTokensToETHAMMs(tokenAMMS)
      data = {
        addresses: data.map(it => it.inputTokenAddress),
        percentages: data.map(it => it.inputTokenAmount)
      }
    } catch (e) {
      data = abi.decode(["address[]", "uint256[]"], data)
      data = {
        addresses: data[0],
        percentages: data[1].map(it => it.toString())
      }
    }
    setTokensToETH(data.addresses)

    var balances = await Promise.all(data.addresses.map(it => blockchainCall(newContract(context.IERC20ABI, it).methods.balanceOf, element.organizations[0].components.investmentsManager.address)))
    var decimals = await Promise.all(data.addresses.map(it => blockchainCall(newContract(context.IERC20ABI, it).methods.decimals)))
    var dollars = await Promise.all(data.addresses.map((it, i) => getTokenPriceInDollarsOnUniswapV3({ context, newContract, chainId }, it, decimals[i])))
    balances = balances.map((it, i) => parseFloat(fromDecimals(it, decimals[i], true)))
    balances = balances.map((it, i) => it * dollars[i])
    var amount = balances.reduce((acc, it) => acc + it, 0)
    amount = formatMoney(numberToString(amount), 2)
    setTotalValue(amount)

    setSwapFromETHBlock(await blockchainCall(element.organizations[0].components.treasurySplitterManager.contract.methods.nextSplitBlock))
    setSwapToETHBlock(await blockchainCall(element.organizations[0].components.investmentsManager.contract.methods.nextSwapToETHBlock))
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
          <ExtLinkButton text="Etherscan" href={`${getNetworkElement({ context, chainId }, 'etherscanURL')}/tokenholdings?a=${element.organizations[0].components.investmentsManager.address}`} />
        </div>
        <div className={style.OrgPartInfo}>
          <p>
            <b>Estimated Next buy </b>
            {!value && <CircularProgress />}
            {value && <span>{value}</span>}
          </p>
        </div>
        <div className={style.OrgPartInfo}>
          <p>
            <b>Fund Size </b>
            {!totalValue && <CircularProgress />}
            {totalValue && ("$ " + totalValue)}
          </p>
        </div>
        <div className={style.OrgPartInfoB}>
          <RegularButtonDuo onClick={() => setOpen(!open)}>{open ? "Close" : "Open"}</RegularButtonDuo>
        </div>
      </div>
      {open && <div className={style.OrgPartView} style={{paddingTop: '0px'}}>
        <div className={style.InvestmentsSection}>
        <h6 className={style.DelecationSectionGrantChart}>Investments Fund</h6>
          <div className={style.InvestmentsSectionBuySell}>
             
            {!tokensFromETH && <CircularProgress />}
            {tokensFromETH && <p>
              Estimated <b>{singleSwapFromETHValue}</b>
              <a><img src={`${process.env.PUBLIC_URL}/img/eth_logo.png`}></img></a> swap for
              {tokensFromETH.map((it, i) => <Fragment key={it}>
                <a>
                  <LogoRenderer noFigure input={it} />{tokensFromETHToBurn[i] && <span>&#128293;</span>}
                </a>
                {tokensFromETHAMMs && tokensFromETHAMMPoolLinks && <>
                  on
                  <a target="_blank" href={getAmmPoolLink({ context, ...web3Data }, tokensFromETHAMMs[i], tokensFromETHAMMPoolLinks[i])}>
                    <LogoRenderer noFigure input={tokensFromETHAMMs[i]} />
                  </a>
                </>}
              </Fragment>)}
            </p>}
            <p>Every 3 months</p>
            <ExtLinkButton text="Next" href={`${getNetworkElement({ context, chainId }, 'etherscanURL')}block/${swapFromETHBlock}`} />
          </div>
          <div className={style.InvestmentsSectionBuySell}>
            {!tokensToETH && <CircularProgress />}
            {tokensToETH && <p>
              <b>Swap:</b>
              {tokensToETH.map((it, i) => <Fragment key={it}>
                <a>
                  <LogoRenderer noFigure input={it} />
                </a>
                {tokensToETHAMMs && tokensToETHAMMPoolLinks && <>
                  on
                  <a target="_blank" href={getAmmPoolLink({ context, ...web3Data }, tokensToETHAMMs[i], tokensToETHAMMPoolLinks[i])}>
                    <LogoRenderer noFigure input={tokensToETHAMMs[i]} />
                  </a>
                </>}
              </Fragment>)}
              for <a><img src={`${process.env.PUBLIC_URL}/img/eth_logo.png`}></img></a>
            </p>}
            <p>Weekly</p>
            <ExtLinkButton text="Next" href={`${getNetworkElement({ context, chainId }, 'etherscanURL')}block/${swapToETHBlock}`} />
          </div>
        </div>
      </div>}</>)
}

const Delegations = ({ element }) => {
  const context = useEthosContext()

  const useWeb3Data = useWeb3()

  const { chainId, web3 } = useWeb3Data

  const [open, setOpen] = useState()

  const [list, setList] = useState()

  const [value, setValue] = useState()
  const [val, setVal] = useState()

  useEffect(() => {
    setTimeout(async function() {
        var ethereumPrice = formatNumber(await getEthereumPrice({context}))
        var val = await sendAsync(web3, 'eth_getBalance', element.organizations[0].components.treasurySplitterManager.address, 'latest')
        val = parseFloat(fromDecimals(val, 18, true))

      val = val * 0.4
      val = ethereumPrice * val
      setValue("$ " + formatMoney(val, 2))
      setVal(val)
    })
    setTimeout(async function () {
      setList(await getDelegationsOfOrganization({ ...useWeb3Data, context }, element))
    })
  }, [])

  var total = numberToString(1e18)

  return (<>
    <div className={style.OrgPartView}>
      <div className={style.OrgPartTitle}>
        <h6>Delegations grants</h6>
        <ExtLinkButton text="Etherscan" href={`${getNetworkElement({ context, chainId }, 'etherscanURL')}/tokenholdings?a=${element.components.delegationsManager.address}`} />
      </div>
      <div className={style.OrgPartInfo}>
        <p><b>Estimated Next grant</b>{!value ? <CircularProgress /> : value}</p>
      </div>
      <div className={style.OrgPartInfo}>
        <p><b>Active Delegations</b> {!list ? <CircularProgress /> : list.length}</p>
      </div>
      <div className={style.OrgPartInfoB}>
        <RegularButtonDuo onClick={() => setOpen(!open)}>{open ? "Close" : "Open"}</RegularButtonDuo>
      </div>

    </div>
    {open && <div className={style.OrgPartView + ' ' + style.displayBlock} >
    <h6 className={style.DelecationSectionGrantChart} style={{width: '100%'}}>Grant chart</h6>
      <div className={style.DelegationsSection + " " + style.OrgPartViewGrantChartWrapper}>
      
        {!list && <CircularProgress />}
        {list && list.length === 0 && <h4>No Delegations right now!</h4>}
        {list && list.length > 0 && list.map(it => <Link key={it.key} to={`/organizations/delegations/${it.delegationAddress}`}>
          <div className={style.DelegationsSectionOne}>
            <LogoRenderer input={it} />
            <Upshots title={it.name} total={total} value={it.percentage} />
            {false && val !== undefined && val !== null && val !== 0 && <span>{"$ " + formatMoney(val * (parseFloat(fromDecimals(it.percentage, 18, true))), 2)}</span>}
          </div>
        </Link>)}
      </div>
    </div>}</>)
}

const Inflation = ({ element }) => {
  const context = useEthosContext()

  const { chainId } = useWeb3()

  const [dailyMint, setDailyMint] = useState(null)
  const [annualInflationRate, setAnnualInflationRate] = useState(null)

  useEffect(() => {
    setTimeout(async () => {
      var dM = await blockchainCall(element.organizations[0].components.oSFixedInflationManager.contract.methods.lastInflationPerDay)
      setDailyMint(fromDecimals(dM, 18))

      var percentage = await blockchainCall(element.organizations[0].components.oSFixedInflationManager.contract.methods.lastTokenPercentage)
      percentage = fromDecimals(percentage, 16)
      setAnnualInflationRate(percentage + " %")
    })
  }, [])

  return (<div className={style.OrgPartView}>
    <div className={style.OrgPartTitle}>
      <h6>Ethereans (OS) Inflation</h6>
      <ExtLinkButton text="Etherscan" href={`${getNetworkElement({ context, chainId }, 'etherscanURL')}/tokenholdings?a=${element.organizations[0].components.oSFixedInflationManager.address}`} />
    </div>
    <div className={style.OrgPartInfo}>
      <p>
        <b>Annual Inflation Rate</b><br />
        {!annualInflationRate && <CircularProgress />}
        {annualInflationRate}
      </p>
    </div>
    <div className={style.OrgPartInfo}>
      <p><b>Routines</b><br></br>1</p>
    </div>
    <div className={style.OrgPartInfo}>
      <p>
        <b>Daily Mint</b><br />
        {dailyMint === null && <CircularProgress />}
        {dailyMint && <span>{dailyMint} OS</span>}
      </p>
    </div>
    <div className={style.OrgPartInfo}>
      <p><b>OS Farming</b><br></br>30%</p>
    </div>
    <div className={style.OrgPartInfo}>
      <p><b>Operations Treasury</b><br></br>25%</p>
    </div>
    <div className={style.OrgPartInfo}>
      <p><b>Public Treasury</b><br></br>45%</p>
    </div>
  </div>)
}

const GovernanceItems = ({ element }) => {
  return (
    <Web3DependantList
      Renderer={OrgThingsCardConnected}
      rendererIsContainer
      renderedProperties={{ element, title: 'Governance Items' }}
      provider={() => element.proposalsConfiguration.votingTokens}
    />
  )
}

export default ({ element }) => {
  return (<>


    <BodyRootArea element={element} />




    <Investments element={element} />
    <Delegations element={element} />
    <Inflation element={element} />
  </>)
  // <GovernanceItems element={element} /> <Farmings element={element} />
}
