import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './regular-button-duo.module.css'

const RegularButtonDuo  = ({children, onClick}) => {
    return (
        <button className={style.RegularButtonDuo} onClick={onClick}>{children}</button>
    )
}

export default RegularButtonDuo