import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from '../../../all.module.css'

const ModalStandard  = (props) => {
    return (
        <div className={style.ModalBack}>
            
            <div className={style.ModalBox}>
            {props.close && <a className={style.BackButton} onClick={props.close}>X</a>}
                {props.children}
            </div>
        </div>
    )
}

    export default ModalStandard