import React, { useState, useEffect } from "react"

import CircularProgress from '../OurCircularProgress'
import { useEthosContext, formatLink, web3Utils, useWeb3 } from "@ethereansos/interfaces-core"
import { resolveToken } from "../../../logic/dualChain"

import style from '../../../all.module.css'

const DEFAULT_IMAGE = `${process.env.PUBLIC_URL}/img/missingcoin.gif`

export default ({input, figureClassName, noFigure, title, defaultImage, noDotLink, onError}) => {

    const realDefaultImage = defaultImage || DEFAULT_IMAGE

    const image = input && (typeof input === "string" ? input : input.image ? input.image : input.logoURI ? input.logoURI : input.image_url ? input.image_url : input.address)

    const context = useEthosContext()

    const web3Data = useWeb3()

    const [finalImage, setFinalImage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [tried, setTried] = useState()

    useEffect(() => {
        setFinalImage(null)
    }, [image])

    useEffect(() => {
        setLoading(finalImage ? false : image === undefined || image === null)
        !finalImage && setFinalImage(!image ? realDefaultImage : image.toLowerCase().indexOf('0x') === 0 ? context.trustwalletImgURLTemplate.split("{0}").join(image) : formatLink({context}, image))
    }, [image, finalImage])

    async function onLoadError() {
        setLoading(onError ? true : false)
        setFinalImage((onError && await onError()) || realDefaultImage)
        if(!onError && !tried) {
            setTried(true)
            if((typeof input).toLowerCase() === 'string' || input.address) {
                var token = await resolveToken({ context, ...web3Data}, input.address || input)
                var link = context.trustwalletImgURLTemplate.split('{0}').join(token)
                setFinalImage(link)
            }
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
        split[split.length - 2] = web3Utils.toChecksumAddress(split[split.length - 2])
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
            {img}
        </figure>
    }

    if(finalImage === null || loading) {
        return <CircularProgress/>
    }

    return img
}