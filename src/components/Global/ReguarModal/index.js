import React from "react"

import style from "./modal.module.css"

const RegularModal = ({children, type, onClose}) => {

    return (
        <div className={style[type]}>
            {onClose && <a onClick={onClose}>X</a>}
            {children}
        </div>
    )
}

export default RegularModal