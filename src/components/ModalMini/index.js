import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './modal-standard.module.css'
import TokensSelector from './tokens-selector.js'

const ModalMini  = (props) => {
    return (
        <div className={style.ModalBack}>
            <div className={style.ModalMiniBox}>
                <TokensSelector></TokensSelector>
            </div>
        </div>
    )
}

    export default ModalMini