import React from "react"
import style from '../../../../all.module.css'
import Trade from '../../../../components/Global/Trade'

const Bazar = () => {
    return (<div>
        <Trade/>
    </div>)
}

Bazar.menuVoice = {
    label : 'Token Swap',
    path : '/covenants',
    index : 0
}

export default Bazar
