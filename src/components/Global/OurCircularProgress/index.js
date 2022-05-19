import React from 'react'

import { CircularProgress } from '@ethereansos/interfaces-ui'
import style from '../../../all.module.css'

export default ({}) => {
    return (
    <div className={style.LoaderA}>
        <CircularProgress/>
    </div>)
}