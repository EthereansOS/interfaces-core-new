import React, { useEffect, useCallback, useState } from 'react';
import { useWeb3 } from 'interfaces-core';
import { Link } from 'react-router-dom';
import style from '../../../all.module.css';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const IndexMain = () => {

  const web3Data = useWeb3()

  const { dualChainId } = web3Data

  const [ init, setInit ] = useState(false);
  useEffect(() => {
      initParticlesEngine(async (engine) => {
          await loadSlim(engine);
      }).then(() => {
          setInit(true);
      });
  }, []);

  const particlesLoaded = (container) => {
      console.log(container);
  };

  return (
    <>
    <Particles
            id="tsparticles"
            particlesLoaded={particlesLoaded}
            options={{
                fpsLimit: 60,
                interactivity: {
                    events: {
                        onClick: {
                            enable: false,
                            mode: "push",
                        },
                        onHover: {
                            enable: false,
                            mode: "repulse",
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
                        value: "#ffffff",
                    },
                    links: {
                        color: "#ffffff",
                        distance: 150,
                        enable: true,
                        opacity: 0.1,
                        width: 1,
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "bounce",
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
                        type: "circle",
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
          <h3>Welcome to</h3>
          <h1 className={style.H1}>ethereans<span className={style.WhiteText}>os</span>_</h1>
          <p>Donec ac vestibulum augue, eget molestie dolor. Morbi placerat urna eu<br/>dui auctor elementum. Mauris at mauris non mauris porta rutrum.</p>
          <a className={style.BtnPrimary}>New <b>Collection</b></a><a className={style.BtnSecondary}>New <b>Organization</b></a>
          </div>
        </div>
      <div className={style.CardsLayerS}>
        {!dualChainId && <Link to="/factories" className={style.CardsFancy}>
          <div className={style.CardsLayerHeader}>
            <figure>
              <img src={`${process.env.PUBLIC_URL}/img/factories.svg`}></img>
            </figure>
            <p>Factories</p>
          </div>
          <p className={style.CardsLayerBody}>Phasellus aliquet neque nec odio gravida fringilla. Aenean elementum orci pulvinar.</p>
        </Link>}
        <Link to="/items" className={style.CardsFancy}>
          <div className={style.CardsLayerHeader}>
            <figure>
              <img src={`${process.env.PUBLIC_URL}/img/items.svg`}></img>
            </figure>
            <p>Items</p>
          </div> 
          <p className={style.CardsLayerBody}>Phasellus aliquet neque nec odio gravida fringilla. Aenean elementum orci pulvinar.</p>
        </Link>
        {<Link to="/organizations" className={style.CardsFancy}>
          <div className={style.CardsLayerHeader}>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/organizations.svg`}></img>
          </figure>
          <p>Organizations</p>
          </div> 
          <p className={style.CardsLayerBody}>Phasellus aliquet neque nec odio gravida fringilla. Aenean elementum orci pulvinar.</p>
        </Link>}
        <Link to="/covenants" className={style.CardsFancy}>
        <div className={style.CardsLayerHeader}>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/covenants.svg`}></img>
          </figure>
          <p>Covenants</p>
          </div> 
          <p className={style.CardsLayerBody}>Phasellus aliquet neque nec odio gravida fringilla. Aenean elementum orci pulvinar.</p>
        </Link>
      </div>
    </>
      
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
        requireConnection: true,
        templateProps: {
          menuName: 'appMenu',
          isDapp: false,
        },
      })
    }

export default IndexMain