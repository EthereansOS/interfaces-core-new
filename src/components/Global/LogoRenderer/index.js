import React, { useState, useEffect, useMemo, useRef } from "react"

import CircularProgress from '../OurCircularProgress'
import { useEthosContext, formatLink, web3Utils, useWeb3, normalizeValue } from "@ethereansos/interfaces-core"
import { resolveToken } from "../../../logic/dualChain"
import { getAddress, useOpenSea } from "../../../logic/uiUtilities"

import style from '../../../all.module.css'
import { loadTokenFromAddress } from "../../../logic/erc20"

const DEFAULT_IMAGE = `${process.env.PUBLIC_URL}/img/missingcoin.gif`

export default ({input, figureClassName, noFigure, title, defaultImage, noDotLink, onError, badge}) => {

    const realDefaultImage = defaultImage || DEFAULT_IMAGE

    const image = input && (typeof input === "string" ? input : input.image ? input.image : input.logoURI ? input.logoURI : input.image_url ? input.image_url : input.address)

    const context = useEthosContext()

    const seaport = useOpenSea()

    const web3Data = useWeb3()

    const { dualChainId } = web3Data

    const [finalImage, setFinalImage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [tried, setTried] = useState()

    const hasBadge = useMemo(() => badge && input?.l2Address !== undefined, [badge, input])

    const imgRef = useRef(null)
    const previewRef = useRef(null)

    useEffect(() => {
        setFinalImage(null)
    }, [image])

    useEffect(() => {
        setLoading(finalImage ? false : image === undefined || image === null)
        !finalImage && setFinalImage(!image ? realDefaultImage : image.toLowerCase().indexOf('0x') === 0 ? context.trustwalletImgURLTemplate.split("{0}").join(image) : formatLink({context}, image))
    }, [image, finalImage])

    async function onLoadError() {
        setLoading(true)
        var val = realDefaultImage
        try {
            if(onError) {
                val = await onError()
            } else {
                try {
                    val = (await loadTokenFromAddress({ ...web3Data, seaport, context }, input.address || input)).image
                } catch(e) {}
            }
        } catch(e) {}
        setFinalImage(val)
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

    img = tryInstrumentImg(input, img, imgRef, previewRef, noFigure) || img

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

function tryInstrumentImg(input, img, imgRef, previewRef, noFigure) {

    if(!input?.id && !input?.tokenId && !input?.itemId) {
        return
    }

    var src = img?.props?.src?.toLowerCase() || ''

    if(!src) {
        return
    }

    if(src.indexOf(`${process.env.PUBLIC_URL}/img/`) === 0) {
        return
    }

    if(src.indexOf('opensea') !== -1) {
        return
    }

    if(src.indexOf('metadata.ens.domains') !== -1) {
        return
    }

    if(src.indexOf('tokens.1inch.io') !== -1) {
        return
    }

    if(src.indexOf('github.io') !== -1) {
        return
    }

    var oldOnLoad = img.props.onLoad
    img = <img {...{
        ...img.props,
        onLoad : () => void(oldOnLoad(), getSnapshot(imgRef.current, previewRef.current)),
        ref : imgRef,
        crossOrigin : 'anonymous'
    }}/>
    return (<>
        <div
            style={{
                "position" : "relative",
                "display" : noFigure ? "inline-block" : undefined,
                "height" : "100%"
            }}
            onMouseEnter={() => {
                if(imgRef.current && previewRef.current && previewRef.current.loaded) {
                    imgRef.current.style.visibility = 'visible'
                    previewRef.current.style.visibility = 'hidden'
                }
            }}
            onMouseLeave={() => {
                if(imgRef.current && previewRef.current && previewRef.current.loaded) {
                    previewRef.current.style.visibility = 'visible'
                    imgRef.current.style.visibility = 'hidden'
                }
            }}
        >
            <img
                ref={previewRef}
                style={{
                    "position" : "absolute",
                    "left" : "0",
                    "top" : "0"
                }}
                onLoad={() => {
                    if(imgRef.current && previewRef.current) {
                        previewRef.current.style.visibility = 'visible'
                        imgRef.current.style.visibility = 'hidden'
                        previewRef.current.loaded = true
                    }
                }}
            />
            {img}
        </div>
    </>)
}

function getSnapshot(img, preview) {
    try {
        const { naturalWidth, naturalHeight } = img

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        context.clearRect(0, 0, canvas.width = naturalWidth, canvas.height = naturalHeight)
        context.drawImage(img, 0, 0, canvas.width, canvas.height)
        preview.src = canvas.toDataURL()
    } catch(e) {
    }
}