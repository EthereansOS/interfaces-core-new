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
      <div className={style.OnlyMobileIndexBanner}>
        <p>This interface is not mobile ready at the moment.</p>
      </div>
      <div className={style.Graphic}>
        <figure>
          <img src={`${process.env.PUBLIC_URL}/img/i-2.gif`}></img>
        </figure>
      </div>
      <div className={style.TextPart}>
      
        <h5>Everything In One Place</h5>
        <h6>EthOS is a universal platform for doing everything on Ethereum. It features four protocols, all on-chain, all decentralized, all customizable, all interwoven. Factories offer a safe new way to code and earn revenue for developers. Items are dynamic tokens that work with all applications. Organizations are granular governance vehicles. Covenants are DeFi tools, built on an AMM Aggregator. Builders can mix-and-match from these as they see fit.</h6>
      </div>
      <div className={style.CardsLayer}>
        <a className={style.CardsFancy}>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/c-2.png`}></img>
          </figure>
          <p>Factories</p>
        </a>
          <a className={style.CardsFancy}>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/c-1.png`}></img>
          </figure>
          <p>Items</p>
        </a>
          <a className={style.CardsFancy}>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/c-3.png`}></img>
          </figure>
          <p>Organizations</p>
        </a>
          <a className={style.CardsFancy}>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/c-4.png`}></img>
          </figure>
          <p>Covenants</p>
        </a>
      </div>
      <div className={style.Graphic}>
        <figure>
          <img src={`${process.env.PUBLIC_URL}/img/i-1.gif`}></img>
        </figure>
      </div>
      <div className={style.TextPart}>
        <h5>A Codebase of Contracts, Secure to the Core</h5>
        <h6>Everything on EthOS—and EthOS itself—is powered by Factories, and the model contracts they deploy. With tamper-proof cores, these contracts can be cloned and customized by anyone to meet any variety of needs. Any developer can make a Factory, and even code it to earn them revenue. All Factories are part of a shared codebase and listed in a public marketplace here on the platform.</h6>
        <div className={style.TextPartBTN}>
          <Link className={style.IndexHeaderDapp} to="/dapp">Launch App</Link>
          <a className={style.IndexHeaderDappL}>Learn</a>
        </div>
      </div>
      <div className={style.Graphic}>
        <figure>
          <img src={`${process.env.PUBLIC_URL}/img/i-3.gif`}></img>
        </figure>
      </div>
      <div className={style.TextPart}>
        <h5>Powerful Tools For Buidlers</h5>
        <h6>We provide all the parts you need to build state-of-the-art applications, and a secure environment in which to do so. For guidance, you have access to our full suite of documentation—over a hundred pages that will teach you how to use Factories, Items, Organizations and Covenants.</h6>
        <div className={style.TextPartBTN}>
          <a target="_blank" href="https://docs.ethos.wiki/ethereansos-docs/" className={style.IndexHeaderDappS}>Documentation</a>
          <a target="_blank" href="https://github.com/ethereansos" className={style.IndexHeaderDappL}>Github</a>
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
          <a target="_blank" href="https://ethereansos.eth.link/#/governances/dapp/organizations/0xc28FfD843DCA86565597A1b82265df29A1642262" className={style.IndexHeaderDapp}>EthOS Organization</a>
          <a className={style.IndexHeaderDappL}>EthOS Governance</a>
        </div>
      </div>
      <div className={style.Footer}>
        <img src={`${process.env.PUBLIC_URL}/img/footer.gif`}></img>
        <div className={style.FooterLinks}>
          <p> EthOS Platform is an R&D project in it's early days, use it at your own risk!</p> 
          <a target="_blank" href="https://github.com/ethereansos" className={style.IndexHeaderDappL}>Github</a>
          <a target="_blank" href="https://discord.gg/G4qmxQFnYQ">Discord</a>
          <a target="_blank" href="https://twitter.com/ethereansos">Twitter</a>
          <a target="_blank" href="https://medium.com/ethereansos">Medium</a>
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