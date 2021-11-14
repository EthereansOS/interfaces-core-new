export function retrieveComponentsByReflection(contextualRequire, key, returnElement) {
    return contextualRequire.keys().map(element => {
        var Element = contextualRequire(element).default
        return Element && Element[key] ? returnElement ? Element : Element[key] : undefined
    }).filter(it => it !== undefined && it !== null)
}