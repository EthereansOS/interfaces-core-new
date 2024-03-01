import React, { useEffect, useState } from 'react'

import OurCircularProgress from '../../Global/OurCircularProgress'

import ERC20 from './ERC20'
import NFT from './NFT'

import { blockchainCall, useEthosContext, useWeb3 } from 'interfaces-core'

import { loadTokenFromAddress } from '../../../logic/erc20'
import { useOpenSea } from '../../../logic/uiUtilities'
import { retrieveAsset } from '../../../logic/opensea'

import style from '../../../all.module.css'
import { resolveToken } from '../../../logic/dualChain'

export default ({item}) => {

    const context = useEthosContext()

    const web3Data = useWeb3()
    const { web3, account, newContract, dualChainId } = web3Data

    const seaport  = useOpenSea()

    const [token, setToken] = useState(null)

    useEffect(() => {
        setToken(null)
        setTimeout(async () => {
            var source = await blockchainCall(item.wrapper.methods.source, item.id)
            if(item.wrapType === 'ERC20') {
                try {
                    return setToken(await loadTokenFromAddress({context, seaport, ...web3Data}, source))
                } catch(e) {
                    console.log(e)
                }
            }
            setToken(await retrieveAsset({context, seaport : dualChainId ? null : seaport, newContract, account}, source[0], source[1]))
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