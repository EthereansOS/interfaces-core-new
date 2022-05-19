import React, { useState } from 'react'
import CircularProgress from '../OurCircularProgress'

import style from '../../../all.module.css'

const ActionAWeb3Button  = ({children, onClick, type, onSuccess, className, disabled}) => {

    var realType = type && (type = type[0].toUpperCase() + type.substring(1))

    const [loading, setLoading] = useState(null)

    async function onButtonClick() {
        if(!onClick) {
            return
        }
        setLoading(true)
        var errorMessage;
        try {
            var elem = onClick()
            elem && (elem = !elem.then ? elem : (await elem))
            onSuccess && setTimeout(() => onSuccess(elem))
        } catch(e) {
            errorMessage = e.message || e
        }
        setLoading(false)
        errorMessage && setTimeout(() => alert(errorMessage))
    }

    if(loading) {
        return <CircularProgress/>
    }

    return (
        <div className={!realType ? style.ActionAWeb3Button : style["ActionAWeb3Button" + realType]}>
            <button disabled={disabled} className={(!realType ? style.ActionAMain : style["ActionAWeb3Button" + realType]) + (className ? ' ' + className : '') + (disabled ? style.disabled : '')} onClick={onButtonClick}>
                {children}
            </button>
        </div>
    )
}

export default ActionAWeb3Button