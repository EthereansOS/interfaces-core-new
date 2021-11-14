import React, { useEffect, useState } from 'react'

import { useLocation } from 'react-router'
import { retrieveComponentsByReflection } from '../../../logic/pluginUtils.js'

import DappMenu from './../../../components/Global/DappMenu/index.js'

const MenuCapableComponent = ({className, contextualRequire, defaultComponentLabel, componentProps}) => {

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
      const currentLocation = location.pathname.toString()
      const database = menuVoices.map(it => it.path && it.path.toLowerCase()).filter(it => it !== undefined && it !== null).sort((a, b) => a.localeCompare(b))

      var selectedVoices = database.filter(it => it === currentLocation)
      selectedVoices = selectedVoices.length > 0 ? selectedVoices : database.filter(it => it !== currentLocation && currentLocation.indexOf(it.split(':')[0]) !== -1 && it.split('/').length === currentLocation.split('/').length)
      selectedVoices = selectedVoices.length > 0 ? selectedVoices : database.filter(it => it !== currentLocation && currentLocation.indexOf(it.split(':')[0]) !== -1)
      selectedVoices = selectedVoices.length > 0 ? selectedVoices : database.filter(it => it !== currentLocation && it.split(':')[0].indexOf(currentLocation) !== -1)
      selectedVoices = selectedVoices.length > 0 ? selectedVoices : database.filter(it => it.label === defaultComponentLabel)
      selectedVoices = selectedVoices.length > 0 ? selectedVoices : database

      const chosenPath = selectedVoices[selectedVoices.length - 1]
      const selectedVoice = menuVoices.filter(it => it.path && it.path.toLowerCase() === chosenPath)[0]
      setComponentIndex(menuVoices.indexOf(selectedVoice))
    }, [location.pathname])

    var menuVoice = componentIndex !== undefined && componentIndex !== null && menuVoices[componentIndex]

    var Component = menuVoice.Component
    menuVoice.contextualRequire && menuVoice.contextualRequire !== contextualRequire && (Component = MenuCapableComponent)

    var prps = {...componentProps, contextualRequire : menuVoice.contextualRequire && menuVoice.contextualRequire !== contextualRequire && menuVoice.contextualRequire}

    return (
      <div className={className}>
        {menuVoices && <DappMenu voices={menuVoices}/>}
        {Component && <Component {...prps}/>}
      </div>
    )
  }

export default MenuCapableComponent