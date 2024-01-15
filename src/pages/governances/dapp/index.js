import { prepareAddToPlugin } from '../../../logic/uiUtilities'

import style from '../../../all.module.css'

export default prepareAddToPlugin(
  require.context('./', true, /index.js$/),
  require.context('./', true, /.js$/),
  'Organizations',
  '/organizations',
  style.Web3PagesRoot,
  20,
  `${process.env.PUBLIC_URL}/img/organizations.png`
)
