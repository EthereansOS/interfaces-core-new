import { prepareAddToPlugin } from '../../../logic/uiUtilities'

import style from '../../factories/dapp/factories-main.module.css'

const ItemsMain = () => {
  return (
    <>
      <div className={style.ComingSoon}>
        <img src={`${process.env.PUBLIC_URL}/img/ite.png`}></img>
        <h6>Coming soon. While you wait, you can play with the Items contracts directly, with the help of the <a target="_blank" href="https://docs.ethos.wiki/ethereansos-docs/">documentation</a></h6>
      </div>
    </>
  )
}

ItemsMain.pluginIndex = 40;
ItemsMain.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/items/dapp',
        Component: ItemsMain,
        exact: true,
        requireConnection: true,
        templateProps: {
          menuName: 'appMenu',
          isDapp: true,
          link: '/items/dapp'
        },
      })

      addElement('appMenu', {
        name: 'Items',
        label: 'Items',
        link: '/items/dapp',
        index,
        image : `${process.env.PUBLIC_URL}/img/is2.png`,
      })
    }

export default ItemsMain

/*export default prepareAddToPlugin(
  require.context('./', true, /index.js$/),
  require.context('./', true, /.js$/),
  "Items",
  "/items/dapp",
  style.Web3PagesRoot,
  10,
  `${process.env.PUBLIC_URL}/img/is2.png`,
)*/