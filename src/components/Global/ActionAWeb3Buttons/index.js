import React, { useEffect, useState } from 'react'

import { CircularProgress } from '@ethereansos/interfaces-ui'
import { blockchainCall, useWeb3, VOID_ETHEREUM_ADDRESS } from '@ethereansos/interfaces-core'

import style from './action-a-web3-buttons.module.css'

export default ({token, balance, value, other, buttonText, onClick}) => {

    const { account } = useWeb3()

    const [approved, setApproved] = useState(null)

    const [loading, setLoading] = useState(false)

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

    return (
        <div className={style.ActionAWeb3Buttons}>
            {approved !== null && <button disabled={parseInt(balance) === 0 || approved} className={style.ActionASide} onClick={performApprove}>Approve</button>}
            {(approved === null || loading) && <CircularProgress/>}
            {!loading && <button disabled={parseInt(balance) === 0 || parseInt(value) === 0 || parseInt(value) > parseInt(balance) || !approved} onClick={performAction} className={style.ActionAMain}>{buttonText || 'Swap'}</button>}
        </div>
    )
}