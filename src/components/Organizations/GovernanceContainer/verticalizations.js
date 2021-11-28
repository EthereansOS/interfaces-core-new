import React, { useState, useEffect } from 'react'

import { useWeb3, blockchainCall, fromDecimals, abi } from '@ethereansos/interfaces-core'

import { CircularProgress } from '@ethereansos/interfaces-ui'

export function HeaderOsInflationRateActiveSelection({proposal}) {

    const { block } = useWeb3()
    const [value, setValue] = useState(null)

    async function refresh() {
        setValue(null)
        var perc = await blockchainCall(proposal.organization.components.oSFixedInflationManager.contract.methods.lastTokenPercentage)
        setValue((fromDecimals(perc, 16, true)) + " %")
    }

    useEffect(() => {
        refresh()
    }, [proposal, block])

    return value || <CircularProgress/>
}

export function HeaderStateManagerVariable({proposal, name, decimals, suffix}) {

    const { block } = useWeb3()
    const [value, setValue] = useState(null)

    async function refresh() {
        setValue(null)
        try {
            var value = await blockchainCall(proposal.organization.components.stateManager.contract.methods.get, name)
            value = value.value
            value = abi.decode(["uint256"], value)[0].toString()
            value = fromDecimals(value, decimals)
            suffix && (value += suffix)
            setValue(value)
        } catch(e) {
        }
    }

    useEffect(() => {
        refresh()
    }, [proposal, block])

    return value || <CircularProgress/>
}

export function HeaderTokens({proposal, buyOrSell}) {
    const { block } = useWeb3()
    const [value, setValue] = useState(null)

    async function refresh() {
        setValue(null)
        try {

        } catch(e) {
            console.log(e)
        }
    }

    useEffect(() => {
        refresh()
    }, [proposal, block])

    return value || <CircularProgress/>
}