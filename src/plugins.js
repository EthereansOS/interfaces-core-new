const initPlugin = ({ addElement }) => {
  var contextualRequire = require.context('./pages', true, /(index.js$|dapp\/index.js$)/);
  var elements = contextualRequire.keys();
  var currentIndex = 0;
  for(var element of elements) {
    var Element = contextualRequire(element).default;
    Element.addToPlugin && Element.addToPlugin({index : (Element.pluginIndex || (currentIndex += 10))})({addElement});
  }
}

const appPlugin = {
  name: 'app-plugin',
  init: initPlugin,
}

export default appPlugin
