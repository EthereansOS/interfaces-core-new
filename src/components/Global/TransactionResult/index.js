import React from 'react'

import { useWeb3, useEthosContext, getNetworkElement } from 'interfaces-core'

import style from '../../../all.module.css'

export default ({ transactionHash }) => {

    var context = useEthosContext()

    var { chainId } = useWeb3()

    return (<div>
        <h4>Transaction done!</h4>
        <a target="_blank" href={`${getNetworkElement({ context, chainId }, "etherscanURL")}tx/${transactionHash}`}>#{transactionHash}</a>
    </div>)
}