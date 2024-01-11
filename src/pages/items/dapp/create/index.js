import React from 'react'
import { Link } from 'react-router-dom'
import style from '../../../../all.module.css'

const Create = ({}) => {
  return (
    <div className={style.MasCardLayer}>
      <div className={style.MasCard}>
        <div className={style.MasCardHeader}>
          <div>New Collection</div>
        </div>
        <div className={style.MasCardBody}>
          <p>Deploy an on-chain folder to manage and host your Items.</p>
        </div>
        <div className={style.MasCardBody}>
          <Link className={style.NextStep} to="/items/create/collection">
            Start
          </Link>
          <a
            target="_blank"
            className={style.ExtLinkButtonAlpha}
            href="https://docs.ethos.wiki/ethereansos-docs/organizations/delegations">
            Learn
          </a>
        </div>
      </div>

      <div className={style.MasCard}>
        <div className={style.MasCardHeader}>
          <div>Manage Collection</div>
        </div>
        <div className={style.MasCardBody}>
          <p>
            Manage Items in any Collection you have permission to host. You can
            create entirely new Items for the Collection, or mint more of old
            ones.
          </p>
        </div>
        <div className={style.MasCardBody}>
          <Link className={style.NextStep} to="/items/create/item">
            Start
          </Link>
          <a
            target="_blank"
            className={style.ExtLinkButtonAlpha}
            href="https://docs.ethos.wiki/ethereansos-docs/organizations/delegations">
            Learn
          </a>
        </div>
      </div>
    </div>
  )
}

Create.menuVoice = {
  label: 'Create',
  path: '/items/create',
  contextualRequire: () => require.context('./', false, /.js$/),
}

export default Create
