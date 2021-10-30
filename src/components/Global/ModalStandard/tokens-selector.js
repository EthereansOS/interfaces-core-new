import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './modal-standard.module.css'
import ERC20TokenObject  from '../../../components/Global/ObjectsLists/index.js'

const TokensSelector  = (props) => {
    return (
                <div className={style.TokensSelector}>
                    <div className={style.TokensSelectorList}>
                        <ERC20TokenObject></ERC20TokenObject>
                    </div>
                    <div className={style.TokensSelectorCategories}>
                        <input type="text" placeholder="Search name or address"></input>
                        <div className={style.TokensSelectorCategoriesList}>
                            <a>Erc-20</a>
                            <a className={style.selected}>Items</a>
                            <a>Collections</a>
                        </div>
                    </div>
                </div>
            )
        }

    export default TokensSelector