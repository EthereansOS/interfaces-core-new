import React from 'react'
import { usePlaceholder } from 'interfaces-core'
import { Link } from 'react-router-dom'


import style from '../../../all.module.css'
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