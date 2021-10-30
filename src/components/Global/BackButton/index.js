import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './back-button.module.css'

const BackButton  = (props) => {
    return (
        
        <button className={style.BackButton}>Back</button>

    )
}

    export default BackButton