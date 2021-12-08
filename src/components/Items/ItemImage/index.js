import React from 'react'
import { OpenSeaContextProvider, useOpenSea } from '../../../logic/uiUtilities'
import { retrieveAsset } from '../../../logic/opensea'
import { blockchainCall, useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'
import LogoRenderer from '../../Global/LogoRenderer'
import OurCircularProgress from '../../Global/OurCircularProgress'

const Impl = (props) => {

    const context = useEthosContext()

    const seaport = useOpenSea()

    const { newContract, account } = useWeb3()

    async function onError() {
        var element = props.input
        if(element.wrapper) {
            const source = await blockchainCall(element.wrapper.methods.source, element.id)
            element = {
                id : (typeof source).toLowerCase() === 'string' ? '0' : (source[1] || '0'),
                mainInterface : {
                    options : {
                        address : (typeof source).toLowerCase() === 'string' ? source : source[0]
                    }
                }
            }
        }
        try {
            const asset = await retrieveAsset({context, seaport, newContract, account}, element.mainInterface.options.address, element.id)
            //console.log(asset)
            return asset.imageUrl
        } catch(e) {
            console.log(e)
        }
    }

    if(!props || !props.input) {
        return <OurCircularProgress/>
    }

    return <LogoRenderer {...{...props, onError}}/>
}

export default (props) => <OpenSeaContextProvider>
    <Impl {...props}/>
</OpenSeaContextProvider>