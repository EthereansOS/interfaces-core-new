import React from 'react'

import { Link } from 'react-router-dom'

import style from '../../../all.module.css'

export default ({voices, selected}) => (

    <ul className={style.SectionSubMenuItems}>
        {voices.filter(it => it.label).map((voice, i) => <li key={voice.path || voice.id} className={   (voice.label == 'Create' ? style.Hide : '') + ' ' + voice.label + (selected === i ? (' ' + style.SectionSubMenuItemsActive) : '')} >
        {voice.path && <Link  to={voice.path.substring(0, voice.path.indexOf(':') === -1 ? voice.path.length : voice.path.indexOf(':'))}>{voice.label}</Link>}
        {!voice.path && <a className={selected === i ? style.selected : ''} onClick={voice.onClick}>{voice.label}</a>}
        </li>)}
    </ul>
)

        {/* Covenants MENU START}
        <li><a>Farm</a></li>
        <li><a>Inflation</a></li>
        <li><a>Crafting</a></li>
        <li><a>WUSD</a></li>
        {Covenants MENU END */}