import { useWeb3 } from 'interfaces-core'
import React from 'react'
import { Link } from 'react-router-dom'

import style from '../../../all.module.css'

const IndexMain = () => {

  const web3Data = useWeb3()

  const { dualChainId } = web3Data

  return (
    <>
      <div className={style.CardLayerBanner}>
        <div className={style.CardLayerBannerDetail}>
          <h3>Lorem ipsum sim <br/> dolorem asid avec on</h3>
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