import React, { useEffect, useState } from 'react'

import { CircularProgress } from '@ethereansos/interfaces-ui'
import { abi, useEthosContext, useWeb3, shortenWord, toDecimals, fromDecimals, blockchainCall, VOID_ETHEREUM_ADDRESS } from '@ethereansos/interfaces-core'

import {preparePermit} from '../../../logic/ballot'

import style from './action-a-web3-buttons.module.css'

export default ({token, balance, value, other, buttonText, onClick, onPermitSignature}) => {

    const { account, chainId } = useWeb3()

    const [approved, setApproved] = useState(null)
    const [permitSignature, setPermitSignature] = useState(null)

    const [loading, setLoading] = useState(false)

    useEffect(() => onPermitSignature(permitSignature), [permitSignature])

    var otherAddress = (other && other.options && other.options.address) || other || VOID_ETHEREUM_ADDRESS

    async function refreshApprove() {
        setApproved(null)
        setLoading(false)
        var appr = false
        try {
            var allowance = await blockchainCall(token.contract.methods.allowance, account, otherAddress)
            appr = parseInt(balance) > 0 && parseInt(allowance) >= parseInt(balance)
        } catch(e) {
        }
        setApproved(appr)
    }

    useEffect(() => {
        refreshApprove()
    }, [account, token, balance, other])

    async function performAction() {
        setLoading(true)
        var errorMessage;
        try {
            var res = onClick(token, account, balance, value, other)
            res.then && await res
        } catch(e) {
            errorMessage = e.message || e
            console.error(e)
        }
        setLoading(false)
        !errorMessage && refreshApprove()
        errorMessage && setTimeout(() => alert(errorMessage))
    }

    async function performApprove() {
        setApproved(null)
        var errorMessage;
        try {
            await blockchainCall(token.contract.methods.approve, otherAddress, "0xffffffffffffffffffffff")
        } catch(e) {
            errorMessage = e.message || e
            console.error(e)
        }
        refreshApprove()
        errorMessage && setTimeout(() => alert(errorMessage))
    }

    async function performPermit() {
        setPermitSignature(null)
        try {
            var permitSignature = await preparePermit({account, chainId}, token.contract, other, value)
            setPermitSignature(permitSignature)
        } catch(e) {
            alert(e.message || e)
        }
    }

    return (
        <div className={style.ActionAWeb3Buttons}>
            {!token.mainInterface && approved !== null && <button disabled={parseInt(balance) === 0 || approved} className={style.ActionASide} onClick={performApprove}>Approve</button>}
            {token.mainInterface && token.passedAsERC20 && approved !== null && <button disabled={parseInt(balance) === 0 || approved} className={style.ActionASide} onClick={performApprove}>Approve</button>}
            {(approved === null || loading) && <CircularProgress/>}
            {!loading && <button disabled={parseInt(balance) === 0 || parseInt(value) === 0 || parseInt(value) > parseInt(balance) || (!approved && !token.mainInterface)} onClick={performAction} className={style.ActionAMain}>{buttonText || 'Swap'}</button>}
        </div>
    )
}