import MenuCapableComponent from "../components/Global/MenuCapableComponent"

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

export function prepareAddToPlugin(contextualRequire, all, name, link, className, pluginIndex) {
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
                        className
                    },
                }))
                addElement('appMenu', {
                    name,
                    label: name,
                    link,
                    index
                })
            }
    }
}