import React from 'react'
import { usePlaceholder } from 'interfaces-core'
import { Link } from 'react-router-dom'


import style from '../../../all.module.css'

const ItemLinkButton  = (props) => {
    return (

        <button target="_blank" className={style.ItemLinkButton}>Item</button>

    )
}

    export default ItemLinkButton