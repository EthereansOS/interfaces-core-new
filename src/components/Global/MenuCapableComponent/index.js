import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useLocation } from 'react-router'
import {
  retrieveComponentsByReflection,
  retrieveSavedPath,
} from '../../../logic/uiUtilities'
import style from '../../../all.module.css'

import DappMenu from './../../../components/Global/DappMenu'
import DoubleDappMenu from './../../../components/Global/DoubleDappMenu'

const MenuCapableComponent = (props) => {
  const {
    className,
    contextualRequire,
    defaultComponentLabel,
    componentProps,
    nomenu,
  } = props

  const [componentIndex, setComponentIndex] = useState(null)

  const location = useLocation()

  var menuVoices =
    contextualRequire &&
    retrieveComponentsByReflection(
      contextualRequire.keys ? contextualRequire : contextualRequire(),
      'menuVoice',
      true
    ).map((it) => ({ ...it.menuVoice, Component: it }))
  menuVoices = menuVoices.filter(
    (it) => it.contextualRequire === contextualRequire
  )[0]
    ? menuVoices.map((it) => ({ ...it, label: it.subMenuLabel || it.label }))
    : menuVoices
  menuVoices = menuVoices.sort(
    (a, b) =>
      (isNaN(a.index) ? menuVoices.length : a.index) -
      (isNaN(b.index) ? menuVoices.length : b.index)
  )
  menuVoices = menuVoices.map((it, i) => ({
    ...it,
    onClick: !it.path && (() => setComponentIndex(i)),
  }))

  useEffect(() => {
    if (!menuVoices) {
      return
    }
    const chosenPath = retrieveSavedPath(
      menuVoices.map((it) => it.path),
      location.pathname
    )
    var selectedVoice = menuVoices.filter(
      (it) => it.path && it.path.toLowerCase() === chosenPath
    )[0]
    selectedVoice =
      selectedVoice ||
      menuVoices.filter((it) => it.label === defaultComponentLabel)[0]
    const newComponentIndex = menuVoices.indexOf(selectedVoice)
    try {
      newComponentIndex > -1 &&
        newComponentIndex !== componentIndex &&
        setComponentIndex(newComponentIndex)
    } catch (e) {
      console.log(e)
    }
  }, [location.pathname, menuVoices])

  var menuVoice =
    componentIndex !== undefined &&
    componentIndex !== null &&
    (menuVoices[componentIndex] || menuVoices[menuVoices.length - 1])

  var Component = menuVoice.Component
  menuVoice.contextualRequire &&
    menuVoice.contextualRequire !== contextualRequire &&
    (Component = MenuCapableComponent)

  const [selectedSubvoice, setSelectedSubVoice] = useState()

  const subMenuvoices =
    (menuVoice &&
      menuVoice.path === location.pathname &&
      menuVoice.subMenuvoices &&
      JSON.stringify(menuVoice.subMenuvoices)) ||
    ''

  useEffect(
    () =>
      setSelectedSubVoice(
        (menuVoice && menuVoice.subMenuvoices && menuVoice.subMenuvoices[0]) ||
          undefined
      ),
    [subMenuvoices]
  )

  var prps = {
    ...componentProps,
    selectedSubvoice: props.selectedSubvoice || selectedSubvoice,
    contextualRequire:
      menuVoice.contextualRequire &&
      menuVoice.contextualRequire !== contextualRequire &&
      menuVoice.contextualRequire,
  }

  return (
    <div className={style.SectionMinWidth}>
      <div className={className}>
        {!nomenu &&
          menuVoices &&
          !subMenuvoices &&
          menuVoices.filter((it) => it.label).length > 1 && (
            <>
              <DappMenu selected={componentIndex} voices={menuVoices} />
              <div className={style.ItemsExploreMainTitleArea}>
                <h2>
                  {' '}
                  {menuVoices[componentIndex] &&
                    menuVoices[componentIndex].label}
                 
                </h2>
                <Link
                    to="/covenants/create"
                    className={style.ItemsExploreMainCategoriesCreateElement}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"></path>
                      <path
                        d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"></path>
                      <path
                        d="M2.67004 18.9501L7.60004 15.6401C8.39004 15.1101 9.53004 15.1701 10.24 15.7801L10.57 16.0701C11.35 16.7401 12.61 16.7401 13.39 16.0701L17.55 12.5001C18.33 11.8301 19.59 11.8301 20.37 12.5001L22 13.9001"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"></path>
                    </svg>
                    <span>

                   Create
                    </span>
                  </Link>
                <p>
                  {location.pathname.includes('/routine/') ? 
                    'Routines are semi-automated periodic token transfers and/or swaps' : 'Create Farming Solution'  
                  }
                 
                </p>
              </div>
            </>
          )}
        {!nomenu &&
          menuVoices &&
          subMenuvoices &&
          menuVoices.filter((it) => it.label).length > 1 && (
            <>
              <DoubleDappMenu
                selected={componentIndex}
                voices={menuVoices}
                subvoices={menuVoice.subMenuvoices}
                selectedSubvoice={selectedSubvoice}
                setSelectedSubVoice={setSelectedSubVoice}
              />
            </>
          )}
        {Component && <Component {...prps} />}
      </div>
    </div>
  )
}

export default MenuCapableComponent
