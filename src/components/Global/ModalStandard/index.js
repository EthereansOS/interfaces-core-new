import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from '../../../all.module.css'

const ModalStandard  = (props) => {
    return (
        <div className={style.ModalBack}>
            {props.close && <a onClick={props.close}>X</a>}
            <div className={style.ModalBox}>
                {props.children}
            </div>
        </div>
    )
}

    export default ModalStandard