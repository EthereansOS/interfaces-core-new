import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './action-a-web3-button-small.module.css'

const ActionAWeb3ButtonSmall  = (props) => {
    return (
        
        <div className={style.ActionAWeb3ButtonSmall}>
            <button className={style.ActionAWeb3ButtonSmall}>Claim</button>
        </div>

    )
}

    export default ActionAWeb3ButtonSmall