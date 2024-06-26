import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import style from '../../../all.module.css'
import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'

const IndexMain = () => {
  function showParticles(toBeShown) {
    var particlesDiv = document.getElementById('tsparticles')
    if (particlesDiv && toBeShown) {
      particlesDiv.style.visibility = 'visible'
    }
    if (particlesDiv && !toBeShown) {
      particlesDiv.style.visibility = 'hidden'
    }
  }

  useEffect(() => {
    showParticles(true)
    return () => {
      showParticles(false)
    }
  }, [])

  return (
    <>
      <ScrollToTopOnMount />
      <div className={style.CardLayerBanner}>
        <div className={style.CardLayerBannerDetail}>
          <div>
            <h1
              className={style.H1}
              style={{ paddingTop: '0px', marginTop: '0px' }}>
              <img src={`${process.env.PUBLIC_URL}/img/logo.png`} className={style.HomeBannerLogo} />
            </h1>
            <p>
              No-code tools for Ethereum.
              <br />
              Click. Create. Deploy.
            </p>
            <Link
              to="/covenants/create/farming/"
              className={style.BtnSecondary}
              style={{ marginRight: '10px' }}>
              New <b>Farm</b>
            </Link>
            <Link
              to="/organizations/create/organization"
              className={style.BtnSecondary}
              style={{ marginRight: '10px' }}>
              New <b>Organization</b>
            </Link>
            <Link
              to="/factories"
              className={style.BtnSecondary}
              style={{ marginRight: '10px' }}>
              New <b>Token</b>
            </Link>
          </div>
          <div>
            <div className={style.CardLayerBannerDetailImages}>
              <img src={`${process.env.PUBLIC_URL}/img/illustration_governance.webp`} />
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
            <p>
              Launch
              <br />
              Factory
            </p>
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
            <p>
              NFT
              <br />
              Items
            </p>
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
              <p>
                DAO
                <br />
                Organizations
              </p>
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
            <p>
              DeFi
              <br />
              Covenants
            </p>
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
