import React from 'react'

import ExploreCollections from '../../../../components/Items/ExploreCollections'

import style from './../../items-main.module.css'

var Create = () => (
    <>
      <div className={style.ComingSoon}>
        <img src={`${process.env.PUBLIC_URL}/img/fact.png`}></img>
        <h6>Coming Soon</h6>
      </div>
    </>
)

/*Create.menuVoice = {
  label : 'Create',
  path : '/items/dapp/create'
}*/

export default Create