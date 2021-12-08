import React from 'react'

import { formatLink, useWeb3, useEthosContext } from '@ethereansos/interfaces-core'

import style from '../../../all.module.css'

export default ({item}) => {

    const context = useEthosContext()
    const { web3 } = useWeb3()

    async function onClick() {
        web3.currentProvider.request({
            method: 'wallet_watchAsset',
            params: {
                type: "ERC20",
                options: {
                    address : item.address,
                    name : item.name,
                    symbol : item.symbol,
                    decimals : item.decimals,
                    image : item.image.indexOf('data:') === 0 ? item.image : 'https:' + (formatLink({ context }, item.image))
                },
            },
            id: Math.round(Math.random() * 100000),
        }, (err, added) => {
            console.log('provider returned', err, added)
        })
    }

    return <a className={style.MetaBTN} onClick={onClick}>Add to metamask</a>
}