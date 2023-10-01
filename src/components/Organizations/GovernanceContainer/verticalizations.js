import React, { useState, useEffect } from 'react'

import { useWeb3, blockchainCall, fromDecimals, abi } from 'interfaces-core'

export function InflationRateActiveSelection({element}) {

    const { block } = useWeb3()
    const [value, setValue] = useState(null)

    async function refresh() {
        setValue(null)
        var perc = await blockchainCall((element.organization.components.fixedInflationManager || element.organization.components.oSFixedInflationManager).contract.methods.lastTokenPercentage)
        setValue((fromDecimals(perc, 16, true)) + " %")
    }

    useEffect(() => {
        refresh()
    }, [element, block])

    return value || <></>
}

export function HeaderStateManagerVariable({element, name, decimals, suffix}) {

    const { block } = useWeb3()
    const [value, setValue] = useState(null)

    async function refresh() {
        setValue(null)
        try {
            var value = await blockchainCall(element.organization.components.stateManager.contract.methods.get, name)
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
    }, [element, block])

    return value || <></>
}

export function HeaderTokens({element, buyOrSell}) {
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
    }, [element, block])

    return value || <></>
}