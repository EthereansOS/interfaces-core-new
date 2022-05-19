import React, { useEffect, useState } from 'react'

import OurCircularProgress from '../../Global/OurCircularProgress'

import ERC20 from './ERC20'
import NFT from './NFT'

import { blockchainCall, useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'

import { loadTokenFromAddress } from '../../../logic/erc20'
import { useOpenSea } from '../../../logic/uiUtilities'
import { retrieveAsset } from '../../../logic/opensea'

import style from '../../../all.module.css'

export default ({item}) => {

    const context = useEthosContext()

    const { web3, account, newContract } = useWeb3()

    const seaport  = useOpenSea()

    const [token, setToken] = useState(null)

    useEffect(() => {
        setToken(null)
        setTimeout(async () => {
            const source = await blockchainCall(item.wrapper.methods.source, item.id)
            if(item.wrapType === 'ERC20') {
                return setToken(await loadTokenFromAddress({account, context, newContract, web3}, source))
            }
            setToken(await retrieveAsset({context, seaport, newContract, account}, source[0], source[1]))
        })
    }, [item])

    if(!token) {
        return <OurCircularProgress/>
    }

    const Component = item.wrapType === 'ERC20' ? ERC20 : NFT

    return <div className={style.WrapBoxItem}>
        <Component {...{token, nftType : item.wrapType}}/>
    </div>
}