import ItemsMain from './pages/ItemsMain'
import CovenantsMain from './pages/CovenantsMain'
import OrganizationsMain from './pages/OrganizationsMain'
import FactoriesMain from './pages/FactoriesMain'

const initPlugin = ({ addElement }) => {
  ItemsMain.addToPlugin({index: 10})({ addElement })
  CovenantsMain.addToPlugin({index: 20})({ addElement })
  OrganizationsMain.addToPlugin({index: 30})({ addElement })
  FactoriesMain.addToPlugin({index: 40})({ addElement })
}

const appPlugin = {
  name: 'app-plugin',
  init: initPlugin,
}

export default appPlugin
