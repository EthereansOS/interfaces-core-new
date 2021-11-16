import { prepareAddToPlugin } from '../../../logic/uiUtilities'

import style from './items-main.module.css'

export default prepareAddToPlugin(
  require.context('./', true, /index.js$/),
  require.context('./', true, /.js$/),
  "Items",
  "/items/dapp",
  style.Web3PagesRoot,
  10
)