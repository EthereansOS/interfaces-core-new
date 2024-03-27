import React, { useEffect, useCallback, useState } from 'react'
import { useWeb3 } from 'interfaces-core'
import { Link } from 'react-router-dom'
import style from '../../../all.module.css'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'

const IndexMain = () => {
  const web3Data = useWeb3()

  const { dualChainId } = web3Data

  const [init, setInit] = useState(false)
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setInit(true)
    })
  }, [])

  const particlesLoaded = (container) => {
    console.log(container)
  }

  return (
    <>
      <ScrollToTopOnMount />

      <Particles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={{
          fpsLimit: 60,
          interactivity: {
            events: {
              onClick: {
                enable: false,
                mode: 'push',
              },
              onHover: {
                enable: false,
                mode: 'repulse',
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: '#ffffff',
            },
            links: {
              color: '#ffffff',
              distance: 150,
              enable: true,
              opacity: 0.1,
              width: 1,
            },
            move: {
              direction: 'none',
              enable: true,
              outModes: {
                default: 'bounce',
              },
              random: false,
              speed: 1,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.1,
            },
            shape: {
              type: 'circle',
            },
            size: {
              value: { min: 1, max: 5 },
            },
          },
          detectRetina: true,
        }}
      />
      <div className={style.CardLayerBanner}>
        <div className={style.CardLayerBannerDetail}>
          <div>
            <h3>Welcome to</h3>
            <h1 className={style.H1}>
              ethereans<span className={style.WhiteText}>os</span>_
            </h1>
            <p>
              No-code tools for Ethereum
              <br />
              Click, Create, Deploy.
            </p>
            <a className={style.BtnSecondary}  href='/#/items/create/collection' style={{marginRight:'10px'}}>
              New <b>Collection</b>
            </a>
            <a className={style.BtnSecondary}  href='/#/organizations/create/organization' style={{marginRight:'10px'}}>
              New <b>Organization</b>
            </a>
            <a className={style.BtnSecondary} href='/#/factories' style={{marginRight:'10px'}}>
              New <b>Token</b>
            </a>
          </div>
          <div>
            <div className={style.CardLayerBannerDetailImages}>
              <img src="https://media.discordapp.net/attachments/1195407928463724684/1220748754055991336/Illustration_governance.png?ex=661011df&is=65fd9cdf&hm=c253edcf4a79982fd213f1747bcdc0836771adafa6d5224ba73d9a134bdc6be4&=&format=webp&quality=lossless&width=1462&height=1210" />
            </div>
          </div>
        </div>
      </div>

      <div className={style.CardLayerTitleArea}>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>CREATE</div>
        </div>
        <div>
          <div>
            <h2>
              Deploy tokens, NFTs, DAOs and DeFi routines with EthereansOS
            </h2>
          </div>
        </div>
      </div>
      <div className={style.CardsLayerS}>
       <Link to="/factories" className={style.CardsFancy}>
         <div className={style.CardsLayerHeader}>
           <figure>
             <img src={`${process.env.PUBLIC_URL}/img/factories.png`}></img>
           </figure>
           <p>Launch Factory</p>
           <p className={style.CardsLayerBody}>
             Rapid, secure token deployment
           </p>
         </div>
       </Link>
        <Link to="/items" className={style.CardsFancy}>
          <div className={style.CardsLayerHeader}>
            <figure>
              <img src={`${process.env.PUBLIC_URL}/img/items.png`}></img>
            </figure>
            <p>Items</p>
            <p className={style.CardsLayerBody}>
              Hybrid NFT tokens with dynamic metadata
            </p>
          </div>
        </Link>
        {
          <Link to="/organizations" className={style.CardsFancy}>
            <div className={style.CardsLayerHeader}>
              <figure>
                <img
                  src={`${process.env.PUBLIC_URL}/img/organizations.png`}></img>
              </figure>
              <p>Organizations</p>
              <p className={style.CardsLayerBody}>
                Modular DAOs with true onchain governance
              </p>
            </div>
          </Link>
        }
        <Link to="/covenants" className={style.CardsFancy}>
          <div className={style.CardsLayerHeader}>
            <figure>
              <img src={`${process.env.PUBLIC_URL}/img/covenants.png`}></img>
            </figure>
            <p>Covenants</p>
            <p className={style.CardsLayerBody}>
              DeFi routines and farming contracts
            </p>
          </div>
        </Link>
      </div>
    </>
  )
}

IndexMain.addToPlugin =
  ({ index }) =>
  ({ addElement }) => {
    addElement('router', {
      index,
      path: '/',
      Component: IndexMain,
      exact: true,
      requireConnection: true,
      templateProps: {
        menuName: 'appMenu',
        isDapp: false,
      },
    })
  }

export default IndexMain
