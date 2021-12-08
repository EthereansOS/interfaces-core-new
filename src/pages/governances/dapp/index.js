import { prepareAddToPlugin } from '../../../logic/uiUtilities'

import style from './organizations-main.module.css'

export default prepareAddToPlugin(
  require.context('./', true, /index.js$/),
  require.context('./', true, /.js$/),
  "Guilds",
  "/guilds/dapp",
  style.Web3PagesRoot,
  20,
  `${process.env.PUBLIC_URL}/img/is1.png`
)