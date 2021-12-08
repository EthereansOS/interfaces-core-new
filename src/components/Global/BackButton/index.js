import React from 'react'
import style from '../../../all.module.css'

export default ({onClick}) => {
    return (
        <button className={style.BackButton} onClick={onClick}>Back</button>
    )
}