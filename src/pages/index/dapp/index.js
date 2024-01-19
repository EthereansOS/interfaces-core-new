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
            <div>
              <h3>Welcome to</h3>
              <h1 className={style.H1}>ethereans<span className={style.WhiteText}>os</span>_ <img decoding="async" loading="lazy" width="50" height="50" className={style.CardLayerBannerDetailImage} src="https://peerduck.com/wp-content/uploads/2022/04/imaedwed67.png" srcset="https://peerduck.com/wp-content/uploads/2022/04/imaedwed67.png 80w, https://peerduck.com/wp-content/uploads/2022/04/imaedwed67-40x40.png 40w" sizes="(max-width: 80px) 100vw, 80px" ></img></h1>
              <p>Donec ac vestibulum augue, eget molestie dolor. Morbi placerat urna eu<br/>dui auctor elementum. Mauris at mauris non mauris porta rutrum.</p>
              <a className={style.BtnPrimary}>New <b>Collection</b></a><a className={style.BtnSecondary}>New <b>Organization</b></a>
            </div>
            <div>
            <div className={style.CardLayerBannerDetailImages}>
              <img src="https://toka.peerduck.com/wp-content/uploads/2022/05/rkgmv.png"/>
                <img src="https://toka.peerduck.com/wp-content/uploads/2022/05/colorful_lion_pop_art_portrait.png"/>
                  <img src="https://toka.peerduck.com/wp-content/uploads/2022/05/cutecat.png"/>
                    <img src="https://toka.peerduck.com/wp-content/uploads/2022/05/statue-bust-roman-david-sunglasses-symbol-bitcoin-innovative-money-blockchain-cryptocurrency.png"/>
                      <img src="https://toka.peerduck.com/wp-content/uploads/2022/05/krvjn.png"/>
                        <img src="https://toka.peerduck.com/wp-content/uploads/2022/05/colorful_lion_pop_art_portrait.png"/>
                          <img src="https://toka.peerduck.com/wp-content/uploads/2022/05/colorful_lion_pop_art_portrait.png"/>
                            <img src="https://toka.peerduck.com/wp-content/uploads/2022/03/z_18-2.png"/>
                              <img src="https://toka.peerduck.com/wp-content/uploads/2022/05/vklef.png"/>
                                <img src="https://toka.peerduck.com/wp-content/uploads/2022/05/lefn.png"/>
                                  <img src="https://toka.peerduck.com/wp-content/uploads/2022/03/abstract-34.png"/>
                                    <img src="https://toka.peerduck.com/wp-content/uploads/2022/05/colorful_lion_pop_art_portrait.png"/>
                                      <img src="https://toka.peerduck.com/wp-content/uploads/2022/05/colorful_lion_pop_art_portrait.png"/>
                                        <img src="https://toka.peerduck.com/wp-content/uploads/2022/05/colorful_lion_pop_art_portrait.png"/>
                                          <img src="https://toka.peerduck.com/wp-content/uploads/2022/05/colorful_lion_pop_art_portrait.png"/>
                                            <img src="https://toka.peerduck.com/wp-content/uploads/2022/03/Bear_Illustration.png"/>
                                              <img src="https://toka.peerduck.com/wp-content/uploads/2022/03/dfgh.png"/>
                                              
                                              </div>
            </div>
          </div>
        </div>

        <div className={style.CardLayerTitleArea}>
				  <div>
				    <div>
							CREATE						
            </div>
				  </div>
				  <div>
				    <div>
			        <h2>Want to become a creator?</h2>
            </div>
				  </div>
				<div>
          <div>
                Browse dozens of my other extraordinary art collections in the world’s largest NFT marketplace.
          </div>
				</div>
			</div>
      <div className={style.CardsLayerS}>
        {!dualChainId && <Link to="/factories" className={style.CardsFancy}>
          <div className={style.CardsLayerHeader}>
            <figure>
              <img src={`${process.env.PUBLIC_URL}/img/factories.png`}></img>
            </figure>
            <p>Factories</p>
            <p className={style.CardsLayerBody}>Phasellus aliquet neque nec odio gravida fringilla. Aenean elementum orci pulvinar.</p>
          </div>
         
        </Link>}
        <Link to="/items" className={style.CardsFancy}>
          <div className={style.CardsLayerHeader}>
            <figure>
              <img src={`${process.env.PUBLIC_URL}/img/items.png`}></img>
            </figure>
            <p>Items</p>
            <p className={style.CardsLayerBody}>Phasellus aliquet neque nec odio gravida fringilla. Aenean elementum orci pulvinar.</p>
          </div> 
         
        </Link>
        {<Link to="/organizations" className={style.CardsFancy}>
          <div className={style.CardsLayerHeader}>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/organizations.png`}></img>
          </figure>
          <p>Organizations</p>
          <p className={style.CardsLayerBody}>Phasellus aliquet neque nec odio gravida fringilla. Aenean elementum orci pulvinar.</p>
          </div> 
         
        </Link>}
        <Link to="/covenants" className={style.CardsFancy}>
        <div className={style.CardsLayerHeader}>
          <figure>
            <img src={`${process.env.PUBLIC_URL}/img/covenants.png`}></img>
          </figure>
          <p>Covenants</p>
          <p className={style.CardsLayerBody}>Phasellus aliquet neque nec odio gravida fringilla. Aenean elementum orci pulvinar.</p>
          </div> 
          
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