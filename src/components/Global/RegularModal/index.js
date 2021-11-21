import React from "react"

import style from "./modal.module.css"


const RegularModal = ({children, type, onClose}) => {

    return (
        <div onClick={onClose} className={style.ModalBack}>
            <div className={style[type]}>
                {onClose && <a onClick={onClose}>X</a>}
                {children}
            </div>
        </div>
    )
}

export default RegularModal