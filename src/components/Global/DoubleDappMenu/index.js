import React from 'react'
import { Link } from 'react-router-dom'

import style from '../../../all.module.css'

const DoubleDappMenu = ({voices, selected, subvoices, selectedSubvoice, setSelectedSubVoice}) => {

  return (
    <div className={style.DDapp_Menu}>
      <ul className={style.SectionSubMenuItems}>
        {voices.filter(it => it.label).map((voice, i) => <li key={voice.path || voice.id} className={voice.label + (selected === i ? (' ' + style.SectionSubMenuItemsActive) : '')}>
          {voice.path && <Link className={voice.label + (selected === i ? (' ' + style.SectionSubMenuItemsActive) : '')} to={voice.path.substring(0, voice.path.indexOf(':') === -1 ? voice.path.length : voice.path.indexOf(':'))}>{voice.label}</Link>}
          {!voice.path && <a className={selected === i ? style.SectionSubMenuItemsActive : ''} onClick={voice.onClick}>{voice.label}</a>}
        </li>)}
      </ul>
      <div className={style.ItemsExploreMainTitleArea}>
          <h2> {voices[selected].label}
              <Link to="/covenants/create" className={style.ItemsExploreMainCategoriesCreateElement}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2.67004 18.9501L7.60004 15.6401C8.39004 15.1101 9.53004 15.1701 10.24 15.7801L10.57 16.0701C11.35 16.7401 12.61 16.7401 13.39 16.0701L17.55 12.5001C18.33 11.8301 19.59 11.8301 20.37 12.5001L22 13.9001" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
              <span>Create</span>
              </Link>
          </h2>
          <p>Lorem ipsum sim dolor  {voices[selected].label}</p>
      </div>
      <ul className={style.ItemsExploreMainCategories}>
      {subvoices.map(it => (
        <li key={it} className={selectedSubvoice === it ? style.ItemsExploreMainCategoriesActive : undefined}>
          <a 
            href="javascript:void(0)" 
            style={selectedSubvoice === it ? {color: '#fff'} : undefined}
            onClick={(e) => {
              e.preventDefault(); 
              setSelectedSubVoice(it);
            }}
          >
            {it}
          </a>
        </li>
      ))}
      </ul>
    </div>
  )
}

export default DoubleDappMenu
