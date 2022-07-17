import React from 'react'
import { Link } from 'react-router-dom'
import style from '../../../../all.module.css'

const Create = ({}) => {
  return (<>
        <div className={style.CreatePage}>
          <div className={style.CreateBoxDesc}>
          <h6>New Collection</h6>
            <p>Deploy an on-chain folder to manage and host your Items.</p>
            <Link className={style.NextStep} to="/items/dapp/create/collection">Start</Link>
            <a target="_blank" className={style.ExtLinkButtonAlpha} href="https://docs.ethos.wiki/ethereansos-docs/organizations/delegations">Learn</a>
          </div>
          <div className={style.CreateBoxDesc}>
          <h6>Manage Collection</h6>
            <p>Manage Items in any Collection you have permission to host. You can create entirely new Items for the Collection, or mint more of old ones.</p>
            <Link className={style.NextStep} to="/items/dapp/create/item/">Start</Link>
            <a target="_blank" className={style.ExtLinkButtonAlpha} href="https://docs.ethos.wiki/ethereansos-docs/organizations/delegations">Learn</a>
          </div>
        </div>
    </>
  )
}

Create.menuVoice = {
  label : 'Create',
  path : '/items/dapp/create',
  contextualRequire : () => require.context('./', false, /.js$/)
}

export default Create