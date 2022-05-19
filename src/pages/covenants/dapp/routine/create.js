import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from "react-router-dom"

import { rlphash } from 'ethereumjs-util'

import { getNetworkElement, abi, toDecimals, useEthosContext, useWeb3, web3Utils, isEthereumAddress, numberToString, formatNumber, fromDecimals, blockchainCall, VOID_ETHEREUM_ADDRESS, sendAsync, VOID_BYTES32 } from '@ethereansos/interfaces-core'

import CreateOrEditFixedInflationEntry from './CreateOrEditFixedInflationEntry'
import FixedInflationExtensionTemplateLocation from '../../../../logic/FixedInflationExtensionTemplateLocation.sol'
import OurCircularProgress from '../../../../components/Global/OurCircularProgress'
import ActionAWeb3Button from '../../../../components/Global/ActionAWeb3Button'
import ActionSequence from '../../../../components/Global/ActionSequence'
import { getRawField } from '../../../../logic/generalReader'

import { loadTokenFromAddress } from '../../../../logic/erc20'

import style from '../../../../all.module.css'

export default props => {

    const { address, onSuccess } = props

    const context = useEthosContext()

    const web3Data = useWeb3()
    const { chainId, newContract, account, web3, getGlobalContract } = web3Data

    const { pathname } = useLocation()

    const fixedInflationContractAddress = useMemo(() => {
        var paths = pathname.split('/')
        var fixedInflationContractAddress = address || paths[paths.length - 1]
        fixedInflationContractAddress = isEthereumAddress(fixedInflationContractAddress) ? fixedInflationContractAddress : undefined
        return fixedInflationContractAddress
    }, [address, pathname])

    const [actionSequence, setActionSequence] = useState()
    const [step, setStep] = useState(NaN)
    const [entry, setEntry] = useState(null)
    const [extensionType, setExtensionType] = useState("address")
    const [walletAddress, setWalletAddress] = useState("")
    const [payload, setPayload] = useState("")
    const [extensionAddress, setExtensionAddress] = useState("")
    const [fixedInflationAddress, setFixedInflationAddress] = useState("")
    const [recap, setRecap] = useState("")
    const [notFirstTime, setNotFirstTime] = useState(false)
    const [fixedInflationExtensionTemplateCode, setFixedInflationExtensionTemplateCode] = useState("")
    const [customExtensionData, setCustomExtensionData] = useState(null)

    useEffect(() => setTimeout(async function componentDidMount() {
        setFixedInflationExtensionTemplateCode(await (await fetch(FixedInflationExtensionTemplateLocation)).text())
        if (!entry && !fixedInflationContractAddress) {
            return setEntry({
                name: '',
                operations: []
            })
        }
        var fixedInflationContract = await newContract(context.NewFixedInflationABI, fixedInflationContractAddress)
        setExtensionAddress(await blockchainCall(fixedInflationContract.methods.host))
        var entry = await blockchainCall(fixedInflationContract.methods.entry)
        var clonedEntry = {...entry[0]}
        clonedEntry.lastBlock = elaborateStartBlock(clonedEntry, true)
        clonedEntry.callerRewardPercentage = numberToString(parseFloat(fromDecimals(clonedEntry.callerRewardPercentage, 18, true)) * 100)
        clonedEntry.operations = []
        const ethAddress = web3Utils.toChecksumAddress(getNetworkElement({ chainId, context }, "wethTokenAddress"))

        for (var operation of entry[1]) {
            var op = {}
            Object.entries(operation).forEach(it => op[it[0]] = it[1])

            op.inputTokenAddress = web3Utils.toChecksumAddress(op.inputTokenAddress)

            var inputTokenDecimals = '18'
            var inputTokenSymbol = 'ETH'
            if(op.inputTokenAddress !== VOID_ETHEREUM_ADDRESS && op.inputTokenAddress !== ethAddress) {
                try {
                    var inputTokenContract = newContract(context.IERC20ABI, op.inputTokenAddress)
                    inputTokenDecimals = await blockchainCall(inputTokenContract.methods.decimals)
                    inputTokenSymbol = abi.decode(["string"], await getRawField({provider : web3.currentProvider}, op.inputTokenAddress, 'symbol'))[0]
                } catch (e) {
                }
            }
            op.inputToken = { address: op.inputTokenAddress, symbol: inputTokenSymbol, decimals: inputTokenDecimals }
            op.actionType = op.ammPlugin === VOID_ETHEREUM_ADDRESS ? 'transfer' : 'swap'
            op.inputTokenMethod = op.inputTokenAmountIsByMint ? 'mint' : 'reserve'
            op.transferType = op.inputTokenAmountIsPercentage ? 'percentage' : 'amount'
            !op.inputTokenAmountIsPercentage && (op.amount = op.inputTokenAmount)
            op.inputTokenAmountIsPercentage && (op.percentage = numberToString(parseFloat(fromDecimals(op.inputTokenAmount, 18, true)) * 100))
            if (op.ammPlugin && op.ammPlugin !== VOID_ETHEREUM_ADDRESS) {
                const ammAggregator = await newContract(context.AMMAggregatorABI, getNetworkElement({ chainId, context }, "ammAggregatorAddress"))
                const ammContract = newContract(context.AMMABI, op.ammPlugin)
                try {
                    op.amm = {
                        contract: ammContract,
                        info: await blockchainCall(ammContract.methods.info),
                        data: await blockchainCall(ammContract.methods.data)
                    }
                } catch(e) {
                    op.amm = {
                        contract: ammContract,
                        info: ["UniV3", "1"],
                        data: [getNetworkElement({ chainId, context }, "wethTokenAddress")]
                    }
                }
                op.amm = { ...op.amm, ammAggregator, ammContract, ethAddress }
                op.pathTokens = []
                for (var i in op.liquidityPoolAddresses) {
                    var address = op.liquidityPoolAddresses[i]
                    const lpInfo = op.amm.info[0] !== 'UniV3' ? await blockchainCall(ammContract.methods.byLiquidityPool, address) : [undefined, undefined, [
                        abi.decode(["address"], await getRawField({provider : web3.currentProvider}, address, 'token0'))[0],
                        abi.decode(["address"], await getRawField({provider : web3.currentProvider}, address, 'token1'))[0]
                    ]]
                    const lpTokensAddresses = lpInfo[2]
                    const symbols = []
                    let outputTokenAddress = op.swapPath[i]
                    for (var z in lpTokensAddresses) {
                        const currentTokenAddress = lpTokensAddresses[z]
                        if (currentTokenAddress !== VOID_ETHEREUM_ADDRESS) {
                            const currentToken = await newContract(context.ERC20ABI, currentTokenAddress)
                            const currentTokenSymbol = await blockchainCall(currentToken.methods.symbol)
                            symbols.push(currentTokenSymbol)
                        }
                        ethAddress === currentTokenAddress && (symbols[symbols.length - 1] = `ETH`)
                        if(ethAddress === currentTokenAddress) {
                            op.enterInETH = ethAddress === op.inputTokenAddress
                            op.exitInETH = ethAddress !== op.inputTokenAddress
                        }
                    }
                    const pathTokenContract = await newContract(context.ERC20ABI, address)
                    const symbol = op.amm.info[0] !== 'UniV3' ? await blockchainCall(pathTokenContract.methods.symbol) : "UniV3"
                    const decimals = op.amm.info[0] !== 'UniV3' ? await blockchainCall(pathTokenContract.methods.decimals) : "18"
                    op.pathTokens.push({ symbol, address, decimals, output: null, outputTokenAddress, lpTokensAddresses, symbols })
                }
            }
            op.oldReceivers = op.receivers
            op.receivers = []
            var lastPercentage = 100
            for (i in op.oldReceivers) {
                var address = op.oldReceivers[i = parseInt(i)]
                var percentage = 0
                i !== op.oldReceivers.length - 1 && (percentage = numberToString(parseFloat(fromDecimals(op.receiversPercentages[i], 18, true)) * 100))
                lastPercentage -= percentage
                op.receivers.push({
                    address,
                    percentage: i !== op.oldReceivers.length - 1 ? percentage : lastPercentage
                })
            }
            clonedEntry.operations.push(op)
        }
        setEntry(clonedEntry)
    }), [])

    function onExtensionType(e) {
        setWalletAddress("")
        setCustomExtensionData(null)
        setExtensionType(e.currentTarget.value)
    }

    function creationComplete(newEntry) {
        setEntry(newEntry)
        setStep(0)
    }

    function deploy() {

        if(extensionType === 'address' && !isEthereumAddress(walletAddress)) {
            return
        }

        if(extensionType === 'fromSourceCode') {

        }

        if(extensionType !== 'address' && extensionType !== 'fromSourceCode' && (!isEthereumAddress(extensionAddress) || !payload)) {
            return
        }

        const sequence = []
        extensionType === 'address' && sequence.push({
            label : "Deploy Extension",
            async onTransactionReceipt(transactionReceipt, state) {
                var fixedInflationFactoryAddress = (await blockchainCall(getGlobalContract("factoryOfFactories").methods.get, getNetworkElement({ context, chainId }, "factoryIndices").fixedInflation)).factoryList
                fixedInflationFactoryAddress = fixedInflationFactoryAddress[fixedInflationFactoryAddress.length - 1]
                if(web3Utils.toChecksumAddress(transactionReceipt.to) !== web3Utils.toChecksumAddress(fixedInflationFactoryAddress)) {
                    throw "Wrong transaction"
                }
                var fixedInflationFactory = newContract(context.NewFactoryABI, fixedInflationFactoryAddress)
                var nonce = parseInt(await sendAsync(fixedInflationFactory.currentProvider, "eth_getTransactionCount", fixedInflationFactory.options.address, web3Utils.toHex(parseInt(transactionReceipt.blockNumber) - 1)))
                var extensionAddress = "0x" + rlphash([fixedInflationFactory.options.address, nonce]).toString('hex').substring(24)

                var payload = web3Utils.sha3("init(address)").substring(0, 10)
                payload += abi.encode(["address"], [state.walletAddress]).substring(2)

                return { extensionAddress, payload }
            },
            async onAction(state, element) {
                var fixedInflationFactoryAddress = (await blockchainCall(getGlobalContract("factoryOfFactories").methods.get, getNetworkElement({ context, chainId }, "factoryIndices").fixedInflation)).factoryList
                fixedInflationFactoryAddress = fixedInflationFactoryAddress[fixedInflationFactoryAddress.length - 1]
                var fixedInflationFactory = newContract(context.NewFactoryABI, fixedInflationFactoryAddress)
                var transaction = await blockchainCall(fixedInflationFactory.methods.cloneDefaultExtension)
                return await this.onTransactionReceipt(transaction, state, element)
            }
        })

        extensionType === 'fromSourceCode' && sequence.push({
            label : "Deploy Custom Extension",
            async onTransactionReceipt(transactionReceipt) {

            },
            async onAction(state, element) {

            }
        })

        sequence.push(...[{
            label : "Deploy Routine Contract",
            async onTransactionReceipt(transactionReceipt, state) {
                var fixedInflationAddress = abi.decode(["address"], transactionReceipt.logs.filter(it => it.topics[0] === web3Utils.sha3('Deployed(address,address,address,bytes)'))[0].topics[2])[0]
                return { fixedInflationAddress, elaboratedEntry : elaborateEntry(state.entry) }
            },
            async onAction(state, element) {
                var elaboratedEntry = elaborateEntry(state.entry)

                var data = "0x" + (newContract(context.FixedInflationABI).methods.init(
                    state.extensionAddress,
                    state.payload || "0x",
                    elaboratedEntry,
                    elaboratedEntry.operations
                ).encodeABI()).substring(11)

                var fixedInflationFactoryAddress = (await blockchainCall(getGlobalContract("factoryOfFactories").methods.get, getNetworkElement({ context, chainId }, "factoryIndices").fixedInflation)).factoryList
                fixedInflationFactoryAddress = fixedInflationFactoryAddress[fixedInflationFactoryAddress.length - 1]
                var fixedInflationFactory = newContract(context.NewFactoryABI, fixedInflationFactoryAddress)
                var transaction = await blockchainCall(fixedInflationFactory.methods.deploy, data)
                var receipt = await web3.eth.getTransactionReceipt(transaction.transactionHash)
                return await this.onTransactionReceipt(receipt, state, element)
            }
        }, {
            label : "Enable Extension",
            async onTransactionReceipt(transactionReceipt, state) {
                var extension = newContract(context.FixedInflationExtensionABI, state.extensionAddress)
                var data = extension.methods.setActive(true).encodeABI()
                var transaction = await web3.eth.getTransaction(transactionReceipt.transactionHash)
                if(transaction.input !== data) {
                    throw "Wrong Transaction"
                }
            },
            async onAction(state, element) {
                var extension = newContract(context.FixedInflationExtensionABI, state.extensionAddress)

                var transaction = await blockchainCall(extension.methods.setActive, true)

                return await this.onTransactionReceipt(transaction, state, element)
            }
        }])

        setActionSequence({
            initialState : {
                extensionAddress,
                payload,
                entry,
                walletAddress
            },
            sequence,
            onComplete(state) {
                setExtensionAddress(state.extensionAddress)
                setPayload(state.payload)
                setFixedInflationAddress(state.fixedInflationAddress)
                elaborateRecap(state.elaboratedEntry.blockInterval, state.elaboratedEntry.operations)
            }
        })
    }

    window.showSuccessMessage = function showSuccessMessage() {
        setExtensionAddress(VOID_ETHEREUM_ADDRESS)
        setPayload(VOID_BYTES32)
        setFixedInflationAddress(VOID_ETHEREUM_ADDRESS)
        elaborateRecap(6400, [])
    }

    var deployMethodologies = {
        async address() {
            var fixedInflationFactoryAddress = (await blockchainCall(getGlobalContract("factoryOfFactories").methods.get, getNetworkElement({ context, chainId }, "factoryIndices").fixedInflation)).factoryList
            fixedInflationFactoryAddress = fixedInflationFactoryAddress[fixedInflationFactoryAddress.length - 1]
            var fixedInflationFactory = newContract(context.NewFactoryABI, fixedInflationFactoryAddress)
            var transaction = await blockchainCall(fixedInflationFactory.methods.cloneDefaultExtension)
            var nonce = parseInt(await sendAsync(fixedInflationFactory.currentProvider, "eth_getTransactionCount", fixedInflationFactory.options.address, web3Utils.toHex(parseInt(transaction.blockNumber) - 1)))
            var fixedInflationExtensionAddress = "0x" + rlphash([fixedInflationFactory.options.address, nonce]).toString('hex').substring(24)
            console.log({fixedInflationExtensionAddress})
            setExtensionType("deployedContract")
            setExtensionAddress(fixedInflationExtensionAddress)

            var payload = web3Utils.sha3("init(address)").substring(0, 10)
            payload += abi.encode(["address"], [walletAddress]).substring(2)
            setPayload(payload)

            await deployMethodologies.deployedContract(fixedInflationExtensionAddress, payload)
        },
        async fromSourceCode() {
            var sendingOptions = { from: account }
            var method = newContract(customExtensionData.abi).deploy({ data: customExtensionData.bytecode })
            sendingOptions.gasLimit = await method.estimateGas(sendingOptions)
            sendingOptions.gas = sendingOptions.gasLimit
            var customFixedInflationExtension = await method.send(sendingOptions)
            setExtensionAddress(customFixedInflationExtension.options.address)
            await deployMethodologies.deployedContract(customFixedInflationExtension.options.address)
        },
        async deployedContract(preDeployedContract, builtPayload) {
            var elaboratedEntry = elaborateEntry(entry)

            var data = "0x" + (newContract(context.FixedInflationABI).methods.init(
                preDeployedContract || extensionAddress,
                builtPayload || payload || "0x",
                elaboratedEntry,
                elaboratedEntry.operations
            ).encodeABI()).substring(11)

            var fixedInflationFactoryAddress = (await blockchainCall(getGlobalContract("factoryOfFactories").methods.get, getNetworkElement({ context, chainId }, "factoryIndices").fixedInflation)).factoryList
            fixedInflationFactoryAddress = fixedInflationFactoryAddress[fixedInflationFactoryAddress.length - 1]
            var fixedInflationFactory = newContract(context.NewFactoryABI, fixedInflationFactoryAddress)
            var transaction = await blockchainCall(fixedInflationFactory.methods.deploy, data)
            var receipt = await web3.eth.getTransactionReceipt(transaction.transactionHash)
            var fixedInflationAddress = abi.decode(["address"], receipt.logs.filter(it => it.topics[0] === web3Utils.sha3('Deployed(address,address,address,bytes)'))[0].topics[2])[0]

            var extension = await newContract(context.FixedInflationExtensionABI, preDeployedContract || extensionAddress)

            transaction = await blockchainCall(extension.methods.setActive, true)

            elaborateRecap(elaboratedEntry.blockInterval, elaboratedEntry.operations)
            setFixedInflationAddress(fixedInflationAddress)
        }
    }

    async function elaborateRecap(blockInterval, operations) {
        var blockIntervalLabel
        try {
            blockIntervalLabel = Object.entries(context.blockIntervals).filter(it => formatNumber(it[1]) === formatNumber(blockInterval))[0][0]
        } catch (e) { }
        var finalRecap = {
            blockInterval: blockIntervalLabel || `${blockInterval} block${formatNumber(blockInterval)> 1 ? 's' : ''}`,
            transfers: 0,
            swaps: 0
        }
        for (var operation of operations) {
            var address = web3Utils.toChecksumAddress(operation.inputTokenAddress)
            var tokenData = finalRecap[address] = finalRecap[address] || await loadTokenFromAddress({ context, ...web3Data }, address)
            finalRecap.transfers += operation.ammPlugin === VOID_ETHEREUM_ADDRESS ? 1 : 0
            finalRecap.swaps += operation.ammPlugin !== VOID_ETHEREUM_ADDRESS ? 1 : 0
            var key = operation.inputTokenAmountIsByMint ? 'mint' : 'transfer'
            key += operation.inputTokenAmountIsPercentage ? 'Percentage' : 'Amount'
            var value = tokenData[key] || '0'
            value = value.ethereansosAdd(operation.inputTokenAmount)
            tokenData[key] = value
        }
        for (var key of Object.keys(finalRecap)) {
            var value = finalRecap[key]
            if (!value.contract) {
                continue
            }
            value.mintPercentage && (value.mintPercentage = formatNumber(fromDecimals(value.mintPercentage, 18, true)) * 100)
            value.transferPercentage && (value.transferPercentage = formatNumber(fromDecimals(value.transferPercentage, 18, true)) * 100)
            value.mintAmount && (value.mintAmount = fromDecimals(value.mintAmount, value.decimals, true))
            value.transferAmount && (value.transferAmount = fromDecimals(value.transferAmount, value.decimals, true))
        }
        setRecap(finalRecap)
    }

    function elaborateStartBlock(entry, add) {
        var lastBlock = parseInt(entry.lastBlock)
        var interval = parseInt(entry.blockInterval)
        if(!lastBlock || isNaN(lastBlock) || lastBlock <= interval) {
            return 0
        }
        return add ? lastBlock + interval : lastBlock - interval
    }

    function elaborateEntry(entry) {
        var elaboratedEntry = {
            id: web3Utils.sha3('0'),
            name: entry.name,
            lastBlock: elaborateStartBlock(entry),
            blockInterval: entry.blockInterval,
            callerRewardPercentage: toDecimals(numberToString((entry.callerRewardPercentage || 0) / 100), 18),
            operations: entry.operations.map(operation => {
                var receivers = operation.receivers.map(it => it.address)
                var receiversPercentages = operation.receivers.map(it => toDecimals(numberToString(it.percentage / 100), 18))
                receiversPercentages.pop()
                return {
                    inputTokenAddress: operation.enterInETH && operation.amm ? operation.amm.ethAddress : operation.inputToken.address,
                    inputTokenAmount: operation.transferType === 'percentage' ? toDecimals(numberToString(parseFloat(operation.percentage) / 100), "18") : operation.amount,
                    inputTokenAmountIsPercentage: operation.transferType === 'percentage',
                    inputTokenAmountIsByMint: operation.inputTokenMethod === 'mint',
                    ammPlugin: operation.amm ? operation.amm.ammContract.options.address : VOID_ETHEREUM_ADDRESS,
                    liquidityPoolAddresses: operation.pathTokens ? operation.pathTokens.map(it => it.address) : [],
                    swapPath: operation.pathTokens ? operation.pathTokens.map(it => it.outputTokenAddress) : [],
                    receivers: receivers,
                    receiversPercentages: receiversPercentages,
                    enterInETH: (operation.enterInETH && operation.amm !== undefined && operation.amm !== null) || false,
                    exitInETH: operation.exitInETH || false
                }
            })
        }
        console.log(JSON.stringify(elaboratedEntry))
        return elaboratedEntry
    }

    var steps = [
        [
            function () {
                return <>
                <div className={style.FancyExplanationCreate}>
                    <h6>Host</h6>
                    <p className={style.BreefRecapB}>The host is the wallet, contract, dApp or Organization with permissions to manage this Routine Contract. <a target="_blank" href="https://docs.ethos.wiki/covenants/">Technical Documentation</a>.</p>
                    <div className={style.proggressCreate}>
                        <div className={style.proggressCreatePerchLast} style={{width: "100%"}}>Step 5 of 5</div>
                    </div>
                </div>
                    <select className={style.CreationSelect}  value={extensionType} onChange={onExtensionType}>
                        <option value="">Host type</option>
                        <option value="address">Standard (Address, wallet)</option>
                        <option value="deployedContract">Custom (Deployed Contract)</option>
                        {false && <option value="fromSourceCode">Custom Extension (Deploy Contract)</option>}
                    </select>
                    {(extensionType === 'address' || extensionType === 'deployedContract') &&
                        <div>
                            {extensionType === 'address' &&
                             <div className={style.CreationPageLabelF}>
                                <h6>Host Address</h6>
                                <input  type="text" placeholder="Host address" defaultValue={walletAddress} onKeyUp={e => setWalletAddress(isEthereumAddress(e.currentTarget.value) ? e.currentTarget.value : "")}/>
                                <p>The address who has hosting permissions for this contract. The host can manage new setups and ending early existing setups.</p>
                            </div>}

                            {extensionType === 'deployedContract' &&
                            <>
                            <div className={style.CreationPageLabelF}>
                                <h6>Custom Extension Address</h6>
                                <input  type="text" placeholder="Insert extension address" defaultValue={extensionAddress} onKeyUp={e => setExtensionAddress(isEthereumAddress(e.currentTarget.value) ? e.currentTarget.value : "")}/>
                            </div>
                            <div className={style.CreationPageLabelF}>
                                <h6>[Optional] Extension payload</h6>
                                <input  placeholder="Optional init payload" type="text" defaultValue={payload} onKeyUp={e => setPayload(e.currentTarget.value)}/>
                            </div>
                            </> }
                        </div>
                    }
                    {/*extensionType === 'fromSourceCode' && <ContractEditor filterDeployedContract={filterDeployedContract} onContract={setCustomExtensionData} templateCode={fixedInflationExtensionTemplateCode}/>*/}

                </>
            },
            function () {
                return !(extensionType === 'address' ? walletAddress && walletAddress !== VOID_ETHEREUM_ADDRESS : extensionType === 'deployedContract' ? extensionAddress : customExtensionData)
            }]
    ]

    function filterDeployedContract(contractData) {
        var abi = contractData.abi
        if (abi.filter(abiEntry => abiEntry.type === 'constructor').length> 0) {
            return false
        }
        if (abi.filter(abiEntry => abiEntry.type === 'function' && abiEntry.stateMutability === 'view' && abiEntry.name === 'active' && abiEntry.outputs && abiEntry.outputs.length === 1 && abiEntry.outputs[0].type === 'bool').length === 0) {
            return false
        }
        if (abi.filter(abiEntry => abiEntry.type === 'function' && abiEntry.stateMutability !== 'view' && abiEntry.stateMutability !== 'pure' && abiEntry.name === 'deactivationByFailure' && (!abiEntry.outputs || abiEntry.outputs.length === 0) && (!abiEntry.inputs || abiEntry.inputs.length === 0)).length === 0) {
            return false
        }
        if (abi.filter(abiEntry => abiEntry.type === 'function' && abiEntry.stateMutability !== 'view' && abiEntry.stateMutability !== 'pure' && abiEntry.name === 'receiveTokens' && (!abiEntry.outputs || abiEntry.outputs.length === 0) && abiEntry.inputs && abiEntry.inputs.length === 3 && abiEntry.inputs[0].type === 'address[]' && abiEntry.inputs[1].type === 'uint256[]' && abiEntry.inputs[2].type === 'uint256[]').length === 0) {
            return false
        }
        if (abi.filter(abiEntry => abiEntry.type === 'function' && abiEntry.stateMutability !== 'view' && abiEntry.stateMutability !== 'pure' && abiEntry.name === 'setActive' && (!abiEntry.outputs || abiEntry.outputs.length === 0) && abiEntry.inputs && abiEntry.inputs.length === 1 && abiEntry.inputs[0].type === 'bool').length === 0) {
            return false
        }
        return true
    }

    function back() {
        var newStep = step === 0 ? NaN : step - 1
        setNotFirstTime(isNaN(newStep))
        setStep(newStep)
    }

    function copy(entry) {
        var copy = {
        }
        for (var key of Object.keys(entry)) {
            copy[key] = entry[key]
        }
        copy.operations = []
        for (var operation of entry.operations) {
            var operationCopy = {}
            Object.entries(operation).forEach(it => operationCopy[it[0]] = it[1])
            copy.operations.push(operationCopy)
        }
        return copy
    }

    function saveEntry(entryName, lastBlock, blockInterval, callerRewardPercentage, operations) {
        setEntry({
            name: entryName,
            lastBlock,
            blockInterval,
            callerRewardPercentage,
            operations
        })
        setStep(0)
    }

    async function editEntry() {
        var elaboratedEntry = elaborateEntry(entry)
        var fixedInflationExtension = newContract(context.FixedInflationExtensionABI, extensionAddress)
        await blockchainCall(fixedInflationExtension.methods.setEntry, elaboratedEntry, elaboratedEntry.operations)
        setFixedInflationAddress(fixedInflationContractAddress)
    }

    function renderEditEntry() {
        return <>
            <div>
                <div>
                    <h6>Edit Fixed Inflation Entry</h6>
                </div>
            </div>
            <div className={style.ActionBTNCreateX}>
                <a className={style.Web3BackBTN} onClick={back}>Back</a>
                <ActionAWeb3Button onSuccess={onSuccess} onClick={editEntry}>Deploy</ActionAWeb3Button>
            </div>
        </>
    }

    function copyToClipboard(address) {
        const value = `${address}`
        if(navigator.clipboard) {
            return navigator.clipboard.writeText(value)
        }
        const input = document.createElement('input')
        input.type = 'text'
        input.value = value
        document.body.appendChild(input)
        input.focus()
        input.select()
        input.setSelectionRange(0, 99999)
        try {
            document.execCommand('copy')
        } catch(e) {
            console.log(e)
        }
        document.body.removeChild(input)
    }

    function render() {
        return <div className={style.CreatePage}>
            {steps[step][0]()}
            <div className={style.ActionBTNCreateX}>
                <a className={style.Web3BackBTN} onClick={back}>Back</a>
                {step !== steps.length - 1 && <a className={style.RegularButton} disabled={steps[step][1]()} onClick={() => setStep(step + 1)}>Next</a>}
                {step === steps.length - 1 && <ActionAWeb3Button disabled={steps[step][1]()} onClick={deploy}>Deploy</ActionAWeb3Button>}
            </div>
        </div>
    }

    function success() {
        return <div className={style.CreatePage}>
            <h3>Routine Contract Deployed!🎉</h3>
            <div className={style.AndNowBox}>
                <h6>And Now?<br></br>👇</h6>
            </div>
            {/*If choosen by wallet*/}
            {extensionType == 'address' ? <>
            <div className={style.FancyExplanationCreate}>
                <p className={style.BreefRecapB}>Before attempting to execute the FI remember to send the amount of token needed to the FI extension address:</p>
                <a className={style.RegularButton} target="_blank" href={`${getNetworkElement({ chainId, context}, "etherscanURL")}/address/${extensionAddress}`}>{extensionAddress}</a><a onClick={()=>copyToClipboard(extensionAddress)} className={style.RegularButton}>Copy</a>
                <p className={style.BreefRecapB}>The first time the FI will fail the execution due to insufficient funds in the extension address, this contract will be automatically deactivated until editing from the host and reactivation manually.<br></br>For more info about hosting a Fixed Inflation contract: <a  target="_blank" href="https://docs.ethos.wiki/covenants/protocols/inflation">Documentation</a></p>
            </div>
                </> : <>
            <div className={style.FancyExplanationCreate}>
                {/*If not choosen by wallet (custom extension contract)*/}
                <p className={style.BreefRecapB}>Before attempting to execute the FI you first need to do do all of the actions needed to send the amount of token needed to the FI extension address:</p>
                <a className={style.RegularButton} target="_blank" href={`${getNetworkElement({ chainId, context}, "etherscanURL")}/address/${extensionAddress}`}>{extensionAddress}</a><a onClick={()=>copyToClipboard(extensionAddress)} className={style.RegularButton}>Copy</a>
                <p className={style.BreefRecapB}>If you rule the extension via a DFO or a DAO, be sure to vote to grant permissions from its Treasury.</p>
                <p className={style.BreefRecapB}>The first time the FI will fail the execution due to insufficient funds in the extension address, this contract will be automatically deactivated until editing from the host and reactivation manually.<br></br>For more info about hosting a Fixed Inflation contract: <a  target="_blank" href="https://docs.ethos.wiki/covenants/protocols/inflation">Documentation</a></p>
            </div>
            </>}
            <div className={style.FancyExplanationCreate}>
                <p className={style.BreefRecapB}>Fixed Inflation Contract Address: {fixedInflationAddress} <a target="_blank" href={`${getNetworkElement({ chainId, context}, "etherscanURL")}/address/${fixedInflationAddress}`}>(Etherscan)</a></p>
                <Link className={style.RegularButton} to={"/covenants/dapp/routines/" + fixedInflationAddress}>{process.env.PUBLIC_URL + "#/inflation/dapp/" + fixedInflationAddress}</Link>
            </div>
        </div>
    }

    return (
        <>
        {actionSequence && <ActionSequence {...{...actionSequence, onClose(){setActionSequence()}}}/>}
        {!entry ? <OurCircularProgress/> :
            fixedInflationAddress ? success() :
                isNaN(step) ? <CreateOrEditFixedInflationEntry entry={copy(entry)} continue={creationComplete} saveEntry={saveEntry} notFirstTime={notFirstTime}/> :
                    fixedInflationContractAddress ? renderEditEntry() :
                        render()}
        </>
    )
}