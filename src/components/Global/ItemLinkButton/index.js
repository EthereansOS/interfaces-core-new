import React from 'react'
import { usePlaceholder } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from '../../../all.module.css'

const ItemLinkButton  = (props) => {
    return (
        
        <button target="_blank" className={style.ItemLinkButton}>Item</button>

    )
}

    export default ItemLinkButton