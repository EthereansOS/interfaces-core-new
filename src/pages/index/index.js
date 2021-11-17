import React from 'react'
import { Link } from 'react-router-dom'

import style from './index.module.css'

const IndexMain = () => {
  return (
    <div className={style.IndexPage}>
      <div className={style.BackgrowndFancy}>
        <img src={`${process.env.PUBLIC_URL}/img/ethos-main-bg.png`}></img>
      </div>
      <div className={style.IndexHeader}>
        <a className={style.IndexHeaderLogo}>
          <img src={`${process.env.PUBLIC_URL}/img/logo_main_v.png`}></img>
        </a>
        <div className={style.IndexHeaderMenu}>
          <a target="_blank">Products</a>
          <a target="_blank">Documentation</a>
          <a target="_blank">Governance</a>
          <a target="_blank">Community</a>
          <Link className={style.IndexHeaderDapp} to="/dapp">Launch App</Link>
        </div>
      </div>
      <div className={style.SuperTitle}>
        <h1>THE <span>ETHEREANS</span> OPERATING SYSTEM</h1>
      </div>
      <div className={style.Graphic}>
        <figure>
          <img src={`${process.env.PUBLIC_URL}/img/i-1.gif`}></img>
        </figure>
      </div>
      <div className={style.TextPart}>
        <h5>Security and decentralization without compromise for a New Ethereum Order</h5>
        <h6>The Ethereans Operating System is a layer for building any Ethereum applications powered by secure factories. Every EthOS application is built on top of cloned codes from factories, this ensures users that builders cannot make bugs or hide things in the code, basically every function is one audit to rule them all.</h6>
        <div className={style.TextPartBTN}>
          <Link className={style.IndexHeaderDapp} to="/dapp">Launch App</Link>
          <a className={style.IndexHeaderDappL}>Learn</a>
        </div>
      </div>
      <div className={style.Graphic}>
        <figure>
          <img src={`${process.env.PUBLIC_URL}/img/i-2.gif`}></img>
        </figure>
      </div>
      <div className={style.TextPart}>
      
        <h5>All in one dapp</h5>
        <h6>Ethereans Operating System enables devs to build their applications by using interoperable and secure tokens (Items), general-purpose DeFi contracts and granular governance structures. Using EthOS devs can focus only on their unique application case!</h6>
      </div>
      <div className={style.CardsLayer}>
        <a>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/c-2.png`}></img>
          </figure>
          <p>Factories</p>
        </a>
        <a>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/c-1.png`}></img>
          </figure>
          <p>Items</p>
        </a>
        <a>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/c-3.png`}></img>
          </figure>
          <p>Organizations</p>
        </a>
        <a>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/c-4.png`}></img>
          </figure>
          <p>Covenants</p>
        </a>
      </div>
      <div className={style.Graphic}>
        <figure>
          <img src={`${process.env.PUBLIC_URL}/img/i-3.gif`}></img>
        </figure>
      </div>
      <div className={style.TextPart}>
        <h5>Powerful tools for buidlers</h5>
        <h6>EthOS offers devs all the tools to easily implement secure dapps for any kind of need, helping them to integrate easily and securely all of the features needed for their project. Devs can use and build factories developed by anyone in the world. Reducing skills needed, repetitive building and audits like crazy!</h6>
        <div className={style.TextPartBTN}>
          <a className={style.IndexHeaderDappS}>Documentation</a>
          <a className={style.IndexHeaderDappL}>Github</a>
        </div>
      </div>
      <div className={style.Graphic}>
        <figure>
          <img src={`${process.env.PUBLIC_URL}/img/i-4.gif`}></img>
        </figure>
      </div>
      <div className={style.TextPart}>
        <h5>The first On-Chain Granular Governance, Ruled by OS</h5>
        <h6>EthOS is ruled by $OS and this is the first dapp implementing an on-chain granular governance in the entire Ethereum ecosystem. A step forward for on-chain governance models.</h6>
        <div className={style.TextPartBTN}>
          <a className={style.IndexHeaderDapp}>EthOS Organization</a>
          <a className={style.IndexHeaderDappL}>EthOS Governance</a>
        </div>
      </div>
      <div className={style.Footer}>
        <div className={style.FooterLinks}>
          <p> EthOS Platform is an R&D project in it's early days, use it at your own risk!</p> 
          <a>Github</a>
          <a>Discord</a>
          <a>Twitter</a>
          <a>Medium</a>
          <a>Press Kit</a>
        </div>
      </div>
    </div>
  )
}

IndexMain.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/',
        Component: IndexMain,
        exact: true,
        requireConnection: false,
        templateProps: {
          menuName: 'appMenu',
          isDapp: false,
          componentOnly: true,
        },
      })
    }

export default IndexMain