import React from 'react'
import { usePlaceholder, useWeb3 } from 'interfaces-core'
import { Link } from 'react-router-dom'

import style from '../../../all.module.css'

const Navigation = ({ menuName, isDapp, selected }) => {
  const web3Data = useWeb3()
  const { dualChainId } = web3Data

  const menuItems = usePlaceholder(menuName).filter(
    (it) => !dualChainId || it.name !== 'Factories'
  )

  const navItem = (item) => {
    return (
      <Link
        className={
          style.NavigationItem +
          ' ' +
          style[item.name] +
          (item.link === selected ? ' ' + style.selected : '')
        }
        key={item.name}
        to={item.link}>
        <img
          className={style.Hand}
          src={`${process.env.PUBLIC_URL}/img/6574bd6076d35e99769070d0_Ellipse 25.svg`}></img>
        <span>
          <img src={item.image}></img> <p>{item.label}</p>
        </span>
      </Link>
    )
  }

  return (
    <nav className={style.Navigation}>
      <h3 className={style.NavigationHeader}>Navigation<br/><span>Lorem ipsum sim dolorem</span></h3>
      {menuItems.map((item) => navItem(item))}
    </nav>
  )
}

export default Navigation
