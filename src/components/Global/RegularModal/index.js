import React from "react"

import style from '../../../all.module.css'


const RegularModal = ({children, type, close}) => {

    return (
        <div className={style.ModalBack}>
            <div className={style[type]}>
                {close && <a className={style.BackButton} onClick={close}>X</a>}
                {children}
            </div>
        </div>
    )
}

export default RegularModal