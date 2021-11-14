import {retrieveComponentsByReflection} from './logic/pluginUtils'
export default {
    name: 'app-plugin',
    init({ addElement }) {
        const Elements = retrieveComponentsByReflection(require.context('./pages', true, /.js$/), 'addToPlugin', true)
        var currentIndex = 0
        for (const Element of Elements) {
          Element.addToPlugin({ index: (Element.pluginIndex || (currentIndex += 10)) })({ addElement })
        }
    }
}