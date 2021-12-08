import React from 'react'
import { Link } from 'react-router-dom'
import style from '../../../../all.module.css'

const Create = ({}) => {
  return (
    <div className={style.CreatePage}>
      <div className={style.CreateBoxDesc}>
      <h6>New Collection</h6>
        <p>Deploy an On-chain folder to manage and hosting your Items.</p>
        <Link className={style.CreateBTN} to="/items/dapp/create/collection">Start</Link>
      </div>
      <div className={style.CreateBoxDesc}>
      <h6>Manage a Collection</h6>
        <p>Manage Items into a collection you have the permissions to host. You can create new Items or mint more quantities in existing Items.</p>
        <Link className={style.CreateBTN} to="/items/dapp/create/item/">Start</Link>
      </div>
    </div>
  )
}

Create.menuVoice = {
  label : 'Create',
  path : '/items/dapp/create',
  contextualRequire : () => require.context('./', false, /.js$/)
}

export default Create