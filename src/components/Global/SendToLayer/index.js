import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useWeb3, useEthosContext, blockchainCall, sendAsync, getNetworkElement } from '@ethereansos/interfaces-core'

import { useOpenSea } from '../../../logic/uiUtilities'
import { tryRetrieveL1Address, tryRetrieveL2Address, createL2Token } from '../../../logic/optimism'

import OurCircularProgress from '../OurCircularProgress'
import RegularModal from '../RegularModal'
import TokenInputRegular from '../TokenInputRegular'
import ActionAWeb3Button from '../ActionAWeb3Button'
import ActionAWeb3Buttons from '../ActionAWeb3Buttons'

import style from '../../../all.module.css'

const TransferToL1 = props => {

    const { item, close } = props

    const context = useEthosContext()

    const seaport = useOpenSea()

    const web3Data = useWeb3()

    const data = useMemo(() => ({ context, seaport, ...web3Data }), [context, seaport, web3Data])

    const { getGlobalContract } = data

    const [element, setElemet] = useState({token : item, balance : '0', value : '0'})

    const onElement = useCallback((token, balance, value) => setElemet({ token, balance, value }), [])

    const onClick = useCallback(() => blockchainCall(getGlobalContract('L2StandardBridge').methods.withdraw, element.token.address, element.value, 8_000_000, '0x'), [data, element])

    return (<>
        <div>
        <p className={style.SubMiniBanner}><b>Please note:</b> We're using the Official Optimism Bridge. Bridging tokens back to L1 can take more than a week after the Network confirms the transaction.</p>
            <TokenInputRegular tokens={[item]} onElement={onElement} element={element} />
            <ActionAWeb3Button onClick={onClick} onSuccess={close}>Transfer</ActionAWeb3Button>
        </div>
    </>)
}

const TransferToL2 = props => {

    const { item, close } = props

    const context = useEthosContext()

    const seaport = useOpenSea()

    const web3Data = useWeb3()

    const data = useMemo(() => ({ context, seaport, ...web3Data }), [context, seaport, web3Data])

    const { web3, chainId, dualChainId, getGlobalContract } = data

    const switchToNetwork = useCallback(() => sendAsync(web3.currentProvider, 'wallet_switchEthereumChain', {chainId : "0x" + parseInt(dualChainId || Object.entries(context.dualChainId).filter(it => parseInt(it[1]) === chainId)[0][0]).toString(16)}), [chainId, dualChainId])

    const [l2Address, setL2Address] = useState(null)

    useEffect(() => !l2Address && void(setL2Address(null), tryRetrieveL2Address(data, item.address).then(setL2Address)), [dualChainId])

    const [element, setElemet] = useState({token : item, balance : '0', value : '0'})

    const onElement = useCallback((token, balance, value) => setElemet({ token, balance, value }), [])

    const onClick = useCallback(() => blockchainCall(getGlobalContract('L1StandardBridge').methods.depositERC20, element.token.address, l2Address, element.value, 8_000_000, '0x'), [data, element, l2Address])

    if(l2Address === null) {
        return <OurCircularProgress/>
    }

    if(!l2Address && !dualChainId) {
        return (<>
            <div>In order to find the L2 Token address</div>
            <a onClick={switchToNetwork} className={style.SendToL2}>Switch to Optimism</a>
        </>)
    }

    if(!l2Address && dualChainId) {
        return (<>
            <div>Be the first to tranfer this Item to Optimism! To start the procedure switch the network with the button below and deploy it on Optimism.</div>
            <ActionAWeb3Button onSuccess={() => tryRetrieveL2Address(data, item.address).then(setL2Address)} onClick={() => createL2Token(data, item)} className={style.SendToL2}>Create L2 Token</ActionAWeb3Button>
        </>)
    }

    if(l2Address && dualChainId) {
        return (<>
            <div>L2 Token address found!</div>
            <a onClick={switchToNetwork} className={style.SendToL1}>Switch back to Ethereum</a>
        </>)
    }

    return (<>
        <div>
        <p className={style.SubMiniBanner}><b>Please note:</b> We're using the Official Optimism Bridge. Bridging tokens to Optimism can take up to 20 minutes after the Network confirms the transaction.</p>
            <TokenInputRegular tokens={[item]} onElement={onElement} element={element} />
            <ActionAWeb3Buttons token={element?.token} value={element?.value} balance={element?.balance} other={getNetworkElement(data, 'L1StandardBridgeAddress')} buttonText={"Bridge"} onClick={onClick} onSuccess={close}/>
        </div>
    </>)
}

const Components = [
    TransferToL1,
    TransferToL2
]

export default ({item}) => {

    const context = useEthosContext()

    const seaport = useOpenSea()

    const web3Data = useWeb3()

    const data = useMemo(() => ({ context, seaport, ...web3Data }), [context, seaport, web3Data])

    const { dualChainId } = data

    const [flag, setFlag] = useState()

    const [componentIndex, setComponentIndex] = useState()

    const close = useCallback(() => setComponentIndex(), [])

    const onClick = useCallback(() => setComponentIndex(flag ? 0 : 1), [flag])

    useEffect(() => {
        if(!dualChainId) {
            return setFlag(false)
        }
        if(item.l2Address) {
            return setFlag(true)
        }
        setFlag(null)
        tryRetrieveL1Address(data, item.address).then(result => setFlag(result ? true : undefined))
    }, [dualChainId])

    const Component = Components[componentIndex]

    return <>
        {Component && <RegularModal close={close}>
            <Component item={{...item, address : item.l2Address || item.address}} close={close}/>
        </RegularModal>}
        {flag === null && <OurCircularProgress/>}
        {flag === true && <a className={style.SendToL1} onClick={onClick}>Send to Ethereum</a>}
        {flag === false && <a className={style.SendToL2} onClick={onClick}>Send to Optimism</a>}
    </>
}