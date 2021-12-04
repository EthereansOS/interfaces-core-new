import React, { useContext, useState, useEffect } from 'react'

import MenuCapableComponent from "../components/Global/MenuCapableComponent"
import { useLocation } from 'react-router'

import style from '../all.module.css'

export function retrieveComponentsByReflection(contextualRequire, key, returnElement) {
    return contextualRequire.keys().map(element => {
        var Element = contextualRequire(element).default
        return Element && Element[key] ? returnElement ? Element : Element[key] : undefined
    }).filter(it => it !== undefined && it !== null)
}

export function retrieveSavedPath(menuVoices, currentLocationInput) {
    const database = menuVoices.filter(it => it !== undefined && it !== null).map(it => it.toLowerCase()).sort((a, b) => a.localeCompare(b))

    const currentLocation = currentLocationInput.toLowerCase()

    var selectedVoices = database.filter(it => it === currentLocation)
    selectedVoices = selectedVoices.length > 0 ? selectedVoices : database.filter(it => selectedVoices.indexOf(it) === -1 && it !== currentLocation && currentLocation.indexOf(it.split(':')[0]) !== -1 && it.split('/').length === currentLocation.split('/').length)
    selectedVoices = selectedVoices.length > 0 ? selectedVoices : database.filter(it => selectedVoices.indexOf(it) === -1 && it !== currentLocation && currentLocation.indexOf(it.split(':')[0]) !== -1)
    selectedVoices = selectedVoices.length > 0 ? selectedVoices : database.filter(it => selectedVoices.indexOf(it) === -1 && it !== currentLocation && it.split(':')[0].indexOf(currentLocation) !== -1)
    selectedVoices = selectedVoices.length > 0 ? selectedVoices : database

    return selectedVoices[selectedVoices.length - 1]
}

export function prepareAddToPlugin(contextualRequire, all, name, link, className, pluginIndex, image, nomenu) {
    return {
        pluginIndex,
        addToPlugin: ({ index }) =>
            ({ addElement }) => {
                retrieveComponentsByReflection(all, "menuVoice").forEach((it, i) => it.path && addElement('router', {
                    ...it,
                    index: index + i,
                    Component: MenuCapableComponent,
                    requireConnection: true,
                    templateProps: {
                        ...it.templateProps,
                        contextualRequire,
                        menuName: 'appMenu',
                        isDapp: true,
                        link,
                        className,
                        nomenu
                    },
                }))
                addElement('appMenu', {
                    name,
                    label: name,
                    link,
                    image,
                    index
                })
            }
    }
}

const ThemeSelectorContext = React.createContext('themeSelector')

const themes = [
    {name : '💡', value:'light'},
    {name : '🕶', value:'dark'},
    {name : '🍀', value:'biz'},
]

export const ThemeSelectorContextProvider = ({children}) => {

    const { pathname } = useLocation()

    var currentTheme = themes[0]

    try {
        currentTheme = window.localStorage.theme || themes[0]
    } catch(e) {}

    const [theme, setTheme] = useState(currentTheme)

    useEffect(() => {
        try {
            window.localStorage.setItem("theme", theme)
        } catch(e) {
        }
    }, [theme])

    var value = {
        theme,
        themes,
        setTheme
    }

    return <ThemeSelectorContext.Provider value={value}>
        <div className={pathname.indexOf('/dapp') !== -1 ? style[theme] : undefined}>
            {children}
        </div>
    </ThemeSelectorContext.Provider>
}

export const useThemeSelector = () => useContext(ThemeSelectorContext)