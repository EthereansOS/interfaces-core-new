import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from '../../../all.module.css'

const ActionAWeb3Buttons  = (props) => {
    return (
        
        <div className={style.ActionAWeb3Buttons}>
            <button className={style.ActionASide}>Approve</button>
            <button disabled className={style.ActionAMain}>Swap</button>
        </div>

    )
}

    export default ActionAWeb3Buttons