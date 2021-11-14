import React, { useState, useEffect } from "react"

import { CircularProgress } from '@ethereansos/interfaces-ui'
import { useEthosContext } from "@ethereansos/interfaces-core"

const DEFAULT_IMAGE = `${process.env.PUBLIC_URL}/img/token_image_default.jpg`

export default ({input}) => {

    const image = input && (typeof input === "string" ? input : input.image ? input.image : input.logoURI ? input.logoURI : input.address)

    const context = useEthosContext()

    const [finalImage, setFinalImage] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(image !== undefined && image !== null)
        setFinalImage(!image ? DEFAULT_IMAGE : image.toLowerCase().indexOf('0x') === 0 ? context.trustwalletImgURLTemplate.split("{0}").join(image) : image)
    }, [image])

    return <>
        {finalImage === null || loading && <CircularProgress/>}
        <img style={ (finalImage === null || loading) ? {"display" : "none"} : {}} src={finalImage} onLoad={() => setLoading(false)} onError={() => void(setLoading(false), setFinalImage(DEFAULT_IMAGE))}/>
    </>
}