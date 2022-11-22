import React, { Fragment, useCallback, useEffect, useState } from 'react'

import { useWeb3, useEthosContext, getNetworkElement, blockchainCall, VOID_ETHEREUM_ADDRESS, formatMoney, fromDecimals, web3Utils, abi, toDecimals, isEthereumAddress } from '@ethereansos/interfaces-core'

import { useLocation } from 'react-router-dom'

import OurCircularProgress from '../../../../components/Global/OurCircularProgress'
import FarmingComponent from '../../../../components/Covenants/farming/FarmingComponent'

import { getFarming } from '../../../../logic/farming'

import style from '../../../../all.module.css'

const ViewFarming = ({}) => {

    const context = useEthosContext()

    const web3Data = useWeb3()

    const { pathname } = useLocation()

    const [element, setElement] = useState()

    const refresh = useCallback(() => {
        setElement()
        var address = pathname.split('/')
        address = address[address.length - 1]
        address && isEthereumAddress(address) && getFarming({ context, ...web3Data }, address).then(setElement)
    }, [pathname])

    useEffect(refresh, [refresh])

    return (
        <div className={style.CovenantsMainBox}>
            {!element ? <OurCircularProgress/> : <FarmingComponent refresh={refresh} element={element}/>}
        </div>
    )
}

ViewFarming.menuVoice = {
    path : '/covenants/farming/:id',
    exact : false
}

export default ViewFarming