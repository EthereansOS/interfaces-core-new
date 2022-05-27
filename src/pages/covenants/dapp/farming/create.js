import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Link } from "react-router-dom"

import { rlphash } from 'ethereumjs-util'

import { abi, useEthosContext, toDecimals, useWeb3, web3Utils, isEthereumAddress, getNetworkElement, fromDecimals, numberToString, VOID_ETHEREUM_ADDRESS, formatNumber, blockchainCall, sendAsync, async } from '@ethereansos/interfaces-core'

import TokenInputRegular from '../../../../components/Global/TokenInputRegular'
import ActionAWeb3Button from '../../../../components/Global/ActionAWeb3Button'

import CreateOrEditFarmingSetups from './CreateOrEditFarmingSetups'
import OurCircularProgress from '../../../../components/Global/OurCircularProgress'
import ActionSequence from '../../../../components/Global/ActionSequence'

import { loadTokenFromAddress } from '../../../../logic/erc20'
import { getFarmingSetupInfo } from '../../../../logic/farming'

import style from '../../../../all.module.css'
import { getRawField } from '../../../../logic/generalReader'

export default props => {

    const { element, onEditSuccess } = props

    const context = useEthosContext()

    const web3Data = useWeb3()

    const { newContract, chainId, web3, account, getGlobalContract } = web3Data

    const { rewardTokenAddress } = useParams()

    const [actionSequence, setActionSequence] = useState()

    // booleans
    const [isDeploy, setIsDeploy] = useState(false)
    // reward token
    const [selectedRewardToken, setSelectedRewardToken] = useState()
    const [byMint, setByMint] = useState(false)
    // setups
    const [farmingSetups, setFarmingSetups] = useState([])
    // deploy data
    const [treasuryAddress, setTreasuryAddress] = useState(null)
    const [hostWalletAddress, setHostWalletAddress] = useState(null)
    const [hostDeployedContract, setHostDeployedContract] = useState(null)
    const [deployContract, setDeployContract] = useState(null)
    const [useDeployedContract, setUseDeployedContract] = useState(false)
    const [extensionPayload, setExtensionPayload] = useState("")
    const [selectedHost, setSelectedHost] = useState("")
    const [deployLoading, setDeployLoading] = useState(false)
    const [deployStep, setDeployStep] = useState()
    const [deployData, setDeployData] = useState(null)
    const [farmingExtensionTemplateCode, setFarmingExtensionTemplateCode] = useState("")

    const [hasTreasuryAddress, setHasTreasuryAddress] = useState(false)
    const [farmingContract, setFarmingContract] = useState("")
    const [totalRewardToSend, setTotalRewardToSend] = useState(0)
    const [cumulativeRewardToSend, setCumulativeRewardToSend] = useState(0)

    const [generation, setGeneration] = useState("")
    const [regularNFT, setRegularNFT] = useState(false)

    const genConversion = {
        gen1 : {
            setupInfoTypes : ["bool","uint256","uint256","uint256","uint256","uint256","uint256","address","address","address","address","bool","uint256","uint256","uint256"],
            initTypes : [
                "address",
                "bytes"
            ], async parseSetup(setup) {
                const ammAggregator = newContract(context.AMMAggregatorABI, getNetworkElement({ context, chainId }, 'ammAggregatorAddress'))
                const isFree = setup.free
                const result = await blockchainCall(ammAggregator.methods.findByLiquidityPool, setup.liquidityPoolToken.address)
                const { amm } = result
                var mainToken = isFree ? setup.liquidityPoolToken.tokens[0] : setup.mainToken
                var mainTokenAddress = mainToken.address
                const mainTokenDecimals = mainToken.decimals

                const parsedSetup = [
                    isFree,
                    parseInt(setup.blockDuration),
                    parseInt(setup.startBlock),
                    setup.rewardPerBlock,
                    setup.minStakeable,
                    !isFree ? numberToString(fromDecimals(numberToString(setup.maxStakeable)), mainTokenDecimals) : 0,
                    setup.renewTimes,
                    amm,
                    setup.liquidityPoolToken.address,
                    mainTokenAddress,
                    VOID_ETHEREUM_ADDRESS,
                    setup.involvingETH,
                    isFree ? 0 : fromDecimals(numberToString(parseFloat(setup.penaltyFee) / 100)),
                    0,
                    0
                ]
                return parsedSetup
            }, getInitArray(extensionAddress, extensionInitData, rewardTokenAddress, encodedSetups) {
                return [web3Utils.toChecksumAddress((extensionAddress ? extensionAddress : hostDeployedContract) || VOID_ETHEREUM_ADDRESS), abi.encode(["bytes", "address", "bytes"], [extensionPayload || extensionInitData || "0x", rewardTokenAddress, encodedSetups || "0x"])]
            }
        }, gen2 : {
            setupInfoTypes : ["uint256","uint256","uint256","uint256","uint256","address","address","bool","uint256","uint256","int24","int24"],
            initTypes :  [
                "address",
                "bytes",
                "address",
                "bytes",
            ], async parseSetup(setup) {
                const parsedSetup = [
                    parseInt(setup.blockDuration),
                    parseInt(setup.startBlock),
                    setup.rewardPerBlock,
                    setup.minStakeable,
                    setup.renewTimes,
                    setup.liquidityPoolToken.address,
                    setup.liquidityPoolToken.tokens[setup.mainTokenIndex].address,
                    setup.involvingETH,
                    0,
                    0,
                    setup.tickLower,
                    setup.tickUpper
                ]
                return parsedSetup
            }, getInitArray(extensionAddress, extensionInitData, rewardTokenAddress, encodedSetups) {
                return [web3Utils.toChecksumAddress(extensionAddress ? extensionAddress : hostDeployedContract), extensionPayload || extensionInitData || "0x", rewardTokenAddress, encodedSetups || "0x"]
            }
        }
    }

    window.showSuccessMessage = function showSuccessMessage(show, selectedHost, hasTreasuryAddress) {
        setDeployLoading(false)
        setTotalRewardToSend(show ? toDecimals("686868", 18) : 0)
        setCumulativeRewardToSend(show ? toDecimals("686868", 18) : 0)
        setSelectedRewardToken(show ? { address: VOID_ETHEREUM_ADDRESS, name: "Cavicchioli Coin", symbol: "CAVICCHIOLI", decimals: 18 } : null)
        setDeployData(show ? { extensionAddress: VOID_ETHEREUM_ADDRESS } : null)
        setFarmingContract(show ? VOID_ETHEREUM_ADDRESS : null)
        setSelectedHost(!show ? null : selectedHost || "wallet")
        setHasTreasuryAddress(show && hasTreasuryAddress)
        show && hasTreasuryAddress && setTreasuryAddress(VOID_ETHEREUM_ADDRESS)
    }

    useEffect(() => rewardTokenAddress && loadTokenFromAddress({ context, ...web3Data}, rewardTokenAddress).then(setSelectedRewardToken), [rewardTokenAddress])

    useEffect(() => setByMint(element?.byMint === true), [selectedRewardToken, element])

    useEffect(() => element && setTimeout(async function() {
        setFarmingSetups(await getFarmingSetupInfo({context, ...web3Data}, element))
        setSelectedRewardToken(element.rewardToken)
        setDeployStep(0)
        setGeneration(element.generation)
    }), [element])

    async function edit() {
        var setupConfigurations = farmingSetups.map(info => {
            if(info.editing === true && info.disable !== true && info.initialRewardPerBlock === (info.rewardPerBlock || info.originalRewardPerBlock) && info.initialRenewTimes === info.renewTimes) {
                return
            }
            if(info.disable === true) {
                info.rewardPerBlock = info.initialRewardPerBlock
                info.originalRewardPerBlock = info.initialRewardPerBlock
                info.renewTimes = info.initialRenewTimes
            }
            return {
                add : info.editing === true ? false : true,
                disable : info.disable === true,
                index : info.editing === true ? info.lastSetupIndex : 0,
                info : {
                    ...info,
                    originalRewardPerBlock : (info.rewardPerBlock || info.originalRewardPerBlock),
                    mainTokenAddress : info.mainTokenAddress || info.mainToken.address,
                    liquidityPoolTokenAddress : info.liquidityPoolTokenAddress || info.liquidityPoolToken.address,
                    setupsCount : 0,
                    lastSetupIndex : 0,
                    involvingETH : info.involvingETH === true
                }
            }
        }).filter(it => it)

        if(setupConfigurations.length === 0) {
            throw "Nothing to change"
        }

        return await blockchainCall(element.extensionContract.methods.setFarmingSetups, setupConfigurations)
    }

    const finishButton = !element ? undefined : <ActionAWeb3Button onSuccess={onEditSuccess} onClick={edit}>Deploy</ActionAWeb3Button>

    const addFarmingSetup = (setup) => {
        setFarmingSetups(farmingSetups.concat(setup))
    }

    const editFarmingSetup = (setup, index) => {
        const updatedSetups = farmingSetups.map((s, i) => {
            return i !== index ? s : setup
        })
        setFarmingSetups(updatedSetups)
    }

    const removeFarmingSetup = i => {
        var farmingSetup = farmingSetups[i]
        farmingSetup.disable = !farmingSetup.disable
        const updatedSetups = farmingSetup.editing ? [...farmingSetups] : farmingSetups.filter((_, index) => index !== i)
        setFarmingSetups(updatedSetups)
    }

    const initializeDeployData = async () => {
        setDeployLoading(true)
        try {
            const host = selectedHost !== "fromSourceCode" && web3Utils.toChecksumAddress(selectedHost === 'address' ? hostWalletAddress : hostDeployedContract)
            const hasExtension = (selectedHost === "deployedContract" && hostDeployedContract && !deployContract)
            const data = { setups: [], rewardTokenAddress: selectedRewardToken.address, byMint, deployContract, host, hasExtension, extensionInitData: extensionPayload || '', treasuryAddress }
            if(generation === 'gen1' && !hostDeployedContract && !deployContract) {
                data.extensionInitData = newContract(context.FarmExtensionGen1ABI).methods.init(byMint, host, treasuryAddress || VOID_ETHEREUM_ADDRESS).encodeABI()
            }
            console.log(farmingSetups)
            var calculatedTotalToSend = "0"
            var cumulativeTotalToSend = "0"
            for (var i in farmingSetups) {
                const setup = farmingSetups[i]
                var amountToSend = setup.rewardPerBlock.ethereansosMul(setup.blockDuration)
                calculatedTotalToSend = calculatedTotalToSend.ethereansosAdd(amountToSend)
                cumulativeTotalToSend = cumulativeTotalToSend.ethereansosAdd(amountToSend.ethereansosMul(formatNumber(setup.renewTimes || '0') === 0 ? 1 : setup.renewTimes))
                const parsedSetup = await genConversion[generation].parseSetup(setup)
                data.setups.push(parsedSetup)
            }
            console.log(data)
            setDeployData(data)
            setTotalRewardToSend(calculatedTotalToSend)
            setCumulativeRewardToSend(calculatedTotalToSend)
            return data
        } catch (error) {
            console.log(error)
            setDeployData(null)
        } finally {
            setDeployLoading(false)
        }
    }

    function createActionSequence(data) {

        async function getFactory(state) {
            const { generation } = state
            var factoryAddress = (await blockchainCall(getGlobalContract("factoryOfFactories").methods.get, getNetworkElement({ context, chainId }, "factoryIndices")[generation === 'gen1' ? 'farmingGen1' : 'farming'])).factoryList
            factoryAddress = factoryAddress[factoryAddress.length - 1]
            //factoryAddress = generation === 'gen2' ? factoryAddress : getNetworkElement({ context, chainId }, generation === 'gen2' ? regularNFT ? "farmGen2FactoryAddressRegular" : "farmGen2FactoryAddress" : "farmFactoryAddress")
            const farmFactory = newContract(context.NewFactoryABI, factoryAddress)
            return farmFactory
        }

        const sequence = [{
            label : `Deploy Farming Contract${generation === 'gen1' && !hostDeployedContract && !deployContract ? ' (cloning Default Extension)' : ''}`,
            async onTransactionReceipt(transactionReceipt, state) {

                const { deployData } = state
                const { extensionInitData } = deployData

                const farmFactory = await getFactory(state)
                if(web3Utils.toChecksumAddress(transactionReceipt.to) !== web3Utils.toChecksumAddress(farmFactory.options.address)) {
                    throw "Wrong transaction"
                }
                var farmMainContractAddress = web3.eth.abi.decodeParameter("address", transactionReceipt.logs.filter(it => it.topics[0] === web3.utils.sha3('Deployed(address,address,address,bytes)'))[0].topics[2])
                var retrievedExtensionAddress = await getRawField({ provider : web3Data.web3.currentProvider }, farmMainContractAddress, 'host')
                retrievedExtensionAddress = abi.decode(["address"], retrievedExtensionAddress)[0].toString()
                return { farmMainContractAddress, ...returnDeployData(state, retrievedExtensionAddress, extensionInitData) }
            },
            async onAction(state, element) {
                const { deployData, generation, hostDeployedContract, deployContract } = state
                var { setups, rewardTokenAddress, extensionAddress, extensionInitData, host, treasuryAddress } = deployData

                const farmFactory = await getFactory(state)

                const types = genConversion[generation].initTypes
                console.log(deployData)
                const encodedSetups = abi.encode([`tuple(${genConversion[generation].setupInfoTypes.join(',')})[]`], [setups])
                const params = genConversion[generation].getInitArray(extensionAddress, extensionInitData, rewardTokenAddress, encodedSetups)
                console.log(params)
                console.log(extensionInitData)
                console.log(extensionPayload)
                console.log(extensionAddress)
                var payload = (web3.eth.abi.encodeParameters(types, params))

                console.log(payload)
                const deployTransaction = await blockchainCall(farmFactory.methods.deploy, payload)
                return this.onTransactionReceipt(await web3.eth.getTransactionReceipt(deployTransaction.transactionHash), state, element)
            }
        }]

        function returnDeployData(state, extensionAddress, extensionInitData) {
            const deployData = {...state.deployData, extensionAddress, extensionInitData : extensionInitData || state.extensionInitData}
            return { deployData }
        }

        !hostDeployedContract && !deployContract && generation === 'gen2' && sequence.unshift({
            label : "Clone Default Extension",
            async onTransactionReceipt(transactionReceipt, state) {

                const { generation, deployData } = state
                const { host, treasuryAddress, byMint } = deployData

                const farmFactory = await getFactory(state)
                if(web3Utils.toChecksumAddress(transactionReceipt.to) !== web3Utils.toChecksumAddress(farmFactory.options.address)) {
                    throw "Wrong transaction"
                }
                var nonce = parseInt(await sendAsync(web3.currentProvider, "eth_getTransactionCount", farmFactory.options.address, web3Utils.toHex(parseInt(transactionReceipt.blockNumber) - 1)))
                var extensionAddress = "0x" + rlphash([farmFactory.options.address, nonce]).toString('hex').substring(24)
                const farmExtension = newContract(context[generation === 'gen2' ? "FarmExtensionGen2ABI" : "FarmExtensionGen1ABI"], extensionAddress)
                const extensionInitData = farmExtension.methods.init(byMint, host, treasuryAddress || VOID_ETHEREUM_ADDRESS).encodeABI()

                return returnDeployData(state, extensionAddress, extensionInitData)
            },
            async onAction(state, element) {
                const farmFactory = await getFactory(state)
                const transaction = await blockchainCall(farmFactory.methods.cloneDefaultExtension)

                return this.onTransactionReceipt(await web3.eth.getTransactionReceipt(transaction.transactionHash), state, element)
            }
        })

        !hostDeployedContract && deployContract && sequence.unshift({
            label : "Deploy Extension",
            async onTransactionReceipt(transactionReceipt, state) {
                if(!transactionReceipt.contractAddress) {
                    throw "Invalid transaction"
                }
                return returnDeployData(state, transactionReceipt.contractAddress)
            },
            async onAction(state, element) {
                const { deployContract } = state
                const { abi, bytecode } = deployContract
                const payloadData = { from: account }
                const deployMethod = newContract(abi).deploy({ data: bytecode })
                const gasLimit = await deployMethod.estimateGas(payloadData)
                const extension = await deployMethod.send({ ...payloadData, gasLimit, gas: gasLimit })
                return returnDeployData(state, extension.options.address)
            }
        })

        setActionSequence({
            initialState : {
                deployData : data,
                regularNFT,
                generation,
                deployContract,
                hostDeployedContract
            },
            sequence,
            onComplete(state) {
                const { deployData, farmMainContractAddress } = state
                const { extensionAddress, extensionInitData } = deployData
                setDeployData({...deployData, extensionAddress, extensionInitData})
                setFarmingContract(farmMainContractAddress)
            }
        })
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

    const deploy = async () => {
        let error = false
        let deployTransaction = null
        setDeployLoading(true)
        try {
            const { setups, rewardTokenAddress, extensionAddress, extensionInitData } = deployData
            var factoryAddress = (await blockchainCall(getGlobalContract("factoryOfFactories").methods.get, getNetworkElement({ context, chainId }, "factoryIndices").farming)).factoryList
            factoryAddress = factoryAddress[factoryAddress.length - 1]
            factoryAddress = generation === 'gen2' ? factoryAddress : getNetworkElement({ context, chainId }, generation === 'gen2' ? regularNFT ? "farmGen2FactoryAddressRegular" : "farmGen2FactoryAddress" : "farmFactoryAddress")
            const farmFactory = newContract(context.NewFactoryABI, factoryAddress)
            const types = genConversion[generation].initTypes
            console.log(deployData)
            const encodedSetups = abi.encode([`tuple(${genConversion[generation].setupInfoTypes.join(',')})[]`], [setups])
            const params = genConversion[generation].getInitArray(extensionAddress, extensionInitData, rewardTokenAddress, encodedSetups)
            console.log(params)
            console.log(extensionInitData)
            console.log(extensionPayload)
            console.log(extensionAddress)
            var payload = (web3.eth.abi.encodeParameters(types, params))

            console.log(payload)
            deployTransaction = await blockchainCall(farmFactory.methods.deploy, payload)
            var receipt = await web3.eth.getTransactionReceipt(deployTransaction.transactionHash)
            var farmMainContractAddress = web3.eth.abi.decodeParameter("address", receipt.logs.filter(it => it.topics[0] === web3.utils.sha3('Deployed(address,address,address,bytes)'))[0].topics[2])
            console.log({farmMainContractAddress})
            !extensionAddress && setDeployData({...deployData, extensionAddress : params[0]})
            setFarmingContract(farmMainContractAddress)
        } catch (error) {
            console.log(error)
            error = true
        } finally {
            if (!error && deployTransaction) {
                setFarmingContract()
                await Promise.all(farmingSetups.map((_, i) => removeFarmingSetup(i)))
                setDeployStep(deployStep + 1)
            }
            setDeployLoading(false)
        }
    }

    const deployExtension = async () => {
        let error = false
        setDeployLoading(true)
        try {
            const { byMint, host, deployContract } = deployData
            if (!deployContract) {
                var factoryAddress = (await blockchainCall(getGlobalContract("factoryOfFactories").methods.get, getNetworkElement({ context, chainId }, "factoryIndices").farming)).factoryList
                factoryAddress = factoryAddress[factoryAddress.length - 1]
                factoryAddress = generation === 'gen2' ? factoryAddress : getNetworkElement({ context, chainId }, generation === 'gen2' ? regularNFT ? "farmGen2FactoryAddressRegular" : "farmGen2FactoryAddress" : "farmFactoryAddress")
                const farmFactory = newContract(context.NewFactoryABI, factoryAddress)
                const transaction = await blockchainCall(farmFactory.methods.cloneDefaultExtension)
                var nonce = parseInt(await sendAsync(farmFactory.currentProvider, "eth_getTransactionCount", farmFactory.options.address, web3Utils.toHex(parseInt(transaction.blockNumber) - 1)))
                var extensionAddress = "0x" + rlphash([farmFactory.options.address, nonce]).toString('hex').substring(24)
                console.log({extensionAddress})

                /*const cloneExtensionReceipt = await web3.eth.getTransactionReceipt(cloneExtensionTransaction.transactionHash)
                const extensionAddress = web3.eth.abi.decodeParameter("address", cloneExtensionReceipt.logs.filter(it => it.topics[0] === web3.utils.sha3('ExtensionCloned(address)'))[0].topics[1])*/
                const farmExtension = newContract(context[generation === 'gen2' ? "FarmExtensionGen2ABI" : "FarmExtensionGen1ABI"], extensionAddress)
                const extensionInitData = farmExtension.methods.init(byMint, host, treasuryAddress || VOID_ETHEREUM_ADDRESS).encodeABI()
                if(!extensionAddress) {
                    setExtensionPayload(extensionInitData)
                    setSelectedHost('deployedContract')
                    setDeployStep(null)
                    return setTimeout(() => alert('Error by the connected node while retrieving transaction info, please check your latest transaction on Etherscan and retrieve the deployed contract address located in the "Internal Txns" section (the one at the right side of the green arrow in the table)'))
                }
                setDeployData({ ...deployData, extensionAddress, extensionInitData })
            } else {
                const { abi, bytecode } = deployContract
                const payloadData = { from: account }
                const deployMethod = newContract(abi).deploy({ data: bytecode })
                const gasLimit = await deployMethod.estimateGas(payloadData)
                const extension = await deployMethod.send({ ...payloadData, gasLimit, gas: gasLimit })
                console.log(extension.options.address)
                setDeployData({ ...deployData, extensionAddress: extension.options.address })
            }
            setDeployStep(!error ? deployStep + 1 : deployStep)
        } catch (error) {
            console.log(error)
            error = true
        } finally {
            setDeployLoading(false)
        }
    }

    function filterDeployedContract(contractData) {
        var abi = contractData.abi
        if (abi.filter(abiEntry => abiEntry.type === 'constructor').length > 0) {
            return false
        }
        if (abi.filter(abiEntry => abiEntry.type === 'function' && abiEntry.stateMutability !== 'view' && abiEntry.stateMutability !== 'pure' && abiEntry.name === 'transferTo' && (!abiEntry.outputs || abiEntry.outputs.length === 0) && abiEntry.inputs && abiEntry.inputs.length === 1 && abiEntry.inputs[0].type === 'uint256').length === 0) {
            return false
        }
        if (abi.filter(abiEntry => abiEntry.type === 'function' && abiEntry.stateMutability === 'payable' && abiEntry.name === 'backToYou' && (!abiEntry.outputs || abiEntry.outputs.length === 0) && abiEntry.inputs && abiEntry.inputs.length === 1 && abiEntry.inputs[0].type === 'uint256').length === 0) {
            return false
        }
        return true
    }

    function onHasTreasuryAddress(e) {
        setTreasuryAddress("")
        setHasTreasuryAddress(e.target.checked)
    }

    function onTreasuryAddressChange(e) {
        var addr = e.currentTarget.value
        setTreasuryAddress(isEthereumAddress(addr) ? addr : "")
    }

    function onHostSelection(e) {
        setSelectedHost(e.target.value)
        setHostWalletAddress("")
        setHostDeployedContract("")
        setExtensionPayload("")
        setUseDeployedContract(false)
        setTreasuryAddress("")
        setHasTreasuryAddress(false)
        setDeployContract(null)
    }

    function canDeploy() {
        if (!selectedHost) {
            return false
        }
        if (selectedHost === 'address') {
            if (hasTreasuryAddress && !isEthereumAddress(treasuryAddress)) {
                return false
            }
            return isEthereumAddress(hostWalletAddress)
        }
        if (selectedHost === 'fromSourceCode') {
            if (useDeployedContract) {
                return isEthereumAddress(hostDeployedContract)
            }
            return deployContract !== undefined && deployContract !== null
        }
        return isEthereumAddress(hostDeployedContract)
    }

    const getCreationComponent = () => {
        return <div className={style.uuuuTokenLoad}>
            <div className={style.FancyExplanationCreate}>
                <h6>Reward token address</h6>
                <p className={style.BreefRecapB}>The reward token is the token chosen to reward farmers and can be one per contract.</p>
                <div className={style.proggressCreate}>
                    <div className={style.proggressCreatePerch} style={{width: "33%"}}>Step 1 of 3</div>
                </div>
            </div>
            <TokenInputRegular tokenOnly onElement={setSelectedRewardToken} selected={selectedRewardToken}/>
            {selectedRewardToken && selectedRewardToken.address !== VOID_ETHEREUM_ADDRESS && <div>
                <div className={style.CreationPageLabelF}>
                    <h6>Origin of funds</h6>
                    <select className={style.CreationSelectW} value={byMint === true ? "true" : "false"} onChange={e => setByMint(e.target.value === 'true')}>
                        <option value="">Select method</option>
                        <option value="true">By mint</option>
                        <option value="false">By reserve</option>
                    </select>
                    <p> If “by reserve” is selected, the input token will be sent from a wallet. If “by mint” is selected, it will be minted and then sent. The logic of this action must be carefully coded into the extension! To learn more, read the <a target="_blank" href="https://docs.ethos.wiki/covenants/">Documentation</a></p>
                </div>
            </div>}
            <div className={style.ActionBTNCreateX}>
                <a className={style.Web3BackBTN} onClick={() => setGeneration("")}>Back</a>
                {selectedRewardToken && <a className={style.RegularButton} onClick={() => setDeployStep(0)}>Start</a>}
            </div>
        </div>
    }

    const getDeployComponent = () => {

        if (deployLoading) {
            return <OurCircularProgress/>
        }

        if (deployStep === 1) {
            return <div>
                <div>
                    <h6><b>Deploy extension</b></h6>
                </div>
                <div>
                    <a onClick={() => setDeployStep(0)}>Back</a>
                    <a onClick={() => deployExtension()}>Deploy extension</a>
                </div>
            </div>
        } else if (deployStep === 2) {
            return <div>
                <div>
                    <h6><b>Deploy Farming Contract</b></h6>
                </div>
                <div>
                    <a onClick={() => setDeployStep(hostDeployedContract ? 0 : 1)}>Back</a>
                    <a onClick={() => deploy()}>Deploy contract</a>
                </div>
            </div>
        } else if (deployStep === 3) {
            return <div>
                <div>
                    <h6><b>Deploy successful!</b></h6>
                </div>
            </div>
        }

        return (
            <div className={style.CreatePage}>
                <div>
                <div className={style.FancyExplanationCreate}>
                <h6>Host</h6>
                <p className={style.BreefRecapB}>The host is the wallet, contract, dApp or Organization with permissions to manage this Farming Contract. <a target="_blank" href="https://docs.ethos.wiki/covenants/">Technical Documentation</a>.</p>
                <div className={style.proggressCreate}>
                    <div className={style.proggressCreatePerchLast} style={{width: "100%"}}>Step 3 of 3</div>
                </div>
                </div>
                <select className={style.CreationSelect} value={selectedHost} onChange={onHostSelection}>
                    <option value="">Host type</option>
                    <option value="address">Standard (Address, wallet)</option>
                    <option value="deployedContract">Custom (Deployed Contract)</option>
                    {/*<option value="fromSourceCode">Custom Extension (Deploy Contract)</option>*/}
                </select>
                </div>
                {
                    selectedHost === 'address' ? <>
                        <div className={style.CreationPageLabelF}>
                            <h6>Host Address</h6>
                            <input type="text" value={hostWalletAddress || ""} onChange={(e) => setHostWalletAddress(e.target.value.toString())} placeholder={"Wallet address"} aria-label={"Host address"} />
                            <p>The address who has hosting permissions for this contract. The host can manage new setups and ending early existing setups.</p>
                        </div>
                        <div className={style.CreationPageLabelF}>
                            <h6>External Treasury</h6>
                            <input type="checkbox" checked={hasTreasuryAddress} onChange={onHasTreasuryAddress} />
                            {hasTreasuryAddress && <input type="text" value={treasuryAddress || ""} onChange={onTreasuryAddressChange} placeholder={"Treasury address"} aria-label={"Treasury address"} />}
                            <p>[Optional] You can choose a treasury other than the extension to which unissued tokens are returned to at the end of the setups.</p>
                        </div>
                    </> : selectedHost === 'fromSourceCode' ? <>
                        <div>
                            <p>Deploy a custom extension contract. In the IDE, we loaded a simple extension contract, and you can use it as a guide. Before building a custom contract, we kindly recommend reading the Covenants Documentation. Do it at your own risk.</p>
                        </div>
                        <div>
                        </div>
                        <div>
                        <h6>Extension payload</h6>
                            <div>
                                <input type="text" value={extensionPayload || ""} onChange={(e) => setExtensionPayload(e.target.value.toString())} placeholder={"Payload"} aria-label={"Payload"} />
                            </div>
                        </div>
                    </> : selectedHost === 'deployedContract' ? <>
                        <div className={style.CreationPageLabelF}>
                            <h6>Custom Extension Address</h6>
                            <input type="text" value={hostDeployedContract} onChange={(e) => setHostDeployedContract(e.target.value.toString())} placeholder="Insert extension address" aria-label={"Deployed contract address"} />
                        </div>
                        <div className={style.CreationPageLabelF}>
                            <h6>[Optional] Extension payload</h6>
                            <input type="text" value={extensionPayload || ""} onChange={(e) => setExtensionPayload(e.target.value.toString())} placeholder={"Payload"} aria-label={"Payload"} />
                        </div>
                    </> : <></>
                }
                <div className={style.ActionBTNCreateX}>
                    <a className={style.Web3BackBTN} onClick={() => {
                        setSelectedHost(null)
                        setIsDeploy(false)
                    }}>Back</a>
                    <a className={style.RegularButton} onClick={() => {
                        if (!canDeploy()) {
                            return
                        }
                        initializeDeployData().then(createActionSequence)
                    }} disabled={!canDeploy()}>Deploy</a>
                </div>
            </div>
        )
    }

    const getFarmingContractStatus = () => {
        return (
            <div>
                <div className={style.FancyExplanationCreate}>
                    <h6>Manage Setups</h6>
                    <p className={style.BreefRecapB}>Covenants farming contracts are able to manage multiple setups. Every setup can reward a single LP with a custom Reward/Block and duration.</p>
                    {!onEditSuccess && <div className={style.proggressCreate}>
                        <div className={style.proggressCreatePerch} style={{width: "66%"}}>Step 2 of 3</div>
                    </div>}
                </div>

                <CreateOrEditFarmingSetups
                    rewardToken={selectedRewardToken}
                    farmingSetups={farmingSetups}
                    onAddFarmingSetup={addFarmingSetup}
                    onRemoveFarmingSetup={removeFarmingSetup}
                    onEditFarmingSetup={editFarmingSetup}
                    onCancel={() => setDeployStep()}
                    onFinish={() => setIsDeploy(true)}
                    generation={generation}
                    finishButton={finishButton}
                />
            </div>
        )
    }

    if (farmingContract) {
        return (
            <div className={style.CreatePage}>
                <h3>🎉Farming Contract Deployed!🎉</h3>
                <div className={style.AndNowBox}>
                    <h6>And Now?<br></br>👇</h6>
                </div>

                {/*If choosen by wallet*/}
                {selectedHost === 'wallet' ? <>
                <div className={style.FancyExplanationCreate}>
                    <p className={style.BreefRecapB}>Before attempting to activate the contract’s setups, <b>remember to send at least {fromDecimals(totalRewardToSend, selectedRewardToken?.decimals, true)} {selectedRewardToken?.symbol}</b> to the extension contract:</p>
                    <a className={style.RegularButton} href={getNetworkElement({ context, chainId }, "etherscanURL") + "address/" + deployData?.extensionAddress} target="_blank">{deployData?.extensionAddress}</a><a onClick={()=>copyToClipboard(deployData?.extensionAddress)} className={style.RegularButton}>Copy</a>
                    {/*Calculate total needed taking into acount repet in setups*/}
                    <p className={style.BreefRecapB}>Taking into account all of the Renewable Setups, the total amount of tokens needed, is {fromDecimals(cumulativeRewardToSend, selectedRewardToken?.decimals, true)} {selectedRewardToken?.symbol} </p>
                </div>
                    {/*If choosen by wallet and the treasury is the Extension*/}
                    {!hasTreasuryAddress && <div className={style.FancyExplanationCreate}> <p className={style.BreefRecapB}>Unissued reward tokens will be transferred automagically to the Extension Contract once every farmed position withdraws their liquidity at the end of the setup.</p></div>}

                    {/*If choosen by wallet and the treasury is an address*/}
                    {hasTreasuryAddress && <>
                        <div className={style.FancyExplanationCreate}>
                            <p className={style.BreefRecapB}>Unissued reward tokens will be transferred automagically to the selected treasury address once every farmed position withdraws their liquidity at the end of the setup.</p>
                            <p className={style.BreefRecapB}>Treasury Address:</p>
                            <a href={getNetworkElement({ context, chainId }, "etherscanURL") + "address/" + treasuryAddress} target="_blank">{treasuryAddress}</a>
                        </div>
                    </>}
                </> : <>
                    <div className={style.FancyExplanationCreate}>
                        {/*If not choosen by wallet (custom extension contract)*/}
                        <p className={style.BreefRecapB}>Before attempting to activate the contract’s setups, <b>you first need to do do all of the actions needed to send at least {fromDecimals(totalRewardToSend, selectedRewardToken?.decimals, true)} {selectedRewardToken?.symbol}</b> to the extension contract:</p>
                        <a className={style.RegularButton} href={getNetworkElement({ context, chainId }, "etherscanURL") + "address/" + deployData?.extensionAddress} target="_blank">{deployData?.extensionAddress}</a><a onClick={()=>copyToClipboard(deployData?.extensionAddress)} className={style.RegularButton}>Copy</a>
                        <p className={style.BreefRecapB}>If you rule the extension via a DFO or a DAO, be sure to vote to grant permissions from its Treasury.</p>
                    </div>
                </>}
                <div className={style.FancyExplanationCreate}>
                    <p className={style.BreefRecapB}>Yuor Farming Contract is available via this link: </p>
                    <Link className={style.RegularButton} to={"/covenants/dapp/farming/" + farmingContract}>{process.env.PUBLIC_URL + "#/covenants/dapp/farming/" + farmingContract}</Link>
                    <p className={style.BreefRecapB}>If you have selected the “Repeat” function for a setup, don’t forget to keep track of how many tokens are in the extension. If one cycle ends and the extension doesn’t have the required amount of tokens for the next, it won’t be able to send them to the contract, and the setup will not repeat and instead deactivate. For more information on this, read the <a target="_blank" href="https://docs.ethos.wiki/covenants/">Documentation</a>.</p>
                </div>
            </div>
        )
    }

    if (isDeploy) {
        return (
            <div>
                <div>
                    {actionSequence && <ActionSequence {...{...actionSequence, onClose(){setActionSequence()}}}/>}
                    {getDeployComponent()}
                </div>
            </div>
        )
    }

    if(!generation) {
        if(element) {
            return <OurCircularProgress/>
        }
        return (<div className={style.CreatePage}>
            <div className={style.SelectGenFarm}>
                <div className={style.FancyExplanationCreate}>
                <h6>Covenants Farming</h6>
                <p className={style.BreefRecapB}>Build a farming contract with multiple customizable setups. Covenants farming contracts can be extended and governed by a wallet, an automated contract or an Organization.</p>
                </div>
                {true && <div className={style.CreateBoxDesc}>
                    <h6>Multi AMM</h6>
                    <p>Powered by the AMM aggregator, these contracts work with <b>Uniswap V2, Balancer V1, Mooniswap V1 and Sushiswap V1.</b></p>
                    <a className={style.RegularButtonDuo} onClick={() => void(setGeneration("gen1"), setRegularNFT(false))}>Select</a>
                </div>}
                {true && <div className={style.CreateBoxDesc}>
                    <h6>Uniswap V3</h6>
                    <p>Designed for <b>Uniswap v3</b>, these contracts enable secure farming and customizable price curves.</p>
                    <a className={style.RegularButtonDuo} onClick={() => void(setGeneration("gen2"), setRegularNFT(true))}>Select</a>
                </div>}
            </div>
        </div>)
    }

    return (
        <div className={style.CreatePage}>
            <div>
                {isNaN(deployStep) && getCreationComponent()}
                {!isNaN(deployStep) && getFarmingContractStatus()}
            </div>
        </div>
    )
}