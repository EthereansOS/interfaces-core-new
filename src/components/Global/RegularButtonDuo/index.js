import React from 'react'
import { usePlaceholder } from 'interfaces-core'
import { Link } from 'react-router-dom'


import style from '../../../all.module.css'

const RegularButtonDuo  = ({children, onClick}) => {
    return (
        <button className={style.RegularButtonDuo} onClick={onClick}>{children}</button>
    )
}

export default RegularButtonDuo