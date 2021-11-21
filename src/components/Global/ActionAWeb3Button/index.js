import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './action-a-web3-button.module.css'

const ActionAWeb3Button  = (props, text) => {
    return (
        
        <div className={style.ActionAWeb3Button}>
            <button className={style.ActionAMain}>
            </button>
        </div>

    )
}

    export default ActionAWeb3Button