import React, { useEffect, useState } from 'react'

import { useLocation } from 'react-router'
import { retrieveComponentsByReflection, retrieveSavedPath } from '../../../logic/uiUtilities'

import DappMenu from './../../../components/Global/DappMenu'
import DoubleDappMenu from './../../../components/Global/DoubleDappMenu'

const MenuCapableComponent = props => {

    const {className, contextualRequire, defaultComponentLabel, componentProps, nomenu} = props

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
        const newComponentIndex = menuVoices.indexOf(selectedVoice)
        try {
            newComponentIndex > -1 && newComponentIndex !== componentIndex && setComponentIndex(newComponentIndex)
        } catch(e) {
            console.log(e)
        }
    }, [location.pathname, menuVoices])

    var menuVoice = componentIndex !== undefined && componentIndex !== null && (menuVoices[componentIndex] || menuVoices[menuVoices.length - 1])

    var Component = menuVoice.Component
    menuVoice.contextualRequire && menuVoice.contextualRequire !== contextualRequire && (Component = MenuCapableComponent)

    const [selectedSubvoice, setSelectedSubVoice] = useState()

    const subMenuvoices = (menuVoice && menuVoice.path === location.pathname && menuVoice.subMenuvoices && JSON.stringify(menuVoice.subMenuvoices)) || ""

    useEffect(() => setSelectedSubVoice((menuVoice && menuVoice.subMenuvoices && menuVoice.subMenuvoices[0]) || undefined), [subMenuvoices])

    var prps = {...componentProps, selectedSubvoice : props.selectedSubvoice || selectedSubvoice, contextualRequire : menuVoice.contextualRequire && menuVoice.contextualRequire !== contextualRequire && menuVoice.contextualRequire}

    return (
        <div className={className}>
            {!nomenu && menuVoices && !subMenuvoices && menuVoices.filter(it => it.label).length > 1 && <DappMenu selected={componentIndex} voices={menuVoices}/>}
            {!nomenu && menuVoices && subMenuvoices && menuVoices.filter(it => it.label).length > 1 && <DoubleDappMenu selected={componentIndex} voices={menuVoices} subvoices={menuVoice.subMenuvoices} selectedSubvoice={selectedSubvoice} setSelectedSubVoice={setSelectedSubVoice}/>}
            {Component && <Component {...prps}/>}
        </div>
    )
}

export default MenuCapableComponent