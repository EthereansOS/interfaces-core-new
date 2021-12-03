import React, { useEffect, useState } from 'react'

import { useLocation } from 'react-router'
import { retrieveComponentsByReflection, retrieveSavedPath } from '../../../logic/uiUtilities.js'

import DappMenu from './../../../components/Global/DappMenu/index.js'

const MenuCapableComponent = ({className, contextualRequire, defaultComponentLabel, componentProps, nomenu}) => {

  const [componentIndex, setComponentIndex] = useState(null)

  const location = useLocation()

    var menuVoices = contextualRequire && retrieveComponentsByReflection(contextualRequire.keys ? contextualRequire : contextualRequire(), "menuVoice", true).map(it => ({...it.menuVoice, Component : it}))
    menuVoices = menuVoices.filter(it => it.contextualRequire === contextualRequire)[0] ? menuVoices.map(it => ({...it, label : it.subMenuLabel || it.label})) : menuVoices
    menuVoices = menuVoices.sort((a, b) => (isNaN(a.index) ? menuVoices.length : a.index) - (isNaN(b.index) ? menuVoices.length : b.index))
    menuVoices = menuVoices.map((it, i) => ({...it, onClick : !it.path && (() => setComponentIndex(i))}))

    useEffect(() => {
      if(!menuVoices) {
        return
      }
      const chosenPath = retrieveSavedPath(menuVoices.map(it => it.path), location.pathname)
      var selectedVoice = menuVoices.filter(it => it.path && it.path.toLowerCase() === chosenPath)[0]
      selectedVoice = selectedVoice || menuVoices.filter(it => it.label === defaultComponentLabel)[0]
      setComponentIndex(menuVoices.indexOf(selectedVoice))
    }, [location.pathname, menuVoices])

    var menuVoice = componentIndex !== undefined && componentIndex !== null && menuVoices[componentIndex]

    var Component = menuVoice.Component
    menuVoice.contextualRequire && menuVoice.contextualRequire !== contextualRequire && (Component = MenuCapableComponent)

    var prps = {...componentProps, contextualRequire : menuVoice.contextualRequire && menuVoice.contextualRequire !== contextualRequire && menuVoice.contextualRequire}

    return (
      <div className={className}>
        {!nomenu && menuVoices && menuVoices.filter(it => it.label).length > 0 && <DappMenu selected={componentIndex} voices={menuVoices}/>}
        {Component && <Component {...prps}/>}
      </div>
    )
  }

export default MenuCapableComponent