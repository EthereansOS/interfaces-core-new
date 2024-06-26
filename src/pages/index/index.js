import React from 'react'
import { Link } from 'react-router-dom'

import { useEthosContext } from 'interfaces-core'

import style from './index.module.css'
import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'

const IndexMain = () => {
  const context = useEthosContext()

  return (
    <div className={style.IndexPage}>
      <ScrollToTopOnMount />

      <div className={style.BackgrowndFancy}>
        <img src={`${process.env.PUBLIC_URL}/img/ethos-main-bg.png`}></img>
      </div>
      <div className={style.IndexHeader}>
        <a className={style.IndexHeaderLogo}>
          <img src={`${process.env.PUBLIC_URL}/img/logo_main_v.png`}></img>
        </a>
        <div className={style.IndexHeaderMenu}>
          <a target="_blank" href="https://docs.ethos.wiki/ethereansos-docs/">
            Documentation
          </a>
          <a
            target="_blank"
            href="https://docs.ethos.wiki/ethereansos-docs/grimoire/ethereansos-governance">
            Governance
          </a>
          <a target="_blank" href={context.discordLink}>
            Community
          </a>
          <a target="_blank" href="https://ethereanslabs.com">
            The Lab
          </a>
          <Link className={style.IndexHeaderDapp} to="">
            Launch App
          </Link>
        </div>
      </div>
      <div className={style.SuperTitle}>
        <h1>
          THE <span>ETHEREANS</span> OPERATING SYSTEM
        </h1>
      </div>
      <div className={style.Graphic}>
        <figure>
          <img src={`${process.env.PUBLIC_URL}/img/i-2.gif`}></img>
        </figure>
      </div>
      <div className={style.TextPart}>
        <h5>Everything In One Place</h5>
        <h6>
          EthOS is a universal platform for doing everything on Ethereum. It
          features four protocols, all on-chain, all decentralized, all
          customizable, all interwoven. Factories offer a safe new way to code
          and earn revenue for developers. Items are dynamic tokens that work
          with all applications. Organizations are granular governance vehicles.
          Covenants are DeFi tools, built on an AMM Aggregator. Builders can
          mix-and-match from these as they see fit.
        </h6>
      </div>
      <div className={style.CardsLayer}>
        <a
          target="_blank"
          href="https://docs.ethos.wiki/ethereansos-docs/factories/factories-learn"
          className={style.CardsFancy}>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/c-2.png`}></img>
          </figure>
          <p>Factories</p>
          <span>A new secure way to build on Ethereum</span>
        </a>
        <a
          target="_blank"
          href="https://docs.ethos.wiki/ethereansos-docs/items/items-learn"
          className={style.CardsFancy}>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/c-1.png`}></img>
          </figure>
          <p>Items</p>
          <span>
            Overpowered token standard to unleash the power of new or existing
            ERC-20 and NFTs
          </span>
        </a>
        <a
          target="_blank"
          href="https://docs.ethos.wiki/ethereansos-docs/guilds/guilds-learn"
          className={style.CardsFancy}>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/c-3.png`}></img>
          </figure>
          <p>Organizations</p>
          <span>Fully on-chain and transparent governance systems</span>
        </a>
        <a
          target="_blank"
          href="https://docs.ethos.wiki/ethereansos-docs/covenants/covenants-learn"
          className={style.CardsFancy}>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/c-4.png`}></img>
          </figure>
          <p>Covenants</p>
          <span>Secure multi-AMM DeFi tools for every token or NFT</span>
        </a>
      </div>
      <div className={style.Graphic}>
        <figure>
          <img src={`${process.env.PUBLIC_URL}/img/i-1.gif`}></img>
        </figure>
      </div>
      <div className={style.TextPart}>
        <h5>A Codebase of Contracts, Secure to the Core</h5>
        <h6>
          Everything on EthOS—and EthOS itself—is powered by Factories, and the
          model contracts they deploy. With tamper-proof cores, these contracts
          can be cloned and customized by anyone to meet any variety of needs.
          Any developer can make a Factory, and even code it to earn them
          revenue. All Factories are part of a shared codebase and listed in a
          public marketplace here on the platform.
        </h6>
        <div className={style.TextPartBTN}>
          <Link className={style.IndexHeaderDapp} to="">
            Launch App
          </Link>
          <a
            target="_blank"
            href="https://docs.ethos.wiki/ethereansos-docs/"
            className={style.IndexHeaderDappL}>
            Learn
          </a>
        </div>
      </div>
      <div className={style.Graphic}>
        <figure>
          <img src={`${process.env.PUBLIC_URL}/img/i-3.gif`}></img>
        </figure>
      </div>
      <div className={style.TextPart}>
        <h5>Powerful Tools For Buidlers</h5>
        <h6>
          We provide all the parts you need to build state-of-the-art
          applications, and a secure environment in which to do so. For
          guidance, you have access to our full suite of documentation—over a
          hundred pages that will teach you how to use Factories, Items,
          Organizations and Covenants.
        </h6>
        <div className={style.TextPartBTN}>
          <a
            target="_blank"
            href="https://docs.ethos.wiki/ethereansos-docs/"
            className={style.IndexHeaderDappS}>
            Documentation
          </a>
          <a
            target="_blank"
            href="https://github.com/ethereansos"
            className={style.IndexHeaderDappL}>
            Github
          </a>
        </div>
      </div>
      <div className={style.Graphic}>
        <figure>
          <img src={`${process.env.PUBLIC_URL}/img/i-4.gif`}></img>
        </figure>
      </div>
      <div className={style.TextPart}>
        <h5>Purely On-Chain, Truly Decentralized and Governed by $OS</h5>
        <h6>
          Governed by $OS, the very first v2 Item, EthOS itself is the debut
          Organization of the platform. And like everything built on top of it,
          for the first ever time on Ethereum, it is entirely free from
          dependence on anything off-chain or centralized.
        </h6>
        <div className={style.TextPartBTN}>
          <Link
            to={'/organizations/' + context.ourSubDAO}
            className={style.IndexHeaderDapp}>
            EthOS Organization
          </Link>
          <a
            target="_blank"
            href="https://docs.ethos.wiki/ethereansos-docs/grimoire/ethereansos-governance"
            className={style.IndexHeaderDappL}>
            EthOS Governance
          </a>
          <a
            target="_blank"
            href="https://docs.ethos.wiki/ethereansos-docs/grimoire/os-economics"
            className={style.IndexHeaderDappL}>
            $OS Economics
          </a>
        </div>
      </div>
      <div className={style.Footer}>
        <img src={`${process.env.PUBLIC_URL}/img/footer.gif`}></img>
        <div className={style.FooterLinks}>
          <p>
            EthereansOS is an R&D project built by{' '}
            <a target="_blank" href="https://ethereanslabs.com">
              Ethereans Labs AG
            </a>{' '}
            still in its early days. Use it at your own risk.
          </p>
          <a target="_blank" href="https://github.com/ethereansos">
            Github
          </a>
          <a target="_blank" href={context.discordLink}>
            Discord
          </a>
          <a target="_blank" href="https://twitter.com/ethereansos">
            Twitter
          </a>
          <a target="_blank" href="https://medium.com/ethereansos">
            Medium
          </a>
        </div>
      </div>
    </div>
  )
}

/*IndexMain.addToPlugin =
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
    }*/

export default IndexMain
