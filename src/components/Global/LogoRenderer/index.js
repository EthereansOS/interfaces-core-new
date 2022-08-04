import React, { useState, useEffect } from "react"

import CircularProgress from '../OurCircularProgress'
import { useEthosContext, formatLink, web3Utils, useWeb3 } from "@ethereansos/interfaces-core"
import { resolveToken } from "../../../logic/dualChain"
import { getAddress } from "../../../logic/uiUtilities"

import style from '../../../all.module.css'

const DEFAULT_IMAGE = `${process.env.PUBLIC_URL}/img/missingcoin.gif`

export default ({input, figureClassName, noFigure, title, defaultImage, noDotLink, onError, badge}) => {

    const realDefaultImage = defaultImage || DEFAULT_IMAGE

    const image = input && (typeof input === "string" ? input : input.image ? input.image : input.logoURI ? input.logoURI : input.image_url ? input.image_url : input.address)

    const context = useEthosContext()

    const web3Data = useWeb3()

    const { dualChainId } = web3Data

    const [finalImage, setFinalImage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [tried, setTried] = useState()
    const [hasBadge, setHasBadge] = useState(badge && input?.originalAddress !== undefined)

    useEffect(() => {
        setFinalImage(null)
    }, [image])

    useEffect(() => {
        setLoading(finalImage ? false : image === undefined || image === null)
        !finalImage && setFinalImage(!image ? realDefaultImage : image.toLowerCase().indexOf('0x') === 0 ? context.trustwalletImgURLTemplate.split("{0}").join(image) : formatLink({context}, image))
    }, [image, finalImage])

    /*useEffect(() => {
        if(!dualChainId || !badge) {
            return setHasBadge(false)
        }
        if(input.isL1) {
            return setHasBadge(true)
        }
        setTimeout(async () => {
            try {
                var originalAddress = getAddress(input)
                var tk = getAddress(await resolveToken({ context, ...web3Data }, originalAddress))
                return setHasBadge(tk !== originalAddress)
            } catch(e) {
                console.error(e)
            }
            return setHasBadge(false)
        })
    }, [dualChainId, badge])*/

    async function onLoadError() {
        setLoading((onError || dualChainId) ? true : false)
        if(!onError && !tried && dualChainId) {
            setTried(true)
            if((typeof input).toLowerCase() === 'string' || input.sourceAddress || input.tokenAddress || input.address) {
                var token = await resolveToken({ context, ...web3Data}, input?.sourceAddress || input?.tokenAddress || input?.address || input)
                var link = context.trustwalletImgURLTemplate.split('{0}').join(token)
                var key = link + '_url'
                try {
                    var loc = window.localStorage[key]
                    if(loc === undefined) {
                        var result = await (await fetch(link)).text()
                        loc = result.indexOf('404') === -1 ? 'true' : 'false'
                    }
                    if (loc === 'false') {
                        link = realDefaultImage
                    }
                    window.localStorage.setItem(key, loc)
                } catch(e) {
                    link = realDefaultImage
                    window.localStorage.setItem(key, 'false')
                }
                setFinalImage(link)
            }
        } else {
            setFinalImage((onError && await onError()) || realDefaultImage)
        }
        setLoading(false)
    }

    var src = finalImage
    try {
        src = src.split('//img').join('/img').split('//./img').join('./img').split('//data:').join('data:')
    } catch(e) {
    }

    if(src && src.indexOf('trustwallet') !== -1) {
        var split = src.split('/')
        try {
            split[split.length - 2] = web3Utils.toChecksumAddress(split[split.length - 2])
        } catch(e) {
            console.error(e)
        }
        src = split.join('/')
    }

    if(src && noDotLink) {
        src = src.split('.link').join('')
    }

    var img = <img title={title} style={ (finalImage === null || loading) ? {"display" : "none"} : {}} src={src} onLoad={() => setLoading(false)} onError={onLoadError}/>

    if(!noFigure) {
        var figureProperties = {}
        figureClassName && (figureProperties.className = figureClassName)
        input && input.background_color && (figureProperties.style={backgroundColor : input.background_color})
        input && input.isDeck && (figureProperties.className = (figureProperties.className || '') + (figureProperties.className ? ' ' : '') + style.Deck)
        img = <figure {...figureProperties}>
            {hasBadge && <span className={style.BollinoEth}>L1</span>}
            {false && <span className={style.BollinoOP}>L2</span>}
            {img}
        </figure>
    }

    if(finalImage === null || loading) {
        return <CircularProgress/>
    }

    return img
}