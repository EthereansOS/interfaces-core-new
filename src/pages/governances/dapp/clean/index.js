import { cache } from 'interfaces-core'
import React, { useEffect } from 'react'

const Clean = () => {

    useEffect(() => {
        setImmediate(async () => {
            await cache.clear()
            window.location.href = window.location.href.split('/clean').join('')
            window.location.reload()
        })
    }, [])

    return (<h1>Cleaning Cache...</h1>)
}

Clean.menuVoice = {
  path : '/clean'
}

export default Clean