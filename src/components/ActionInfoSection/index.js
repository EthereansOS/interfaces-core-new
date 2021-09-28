import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './action-info-section.module.css'

const ActionInfoSection  = (props) => {
    return (
        
        <div className={style.ActionInfoSection}>
            <div className={style.ActionInfoSectionText}>
                <p>Price Impact: 5%</p>
                <p>USDC &#x2192; ETH &#x2192; BJK</p>
            </div>
            <a className={style.ActionInfoSectionAMM}>
                <figure>
                    <img src={`${process.env.PUBLIC_URL}/img/test_amm.png`}></img>
                </figure>
                <span>▼</span>
            </a>
            <a className={style.ActionInfoSectionSettings}>
                <figure>
                    <img src={`${process.env.PUBLIC_URL}/img/settings.svg`}></img>
                </figure>
            </a>
        </div>

    )
}

    export default ActionInfoSection