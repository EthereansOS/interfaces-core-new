import React, { useEffect, useState, useMemo } from 'react'

import { isEthereumAddress, useWeb3, useEthosContext, getNetworkElement, blockchainCall, VOID_ETHEREUM_ADDRESS, formatMoney, fromDecimals, web3Utils, abi, toDecimals, numberToString } from 'interfaces-core'

import { useLocation } from 'react-router-dom'

import ActionAWeb3Button from '../../../../components/Global/ActionAWeb3Button'

import OurCircularProgress from '../../../../components/Global/OurCircularProgress'

import { getRoutine } from '../../../../logic/routines'
import { loadTokenFromAddress } from '../../../../logic/erc20'

import LogoRenderer from '../../../../components/Global/LogoRenderer'
import { copyToClipboard, useOpenSea } from '../../../../logic/uiUtilities'

import RegularModal from '../../../../components/Global/RegularModal'
import Create from './create'

import style from '../../../../all.module.css'

const ViewRoutine = ({ loadedElement, onBack }) => {

    const context = useEthosContext()

    const seaport = useOpenSea()

    const web3Data = useWeb3()

    const { chainId, block, newContract, account, dualChainId, dualBlock } = web3Data

    const currentBlock = useMemo(() => dualBlock || block, [block, dualBlock])

    const { pathname } = useLocation()

    const [element, setElement] = useState(loadedElement)

    const [earnByInput, setEarnByInput] = useState()

    const [settings, setSettings] = useState()

    const [slippage, setSlippage] = useState(3)

    const [edit, setEdit] = useState()

    useEffect(() => {
        if(loadedElement) {
            return
        }
        setElement()
        var address = pathname.split('/')
        address = address[address.length - 1]
        address && isEthereumAddress(address) && getRoutine({ context, ...web3Data }, address).then(setElement)
    }, [pathname])

    useEffect(() => setTimeout(getContractMetadata), [element])

    async function getContractMetadata(force) {
        if(!element || (element.loaded && !force)) {
            return
        }
        try {
            const contract = element.contract
            var result = await blockchainCall(contract.methods.entry)
            var entry = { ...result[0] }
            var operations = result[1].map(it => ({...it}))
            for (var operation of operations) {
                if (operation.ammPlugin !== VOID_ETHEREUM_ADDRESS) {
                    const ammContract = newContract(context.AMMABI, operation.ammPlugin)
                    try {
                        operation.amm = {
                            contract: ammContract,
                            info: await blockchainCall(ammContract.methods.info),
                            data: await blockchainCall(ammContract.methods.data)
                        }
                    } catch(e) {
                        operation.amm = {
                            contract: ammContract,
                            info: ["UniV3", "1"],
                            data: [getNetworkElement({ chainId, context }, "wethTokenAddress")]
                        }
                    }
                }
                operation.inputToken = await loadTokenFromAddress({context, ...web3Data, seaport}, operation.inputTokenAddress === VOID_ETHEREUM_ADDRESS || (operation.amm && operation.enterInETH && web3Utils.toChecksumAddress(operation.inputTokenAddress) === web3Utils.toChecksumAddress(operation.amm.data[0])) ? VOID_ETHEREUM_ADDRESS : operation.inputTokenAddress)
                for (var swapTokenIndex in operation.swapPath) {
                    var swapToken = operation.swapPath[swapTokenIndex = parseInt(swapTokenIndex)]
                    var data
                    if (operation.amm && operation.exitInETH && swapTokenIndex === operation.swapPath.length - 1) {
                        data = await loadTokenFromAddress({context, ...web3Data, seaport}, web3Utils.toChecksumAddress(swapToken) === web3Utils.toChecksumAddress(operation.amm.data[0]) ? VOID_ETHEREUM_ADDRESS : swapToken)
                    } else {
                        data = await loadTokenFromAddress({context, ...web3Data, seaport}, swapToken)
                    }
                    (operation.swapTokens = operation.swapTokens || []).push(data)
                }
            }
            const period = Object.values(context.blockIntervals).filter(value => value === entry.blockInterval)
            const oneHundred = await contract.methods.ONE_HUNDRED().call()
            const executorReward = formatMoney(parseFloat(fromDecimals(entry.callerRewardPercentage, 18, true)) * 100)
            var blockNumber = parseInt(currentBlock)
            var nextBlock = parseInt(entry.lastBlock) + parseInt(entry.blockInterval)
            nextBlock = nextBlock <= parseInt(entry.blockInterval) ? 0 : nextBlock
            var extensionContract = newContract(context.FixedInflationExtensionABI, await contract.methods.host().call())
            var active = true
            try {
                active = await blockchainCall(extensionContract.methods.active)
            } catch (e) {
            }
            setElement(oldValue => ({
                ...oldValue,
                entry,
                period: period[0],
                executorReward,
                operations,
                executable: active && blockNumber >= nextBlock,
                active,
                contract,
                oneHundred,
                nextBlock,
                loaded : true
            }))
        } catch (e) {
            console.log(e)
        }
    }

    async function execute() {
        if(element.execute) {
            return await element.execute(account)
        }
        var minInputs = (await blockchainCall(element.contract.methods.entry))[1].map(() => 0)
        minInputs = await element.contract.methods.executeWithMinAmounts(earnByInput === true, minInputs).call()
        minInputs = minInputs[1].map(it => numberToString(parseInt(it) * parseFloat(100 - slippage) / 100).split('.')[0])
        var transactionResult = await blockchainCall(element.contract.methods.executeWithMinAmounts, earnByInput === true, minInputs)
        var Executed = abi.decode(["bool"], transactionResult.logs.filter(it => it.topics[0] === web3Utils.sha3('Executed(bool)'))[0].data)[0]
        if(!Executed) {
            throw "Operation not executed, extension has been deactivated"
        }
    }

    const children = <div className={style.RoutineContent}>
        {(!element || !element.loaded) && <OurCircularProgress/>}
        {element && element.loaded && <div className={style.RutineBox}>
            <div className={style.RutineTitle}>
                <div className={style.RutineBack}>
                    {onBack && <a className={style.BackButton} onClick={onBack}>X</a>}
                </div>
                <h2>{element.entry.name}</h2>
                <div>
                    {onBack && <a className={style.CopyBTN} onClick={() => copyToClipboard(`${window.location.href}/${element.address}`)}>Link</a>}
                    {element.host === account && <a className={style.RegularButtonDuo} onClick={() => setEdit(true)}>Edit</a>}
                    {element.host === account && !element.active && <ActionAWeb3Button className={style.RegularButtonDuo} onSuccess={() => getContractMetadata(true)} onClick={() => blockchainCall(element.extension.methods.setActive, true)}>Activate</ActionAWeb3Button>}
                </div>
            </div>
            <div className={style.OperationsBox}>
            {element.operations.map((operation, i) => {
                var amount = fromDecimals(operation.inputTokenAmount, operation.inputTokenAmountIsPercentage ? "18" : operation.inputToken.decimals, true)
                amount = !operation.inputTokenAmountIsPercentage ? amount : (parseFloat(amount) * 100)
                return <div className={style.RoutineOperation} key={i}>
                    <h6>Operation {(i + 1)}</h6>
                    <div className={style.RoutineOperationTB}>
                        {operation.ammPlugin !== VOID_ETHEREUM_ADDRESS &&
                            <a className={style.ExtLinkButton} target="_blank" href={`${getNetworkElement({ context, chainId }, "etherscanURL")}address/${operation.ammPlugin}`}>{operation.amm.info[0]}</a>
                        }
                        {operation.receivers.map((it, i) => {
                            var percentage = i === operation.receiversPercentages.length ? element.oneHundred : operation.receiversPercentages[i]
                            if (i === operation.receiversPercentages.length) {
                                for (var perc of operation.receiversPercentages) {
                                    percentage = percentage.ethereansosSub(perc)
                                }
                            }
                            return <a className={style.ExtLinkButton} key={it} target="_blank" href={`${getNetworkElement({ context, chainId }, "etherscanURL")}address/${it}`}>
                                {formatMoney(parseFloat(fromDecimals(percentage, 18, true)) * 100)}% Receiver
                            </a>
                        })}
                        <a className={style.ExtLinkButton} target="_blank" href={`${getNetworkElement({ context, chainId }, "etherscanURL")}address/${element.extensionAddress}`}>Sender</a>
                    </div>
                    <div className={style.RoutineOperationSchedule}>
                        <p>
                            <b>{operation.inputTokenAmountIsByMint ? "Mint " : "Transfer "}</b>
                            {formatMoney(amount) != '0' ? formatMoney(amount) : amount} {operation.inputTokenAmountIsPercentage ? "% of " : " "} {operation.inputToken.symbol} <LogoRenderer badge input={operation.inputToken} /> {operation.inputTokenAmountIsPercentage ? " Supply " : ""}
                            {operation.ammPlugin !== VOID_ETHEREUM_ADDRESS && <>
                                and <b>swap</b><span> {" > "} </span>
                                {operation.swapTokens.map((swapToken, i) => <>
                                    {swapToken.symbol}
                                    <LogoRenderer badge input={swapToken} />
                                    {i !== operation.swapTokens.length - 1 && " > "}
                                </>)}
                            </>}
                        </p>
                    </div>
                </div>
            })}
            </div>
            <div className={style.OperationsTrigger}>
                {element.executorReward !== 0 && <h5> {formatMoney(element.executorReward)}% execution reward</h5>}
                {element.executable && element.operations.filter(it => it.ammPlugin !== VOID_ETHEREUM_ADDRESS).length > 0 && <>
                    <select className={style.CreationSelect} value={earnByInput} onChange={e => setEarnByInput(e.currentTarget.value === 'true')}>
                        <option value="true">Input</option>
                        <option value="false">Output</option>
                    </select>
                    <div className={style.ActionInfoSection}>
                        <a className={style.ActionInfoSectionSettings} onClick={() => setSettings(!settings)}>
                            <figure>
                                <img src={`${process.env.PUBLIC_URL}/img/settings.svg`}></img>
                            </figure>
                        </a>
                    </div>
                    {settings && <div className={style.SettingFB}>
                        <div>
                            <label className={style.SettingBLabPerch}>
                                <p>Slippage: {slippage}%</p>
                                <input type="range" min="0" max="99" step="0.05" value={slippage} onChange={e => setSlippage(parseFloat(e.currentTarget.value))}/>
                            </label>
                        </div>
                    </div>}
                </>}
            </div>
            {element.nextBlock > 0 && <h5>Next Execution Block: <a href={`${getNetworkElement({ context, chainId : dualChainId || chainId }, "etherscanURL")}block/${element.nextBlock}`} target="_blank"><b>#{element.nextBlock}</b></a></h5>}
            {element.executable && <ActionAWeb3Button onSuccess={getContractMetadata} onClick={execute}>Execute</ActionAWeb3Button>}
        </div>}
    </div>

    return <>
        {edit && <RegularModal close={() => setEdit()}>
            <Create address={element.address} onSuccess={() => void(getContractMetadata(true), setEdit())}/>
        </RegularModal>}
        {onBack ? children : <div className={style.CovenantsMainBox}>
            {children}
        </div>}
    </>
}

ViewRoutine.menuVoice = {
    path : '/covenants/routines/:id',
    exact : false
}

export default ViewRoutine