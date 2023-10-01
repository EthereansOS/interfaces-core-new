import React from 'react'
import { usePlaceholder } from 'interfaces-core'
import { Link } from 'react-router-dom'


import style from '../../../all.module.css'

const ActionInfoSection  = (props) => {
    return (

        <div className={style.ActionInfoSectionS}>
            <a className={style.ActionInfoSectionAMM}>
                <figure>
                    <img src={`${process.env.PUBLIC_URL}/img/test_amm.png`}></img>
                </figure>
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