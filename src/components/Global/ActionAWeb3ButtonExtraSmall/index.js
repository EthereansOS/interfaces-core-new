import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './action-a-web3-button-extra-small.module.css'

const ActionAWeb3ButtonExtraSmall  = (props) => {
    return (
        
        <div className={style.ActionAWeb3ButtonExtraSmall}>
            <button className={style.ActionAWeb3ButtonExtraSmall}>Withdraw</button>
        </div>

    )
}

    export default ActionAWeb3ButtonExtraSmall