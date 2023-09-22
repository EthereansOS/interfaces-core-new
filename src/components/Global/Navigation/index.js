import React from 'react'
import { usePlaceholder, useWeb3 } from '@ethereansos/interfaces-core'
import { Link } from 'react-router-dom'
import { Typography } from '@ethereansos/interfaces-ui'

import style from '../../../all.module.css'

const Navigation = ({ menuName, isDapp, selected }) => {

  const web3Data = useWeb3()
  const { dualChainId } = web3Data

  const menuItems = usePlaceholder(menuName).filter(it => !dualChainId || (it.name !== 'Factories'))

  const navItem = (item) => {
    return (
      <Link className={style.NavigationItem + " " + style[item.name] + (item.link === selected ? (' ' + style.selected): '')} key={item.name} to={item.link}>
        <img className={style.Hand} src={`${process.env.PUBLIC_URL}/img/DiamondHand.png`}></img>
        <span>
           <img src={item.image}></img> <p>{item.label}</p>
        </span>
      </Link>
    )
  }

  return (
    <nav className={style.Navigation}>{menuItems.map((item) => navItem(item))}</nav>
  )
}

export default Navigation
