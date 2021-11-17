import React from 'react'

import ExploreCollections from '../../../../components/Items/ExploreCollections'

import style from './../../items-main.module.css'

var Create = () => (
  <div className={style.ItemsCreateMain}>
    <ExploreCollections/>
  </div>
)

/*Create.menuVoice = {
  label : 'Create',
  path : '/items/dapp/create'
}*/

export default Create