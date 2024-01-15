import React from 'react'


import style from './factories-main.module.css'

const FactoriesMain = () => {
  return (
    <>
      <div className={style.ComingSoon}>
        <img src={`${process.env.PUBLIC_URL}/img/Factsoon.png`}></img>
        <h6>Coming soon. While you wait, you can play with the Factory contracts directly, with the help of the <a target="_blank" href="https://docs.ethos.wiki/ethereansos-docs/">documentation</a></h6>
      </div>
    </>
  )
}

FactoriesMain.pluginIndex = 40;
FactoriesMain.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/factories',
        Component: FactoriesMain,
        exact: true,
        requireConnection: true,
        templateProps: {
          menuName: 'appMenu',
          isDapp: true,
          link: '/factories'
        },
      })

      addElement('appMenu', {
        name: 'Factories',
        label: 'Factories',
        link: '/factories',
        index,
        image : `${process.env.PUBLIC_URL}/img/factories.png`,
      })
    }



export default FactoriesMain
