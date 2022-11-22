import { prepareAddToPlugin } from '../../../logic/uiUtilities'

import style from '../../factories/dapp/factories-main.module.css'

export default prepareAddToPlugin(
  require.context('./', true, /index.js$/),
  require.context('./', true, /.js$/),
  "Covenants",
  "/covenants",
  style.Web3PagesRoot,
  30,
  `${process.env.PUBLIC_URL}/img/is3.png`,
)