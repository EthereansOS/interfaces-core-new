import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './ext-link-button.module.css'

const ExtLinkButton  = (props) => {
    return (
        
        <button target="_blank" className={style.ExtLinkButton}>Open</button>

    )
}

    export default ExtLinkButton