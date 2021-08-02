import SamplePage1 from './pages/SamplePage1'
import SamplePage2 from './pages/SamplePage2'
import SamplePage3 from './pages/SamplePage3'

const initPlugin = ({ addElement }) => {
  SamplePage1.addToPlugin({index: 10})({ addElement })
  SamplePage2.addToPlugin({index: 20})({ addElement })
  SamplePage3.addToPlugin({index: 30})({ addElement })
}

const appPlugin = {
  name: 'app-plugin',
  init: initPlugin,
}

export default appPlugin
