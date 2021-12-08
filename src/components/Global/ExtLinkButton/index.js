import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from '../../../all.module.css'

const ExtLinkButton = ({href, text}) => {

    function onClick() {
        window.open(href, '_blank').focus();
    }

    return (
        <button onClick={onClick} className={style.ExtLinkButton}>{text || "Open"}</button>
    )
}

export default ExtLinkButton