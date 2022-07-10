import React from 'react'
import { useOpenSea } from '../../../logic/uiUtilities'
import { retrieveAsset } from '../../../logic/opensea'
import { blockchainCall, formatLink, useEthosContext, getNetworkElement, useWeb3, sendAsync, web3Utils, abi } from '@ethereansos/interfaces-core'
import LogoRenderer from '../../Global/LogoRenderer'
import OurCircularProgress from '../../Global/OurCircularProgress'
import { getLogs } from '../../../logic/logger'
import { resolveToken } from '../../../logic/dualChain'

export default props => {

    const context = useEthosContext()

    const seaport = useOpenSea()

    const web3Data = useWeb3()
    const { newContract, account, web3, chainId } = web3Data

    async function onError() {
        var element = props.input
        if(element.wrapper) {
            if(element.collectionData && element.collectionData.slug) {
                return element.collectionData.imageUrl?.split('s120').join('s300')
            }
            const args = {
                address : element.wrapper.options.address,
                topics : [
                    web3Utils.sha3('Token(address,uint256,uint256)'),
                    [],
                    [],
                    abi.encode(["uint256"], [element.id])
                ],
                fromBlock : web3Utils.toHex(getNetworkElement({ context, chainId }, 'deploySearchStart')) || "0x0",
                toBlock : 'latest'
            }
            const logs = await getLogs(web3.currentProvider, 'eth_getLogs', args)
            if(logs.length === 0) {
                var source = await blockchainCall(element.wrapper.methods.source, element.id)
                var link = context.trustwalletImgURLTemplate.split('{0}').join(await resolveToken({ context, ...web3Data }, source))
                link = formatLink({ context }, link)
                return link
            }

            element = {
                id : abi.decode(["uint256"], logs[0].topics[2])[0].toString(),
                mainInterface : {
                    options : {
                        address : abi.decode(["address"], logs[0].topics[1])[0].toString()
                    }
                }
            }
            while(true) {
                try {
                    const asset = await retrieveAsset({context, seaport : chainId === 10 ? null : seaport, newContract, account}, element.mainInterface.options.address, element.id)
                    return asset.collection.imageUrl?.split('s120').join('s300')
                } catch(e) {
                    console.log(e)
                }
            }
        }
        try {
            const asset = await retrieveAsset({context, seaport : chainId === 10 ? null : seaport, newContract, account}, element.mainInterface.options.address, element.id)
            return asset.imageUrl?.split('s120').join('s300')
        } catch(e) {
            console.log(e)
        }
    }

    if(!props || !props.input) {
        return <OurCircularProgress/>
    }

    return <LogoRenderer {...{...props, onError}}/>
}