import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from '../../../all.module.css'

const RegularSelect  = (props) => {
    return (
        
        <div className={style.RegularSelect}>
            <select>
                <option>Test 1</option>
                <option>Test 1</option>
                <option>Test 1</option>
                <option>Test 1</option>
                <option>Test 1</option>
                <option>Test 1</option>
            </select>
            <div className={style.select_arrow}></div>
        </div>

    )
}

    export default RegularSelect