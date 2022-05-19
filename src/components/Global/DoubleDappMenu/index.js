import React from 'react'
import { Link } from 'react-router-dom'

import style from '../../../all.module.css'

const DoubleDappMenu = ({voices, selected, subvoices, selectedSubvoice, setSelectedSubVoice}) => {

  return (
    <div className={style.DDapp_Menu}>
      <ul className={style.DDapp_Menu1}>
        {voices.filter(it => it.label).map((voice, i) => <li key={voice.path || voice.id}>
          {voice.path && <Link className={voice.label + (selected === i ? (' ' + style.selected) : '')} to={voice.path.substring(0, voice.path.indexOf(':') === -1 ? voice.path.length : voice.path.indexOf(':'))}>{voice.label}</Link>}
          {!voice.path && <a className={selected === i ? style.selected : ''} onClick={voice.onClick}>{voice.label}</a>}
        </li>)}
      </ul>
      <ul className={style.DDapp_Menu2}>
        {subvoices.map(it => <li key={it}><a className={selectedSubvoice === it ? style.selected : undefined} onClick={() => setSelectedSubVoice(it)}>{it}</a></li>)}
      </ul>
    </div>
  )
}

export default DoubleDappMenu
