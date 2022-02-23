import React from 'react'

import style from '../../../all.module.css'

const ExtLinkButton = ({href, text, className}) => {

    function onClick() {
        window.open(href, '_blank').focus()
    }

    return (
        <button onClick={onClick} className={style.ExtLinkButton + (className ? ` ${style[className]}` : '')}>{text || "Open"}</button>
    )
}

export default ExtLinkButton