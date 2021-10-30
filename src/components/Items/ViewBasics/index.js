import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from './view-basics.module.css'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'

const ViewBasics = (props) => {
  return (
    <div className={style.ViewBasics}>
        <h5>Uni Bojack (UNIBJ)</h5>
        <ExtLinkButton></ExtLinkButton> {/* Contract - Contract Link */}
        <ExtLinkButton></ExtLinkButton> {/* Host - Host Link */}
        <ExtLinkButton></ExtLinkButton> {/* Website - Website Link */}
        <ExtLinkButton></ExtLinkButton> {/* Open Sea - Open Sea Link */}
        <ExtLinkButton></ExtLinkButton> {/* Uniswap - Uniswap Link */}
        <ExtLinkButton></ExtLinkButton> {/* Share - Share Link */}
    </div>
  )
}

export default ViewBasics
