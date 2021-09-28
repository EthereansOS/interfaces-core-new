import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './modal-standard.module.css'

const TokensSelector  = (props) => {
    return (
        <div className={style.ModalBack}>
            <div className={style.ModalBox}>
                <div className={style.TokensSelector}>
                
                </div>
            </div>
        </div>
    )
}

    export default TokensSelector