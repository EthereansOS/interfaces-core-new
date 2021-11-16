import { prepareAddToPlugin } from '../../../logic/uiUtilities'

import style from './organizations-main.module.css'

export default prepareAddToPlugin(
  require.context('./', true, /index.js$/),
  require.context('./', true, /.js$/),
  "Organizations",
  "/organizations/dapp",
  style.Web3PagesRoot,
  10
)