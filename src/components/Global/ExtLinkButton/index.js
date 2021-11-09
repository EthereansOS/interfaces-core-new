import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './ext-link-button.module.css'

const ExtLinkButton = (props) => {

    function onClick() {
        window.open(props.href, '_blank').focus();
    }

    return (
        <button onClick={onClick} className={style.ExtLinkButton}>{props.text || "Open"}</button>
    )
}

export default ExtLinkButton