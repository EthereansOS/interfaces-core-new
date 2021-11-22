import React from "react"

import style from "./modal.module.css"


const RegularModal = ({children, type, close}) => {

    return (
        <div onClick={close} className={style.ModalBack}>
            <div className={style[type]}>
                {close && <a onClick={close}>X</a>}
                {children}
            </div>
        </div>
    )
}

export default RegularModal