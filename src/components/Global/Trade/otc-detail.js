import React, { useEffect, useMemo, useState, useCallback } from 'react'

import Web3DependantList from '../Web3DependantList'
import { CircularProgress } from '@ethereansos/interfaces-ui'
import RegularModal from '../RegularModal'
import ActionAWeb3Buttons from '../ActionAWeb3Buttons'
import ActionAWeb3Button from '../ActionAWeb3Button'
import TokenInputRegular from '../TokenInputRegular'

import { useOpenSea } from '../../../logic/uiUtilities'
import { getItemOrders, getPaymentTokens } from '../../../logic/opensea'
import { useWeb3, fromDecimals, web3Utils, useEthosContext, getNetworkElement, VOID_ETHEREUM_ADDRESS, blockchainCall } from '@ethereansos/interfaces-core'
import { perform } from '../../../logic/uiUtilities'
import OurCircularProgress from '../OurCircularProgress'

import style from '../../../all.module.css'

const Record = ({item, element, refresh, buyOrSell}) => {

    const context = useEthosContext()

    const { account, newContract } = useWeb3()

    const seaport  = useOpenSea()

    const [loading, setLoading] = useState(null)

    async function onClick() {
        var cancel = web3Utils.toChecksumAddress(element.maker) === web3Utils.toChecksumAddress(account)
        if(cancel) {
            if(!window.confirm("Are you sure you want to cancel this order?")) {
                return;
            }
        }
        if(!cancel && !buyOrSell && element.paymentTokenContract.symbol === 'WETH') {
            var WETH = newContract(context.WETHABI, element.paymentToken)
            var wethBalance = await blockchainCall(WETH.methods.balanceOf, account)
            if(parseInt(wethBalance) < parseInt(element.currentPrice.toString())) {
                window.alert("You don't have enough WETH to fill this order, so you first operation will be to wrap them")
                await blockchainCall(WETH.methods.deposit, {value : element.currentPrice.toString().ethereansosSub(wethBalance)})
            }
        }
        return await perform({
            setLoading,
            call: () => seaport[(cancel ? "cancel" : "fulfill") + "Order"]({order : element, accountAddress : account}).then(async () => {
                if(cancel || !buyOrSell || element.paymentTokenContract.symbol !== 'WETH') {
                    return;
                }
                if(window.confirm('Order fulfilled succesffully. Do you want to unwrap your WETH to receive ETH?')) {
                    await blockchainCall(newContract(context.WETHABI, element.paymentToken).methods.withdraw, element.currentPrice.toString())
                }
            }).then(() => new Promise(ok => setTimeout(ok, 10000))),
            onSuccess : refresh
        })
    }

    return (
        <div className={style.TradeOTCBoxOrder}>
            <p className={style.TradeOTCBoxOrderQ}>
                <b>{fromDecimals(element.quantity.toString(), item.decimals, true)} {item.symbol}</b>
            </p>
            <p className={style.TradeOTCBoxOrderP}>
                Price:
                <br/>
                {fromDecimals(element.currentPrice.toString(), element.paymentTokenContract.decimals, true)} {buyOrSell ? element.paymentTokenContract.symbol.split('WETH').join('ETH') : element.paymentTokenContract.symbol}
            </p>
            {loading && <CircularProgress/>}
            {!loading && <button onClick={onClick}>{web3Utils.toChecksumAddress(element.maker) === web3Utils.toChecksumAddress(account) ? "Cancel" : buyOrSell ? "Sell" : "Buy"}</button>}
        </div>
    )
}

const PlaceOTCOrder = ({item, buyOrSell, onSuccess}) => {

    const seaport  = useOpenSea()

    const context = useEthosContext()

    const { account, chainId, newContract, web3 } = useWeb3()

    const [inputToken, setInputToken] = useState(null)

    const [outputToken, setOutputToken] = useState(null)

    const [outputTokens, setOutputTokens] = useState(null)

    const [openSeaRegistry, setOpenSeaRegistry] = useState()

    const [openseaAddress, setOpenseaAddress] = useState()

    function refreshOpenSeaRegistry() {
        setOpenSeaRegistry()
        seaport._wyvernProtocol.wyvernExchange.tokenTransferProxy.callAsync().then(setOpenseaAddress)
        seaport._wyvernProtocol.wyvernProxyRegistry.proxies.callAsync(account).then(setOpenSeaRegistry)
    }

    useEffect(() => {
        refreshOpenSeaRegistry()
    }, [seaport, account])

    const onClick = useCallback(() => {
        if(buyOrSell && outputToken?.token?.address === VOID_ETHEREUM_ADDRESS) {
            const WETH = outputTokens.filter(it => it.symbol === 'WETH')[0]
            if(parseInt(WETH.balance) < parseInt(outputToken.value)) {
                return blockchainCall(newContract(context.WETHABI, WETH.address).methods.deposit, {value : outputToken.value.ethereansosSub(WETH.balance)})
            }
        }

        if(!outputToken || !outputToken.token) {
            throw "Please select output token"
        }

        if(outputToken.token.address === item.address && outputToken.token.id === item.id) {
            throw "Please select another output token"
        }

        if(!outputToken.value || outputToken.value === '0') {
            throw "Price must be a valid number"
        }

        var data = {
            asset : {
                tokenId : item.id,
                tokenAddress : item.mainInterface.options.address,
                schemaName : "ERC1155"
            },
            accountAddress: account,
            quantity: inputToken?.value || "0",
            startAmount: parseFloat(fromDecimals(outputToken.value, outputToken.token.decimals, true)),
            paymentTokenAddress : (outputToken.token.interoperableInterface || outputToken.token.contract).options.address
        };

        if(parseFloat(data.quantity) <= 0) {
            throw item.symbol + " quantity must be a number greater than 0"
        }

        if(buyOrSell && data.paymentTokenAddress === VOID_ETHEREUM_ADDRESS) {
            data.paymentTokenAddress = outputTokens.filter(it => it.symbol === 'WETH')[0].address
        }

        return seaport[`create${buyOrSell ? 'Buy' : 'Sell'}Order`](data)
    }, [buyOrSell, outputToken, outputTokens, inputToken])

    const onSuccessInternal = useCallback(async () => {
        var index = outputTokens.indexOf(outputToken.token)
        var opts = [...outputTokens]
        var opt = {...outputToken, token : {...outputToken.token}}
        opt.balance = opt.token.balance = await blockchainCall(opt.token.contract.methods.balanceOf, account)
        opts[index] = opt.token

        if(buyOrSell && outputToken?.token?.address === VOID_ETHEREUM_ADDRESS) {
            var WETH = outputTokens.filter(it => it.symbol === 'WETH')[0]
            if(parseInt(WETH.balance) < parseInt(outputToken.value)) {
                index = outputTokens.indexOf(WETH)
                WETH = {...WETH, token : {...WETH.token}}
                WETH.balance = await blockchainCall(WETH.contract.methods.balanceOf, account)
                opts = [...opts]
                opts[index] = WETH
                setOutputTokens(opts)
                return setOutputToken({token : WETH})
            }
        }

        setOutputTokens(opts)
        setOutputToken(opt)

        return onSuccess()
    }, [buyOrSell, outputToken, outputTokens])

    useEffect(() => {
        setOutputTokens(null)
        setOutputToken(null)
        setTimeout(async () => {
            setOutputTokens(await getPaymentTokens({context, chainId, account, web3, newContract}))
        })
    }, [seaport, chainId, account])

    function onInputToken(_, balance, value) {
        setInputToken({
            token : item,
            balance,
            value
        })
    }

    function onOutputToken(token, balance, value) {
        setOutputToken({
            token,
            balance,
            value
        })
    }

    var token;
    var balance;
    var value;

    try {
        token = buyOrSell ? outputToken.token : inputToken.token
        balance = buyOrSell ? outputToken.balance : inputToken.balance
        value = buyOrSell ? outputToken.value : inputToken.value
    } catch(e) {
    }

    function initialize() {
        const proxyRegistry = newContract(context.OpenSeaRegistryProxyABI, seaport._wyvernProtocol.wyvernProxyRegistry.web3ContractInstance.address)
        return blockchainCall(proxyRegistry.methods.registerProxy)
    }

    return (
        <div>
            <h5>Place a new {buyOrSell ? "Buy" : "Sell"} order</h5>
            <TokenInputRegular onElement={onInputToken} tokens={[item]}/>
            <br/>
            <h7>For:</h7>
            <br/>
            {!outputTokens && <OurCircularProgress/>}
            {outputTokens && <TokenInputRegular onElement={onOutputToken} tokens={outputTokens} selected={outputToken?.token}/>}
            {buyOrSell && outputToken?.token?.address === VOID_ETHEREUM_ADDRESS && parseInt(outputTokens.filter(it => it.symbol === 'WETH')[0].balance) < parseInt(outputToken.value) && <p>You have insufficient WETH balance, so you'll wrap {fromDecimals(outputToken.value.ethereansosSub(outputTokens.filter(it => it.symbol === 'WETH')[0].balance), 18, true)} ETH first</p>}
            {openSeaRegistry === undefined && <OurCircularProgress/>}
            {openSeaRegistry === VOID_ETHEREUM_ADDRESS && <ActionAWeb3Button onSuccess={refreshOpenSeaRegistry} onClick={initialize}>Initialize</ActionAWeb3Button>}
            {openSeaRegistry && openSeaRegistry !== VOID_ETHEREUM_ADDRESS && <ActionAWeb3Buttons other={buyOrSell ? openseaAddress : openSeaRegistry} token={token} value={value} balance={balance} buttonText={buyOrSell && outputToken?.token?.address === VOID_ETHEREUM_ADDRESS && parseInt(outputTokens.filter(it => it.symbol === 'WETH')[0].balance) < parseInt(outputToken.value) ? "Wrap ETH" : "Place"} onClick={onClick} onSuccess={onSuccessInternal}/>}
        </div>
    )
}

export default ({item, buyOrSell, modal, close}) => {

    const context = useEthosContext()

    const { chainId, account, web3, newContract, getGlobalContract } = useWeb3()

    const seaport  = useOpenSea()

    const [discriminant, setDiscriminant] = useState(null)

    function refresh() {
        setDiscriminant(new Date().getTime())
    }

    useEffect(refresh, [item])

    return (
        <>
            {modal && <RegularModal close={close}>
                <PlaceOTCOrder item={item} buyOrSell={buyOrSell} onSuccess={() => void(refresh(), close())}/>
            </RegularModal>}
            <Web3DependantList
                Renderer={Record}
                renderedProperties={{item, refresh, buyOrSell}}
                provider={() => getItemOrders({context, chainId, account, web3, newContract, seaport, getGlobalContract}, item, buyOrSell)}
                discriminant={discriminant}
                emptyMessage={<h6>{`No ${buyOrSell ? 'Buy' : 'Sell'} orders for this Item`}</h6>}
            />
        </>
    )
}